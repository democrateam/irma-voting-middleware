const express = require('express')
const conf = require('./../config/conf.json')
const IrmaBackend = require('@privacybydesign/irma-backend')

const irmaBackend = new IrmaBackend(conf.irma.url, {
  serverToken: conf.irma.auth_token,
})

var router = express.Router()

router.post('/start', async (req, res) => {
  return irmaBackend
    .startSession({
      '@context': 'https://irma.app/ld/request/signature/v2',
      message: req.body.text,
      disclose: conf.attributes,
    })
    .then(({ sessionPtr, token }) => {
      req.session.token = token
      req.session.voted = false
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

router.get('/finish', (req, res) => {
  if (req.session.voted) return res.status(403).send('already voted')

  return irmaBackend.getSessionResult(req.session.token).then((result) => {
    console.log(result)
    if (result.status !== 'DONE' || result.proofStatus !== 'VALID')
      return res.status(403).end()

    let signature = result.signature
    //TODO: Store signature + attributes + message in database

    // Mark the voting session completed.
    req.session.voted = true
    return res.status(200).end()
  })
})

module.exports = router