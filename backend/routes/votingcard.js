const fetch = require("node-fetch");
const express = require("express");
const conf = require("./../config/conf.json");

var router = express.Router();

// Below are two routes that complete a disclosure session
// to get the necessary attributes to decide eligibility.
router.get("/start", (req, res) => {
  // send disclosure request to conf.irma.server
  fetch(`${conf.irma.url}/session`, {
    method: "POST",
    body: JSON.stringify({
      "@context": "https://irma.app/ld/request/disclosure/v2",
      disclose: [
        [
          [
            "irma-demo.gemeente.personalData.initials",
            "irma-demo.gemeente.personalData.familyname",
            "irma-demo.gemeente.personalData.dateofbirth",
          ],
        ],
      ],
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: conf.irma.auth_token,
    },
  })
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
      req.session.disclosure_token = json.token;
      req.session.authenticated = false;
      res.status(200).send(json.sessionPtr);
    })
    .catch((err) => res.status(405).send(`error: ${err}$`));
});

router.get("/finish", (req, res) => {
  let db = req.db;
  // TODO: check database if disclosed identity is allowed to vote

  // Use token from /start to retrieve session results from conf.irma.server
  if (req.session.disclosure_token == undefined)
    return res.status(403).send("no disclosure started yet for this session");

  fetch(`${conf.irma.url}/session/${req.session.disclosure_token}/result`)
    .then((resp) => resp.json())
    .then((json) => {
      console.log(json);
      if (json.proofState !== "DONE_VALID") throw new Error("not valid");

      // TODO: cleanup: throw credTypeID's in some constants array/configuration
      // Could throw key errors etc.
      initials = json.disclosed.filter(
        (item) => item.id === "irma-demo.gemeente.personalData.initials"
      )[0].rawvalue;
      familyname = json.disclosed.filter(
        (item) => item.id === "irma-demo.gemeente.personalData.familyname"
      )[0].rawvalue;
      dateofbirth = json.disclosed.filter(
        (item) => item.id === "irma-demo.gemeente.personalData.dateofbirth"
      )[0].rawvalue;

      // TODO: perform db check

      // Let's say the user is allowed a voting card
      req.session.authenticated = true;

      // TODO: does this set the session as authenticated?
      res.status(200).end("disclosure competed");
    })
    .catch((err) => {
      console.log(err);
    });
});

// Below are two routes for issuance of a voting card
router.get("/issue_start", (req, res) => {
  // TODO: check cookie for authentication
  if (!req.session.authenticated) res.status(403).end("not permitted");

  fetch(`${conf.irma.url}/session`, {
    method: "POST",
    body: JSON.stringify({
      "@context": "https://irma.app/ld/request/issuance/v2",
      credentials: [
        {
          credential: "irma-demo.stemmen.stempas",
          attributes: {
            election: "test",
            voteURL: "test.com",
            start: "somedate",
            end: "someotherdate",
          },
        },
      ],
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: conf.irma.auth_token,
    },
  })
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
      req.session.issue_token = json.token;
      res.status(200).send(json.sessionPtr);
    })
    .catch((err) => res.status(405).send(`error: ${err}$`));
});

router.get("/issue_finish", (req, res) => {
  // Check if the session is completed successfully. If so,
  // register that this user has retrieved her voting card.
});

module.exports = router;
