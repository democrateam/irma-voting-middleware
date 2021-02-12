const express = require('express')
const conf = require('./../config/conf.json')
const IrmaBackend = require('@privacybydesign/irma-backend')

const irmaBackend = new IrmaBackend(conf.irma.url, {
  serverToken: conf.irma.auth_token,
})

var router = express.Router()

// Below are two routes that complete a disclosure session
// to get the necessary attributes to decide eligibility.
router.get('/disclose/start', (req, res) => {
  // send disclosure request to conf.irma.server

  irmaBackend
    .startSession({
      '@context': 'https://irma.app/ld/request/disclosure/v2',
      disclose: [
        [
          [
            'irma-demo.gemeente.personalData.initials',
            'irma-demo.gemeente.personalData.familyname',
            'irma-demo.gemeente.personalData.dateofbirth',
          ],
        ],
      ],
    })
    .then(({ sessionPtr, token }) => {
      req.session.disclosure_token = token
      req.session.authenticated = false
			if (conf.url) {
				sessionPtr.u = `https://${conf.url}/irma/${sessionPtr.u}`;
			} else {
				sessionPtr.u = `${conf.irma.url}/irma/${sessionPtr.u}`;
			}
      return res.status(200).json(sessionPtr)
    })
    .catch((err) => {
      console.log(err)
      return res.status(405).send(`error: ${err}$`)
    })
})

router.get('/disclose/finish', (req, res) => {
  let db = req.db
  // TODO: check database if disclosed identity is allowed to vote

  // Use token from /start to retrieve session results from conf.irma.server
  if (req.session.disclosure_token == undefined)
    return res.status(403).send('no disclosure started yet for this session')

  return irmaBackend
    .getSessionResult(req.session.disclosure_token)
    .then((result) => {
      if (!(result.proofStatus === 'VALID' && result.status === 'DONE'))
        throw new Error('not valid or session not finished yet')

      let getValue = (result, id) =>
        result.disclosed[0].filter(
          (attr) => attr.id == id && attr.status == 'PRESENT'
        )[0].rawvalue

      let ids = [
        'irma-demo.gemeente.personalData.initials',
        'irma-demo.gemeente.personalData.familyname',
        'irma-demo.gemeente.personalData.dateofbirth',
      ]

      let [initials, name, dateofbirth] = ids.map((id) => getValue(result, id))

      // TODO: perform db check
      console.log(initials, name, dateofbirth)

      // Let's say the user is allowed a voting card
      req.session.authenticated = true

      return res.status(200).end()
    })
    .catch((err) => res.status(405).send(`error: ${err}$`))
})

// Below are two routes for issuance of a voting card
router.get('/issue/start', (req, res) => {
  if (!req.session.authenticated) return res.status(403).end('not permitted')

  return irmaBackend
    .startSession({
      '@context': 'https://irma.app/ld/request/issuance/v2',
      credentials: [
        {
          credential: 'irma-demo.stemmen.stempas',
          attributes: {
            election: 'test',
            voteURL: 'test.com',
            start: 'somedate',
            end: 'someotherdate',
          },
        },
      ],
    })
    .then(({ sessionPtr, token }) => {
      req.session.issue_token = token
			if (conf.url) {
				sessionPtr.u = `https://${conf.url}/irma/${sessionPtr.u}`;
			} else {
				sessionPtr.u = `${conf.irma.url}/irma/${sessionPtr.u}`;
			}
      return res.status(200).send(sessionPtr)
    })
    .catch((err) => res.status(405).send(`error: ${err}$`))
})

router.get('/issue/finish', (req, res) => {
  // Check if the session is completed successfully. If so,
  // register that this user has retrieved her voting card.
  // Update database accordingly.

  return res.status(200).end()
})

module.exports = router
