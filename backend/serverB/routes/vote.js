const express = require('express')
const conf = require('./../config/conf.json')
const IrmaBackend = require('@privacybydesign/irma-backend')

const irmaBackend = new IrmaBackend(conf.irma.url, {
  serverToken: conf.irma.auth_token,
})

var router = express.Router()

router.post('/:name/start', (req, res) => {
  // TODO: get name from id
  return irmaBackend
    .startSession({
      '@context': 'https://irma.app/ld/request/signature/v2',
      message: req.body.text,
      disclose: [
        [
          [
            { type: 'irma-demo.stemmen.stempas.votingnumber', value: null },
            {
              type: 'irma-demo.stemmen.stempas.election',
              value: 'radboudgebouw',
            },
          ],
        ],
      ],
    })
    .then(({ sessionPtr, token }) => {
      req.session.token = token
      req.session.voted = false
      sessionPtr.u = `${conf.external_url}/irma/${sessionPtr.u}`
      return res.status(200).json(sessionPtr)
    })
    .catch((err) => {
      console.log(err)
      return res.status(405).json({ err: err.message })
    })
})

router.get('/:name/finish', (req, res) => {
  if (req.session.voted) return res.status(403).json({ err: 'already voted' })

  return irmaBackend.getSessionResult(req.session.token).then((result) => {
    if (result.status !== 'DONE' || result.proofStatus !== 'VALID')
      return res.status(403).json({ err: 'session not done/valid' })

    let signature = result.signature
    console.log(result.disclosed)
    console.log(signature)
    //TODO: Store signature + attribute (election + message in database
    //TODO: Make sure no more is stored than required.

    // Mark the voting session completed.
    req.session.voted = true
    return res.status(204).end()
  })
})

module.exports = router
