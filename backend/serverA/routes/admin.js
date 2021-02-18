var express = require('express')
var router = express.Router()
const IrmaBackend = require('@privacybydesign/irma-backend')

const conf = require('../config/conf.json')

const irmaBackend = new IrmaBackend(conf.irma.url, {
  serverToken: conf.irma.auth_token,
})

// middleware that is specific to this router
// maybe: move to PROJECT_ROOT/middleware?
router.use((req, res, next) => {
  if (req.session.admin_auth || req.url.includes('/login/')) return next()
  res.status(403).json({ err: 'no cookie' })
})

// only admin route that does not require authentication
router.get('/login/start', (req, res) => {
  irmaBackend
    .startSession({
      '@context': 'https://irma.app/ld/request/disclosure/v2',
      disclose: [[['pbdf.sidn-pbdf.email.email']]],
    })
    .then(({ sessionPtr, token }) => {
      req.session.admin_auth = false
      req.session.admin_token = token
      return res.status(200).json(sessionPtr)
    })
    .catch((err) => res.status(403).json({ err: err }))
})

router.get('/login/finish', (req, res) => {
  irmaBackend
    .getSessionResult(req.session.admin_token)
    .then((result) => {
      if (!(result.proofStatus === 'VALID' && result.status === 'DONE'))
        throw new Error('not valid or session not finished yet')

      let mail = result.disclosed[0][0].rawvalue
      if (!conf.admins.includes(mail)) throw new Error('not an admin')

      req.session.admin_auth = true
      res.status(200).json({ msg: 'success' })
    })
    .catch((err) => res.status(403).json({ err: err }))
})

router.get('/logout', (req, res) => res.clearCookie('session'))

router.get('/elections', (req, res) => {
  try {
    let rows = req.db.prepare('SELECT * FROM elections').all()
    res.status(200).json(rows)
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
})

// new: create a new election
router.post('/new', function (req, res) {
  let db = req.db
  let stmt = db.prepare(
    `INSERT INTO elections (name, question, options, start, end, participants) VALUES (?, ?, ?, ?, ?, ?);`
  )
  let data = req.body

  // dd-mm-yyyy -> yyyy-mm-dd
  let convert_date = (dateStr) => dateStr.split('-').reverse().join('-')

  console.log(req.body)
  // TODO: validate data!!!
  let params = [
    data['election-name'],
    data['election-description'],
    data['election-options'],
    convert_date(data['election-start']),
    convert_date(data['election-end']),
    0,
  ]
  console.log(params)
  try {
    stmt.run(params)
  } catch (err) {
    if (err) {
      return res.status(403).json({ err: err.message })
    }
  }
  return res.status(200).json({ msg: 'success' })
})

router.delete('/:id/delete', (req, res) => {
  try {
    req.db.transaction(() => {
      req.db.prepare('DELETE FROM elections WHERE id = ?').run(req.params.id)
      req.db.prepare('DELETE FROM votingcards WHERE id = ?').run(req.params.id)
    })()
    res.status(204).end()
  } catch (err) {
    if (err) {
      console.log(err)
      res.status(400).json({ err: err.message })
    }
  }
})

module.exports = router
