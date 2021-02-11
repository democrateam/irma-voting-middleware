var express = require('express')
var router = express.Router()

// middleware that is specific to this router
// TODO: use for admin authentication
router.use((req, res, next) => {
  // check the url, /login is permitted
  // check if the req has a cookie
  next()
})

// only admin route that does not require authentication
router.get('/login', (req, res) => {})

router.get('/logout', (req, res) => {})

// overview of all elections?
router.get('/', (req, res) => {
  let db = req.db
})

// new: create a new election
router.post('/new', function (req, res) {
  let db = req.db
  let sql = `INSERT INTO elections (name, question, options, start, end, participants) VALUES (?, ?, ?, ?, ?, ?);`
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
  db.run(sql, params, (err) => {
    if (err) {
      return res.status(403).json({ err: err.message })
    }
    return res.status(200).json({ msg: 'success' })
  })
})

module.exports = router
