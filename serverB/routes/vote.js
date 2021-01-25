const fetch = require("node-fetch");
const express = require("express");
const conf = require("./../config/conf.json");

var router = express.Router();

router.get("/start", (req, res) => {
  fetch(`${conf.irma.url}/session`, {
    method: "POST",
    body: JSON.stringify({
      "@context": "https://irma.app/ld/request/signature/v2",
      message: "message to be signed",
      disclose: conf.attributes,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: conf.irma.auth_token,
    },
  })
    .then((res) => res.json())
    .then((json) => {
      req.session.token = json.token;
      req.session.voted = false;
      res.status(200).json(json.sessionPtr);
    })
    .catch((err) => {
      console.log(err);
      res.status(405).send(`error: ${err}$`);
    });
});

router.get("/finish", (req, res) => {
  // TODO: better status
  if (req.session.voted) res.status(403).send("already voted");

  {
    // TODO: make sure this block is atomic with locks or whatever.
    // Think about the scenario where multiple requests to /finish are started
    // before any of them complete.

    fetch(`${conf.irma.url}/session/${req.session.token}/result`)
      .then((resp) => resp.json())
      .then((result) => {
        console.log(result);
        if (result.status !== "DONE" || result.proofStatus !== "VALID")
          res.status(403).end();

        let signature = result.signature;
        //TODO: Store signature + attributes + message in database
      });

    // Mark the voting session completed.
    req.session.voted = true;
    res.status(200).end();
  }
});

module.exports = router;
