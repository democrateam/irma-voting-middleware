const fetch = require("node-fetch");
const express = require("express");
const conf = require("./../config/conf.json");

var router = express.Router();

// Below are two routes that complete a disclosure session
// to get the necessary attributes to decide eligibility.
router.get("/disclose/start", (req, res) => {
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
      req.session.disclosure_token = json.token;
      req.session.authenticated = false;
      res.status(200).json(json.sessionPtr);
    })
    .catch((err) => {
      console.log(err);
      res.status(405).send(`error: ${err}$`);
    });
});

router.get("/disclose/finish", (req, res) => {
  let db = req.db;
  // TODO: check database if disclosed identity is allowed to vote

  // Use token from /start to retrieve session results from conf.irma.server
  if (req.session.disclosure_token == undefined)
    return res.status(403).send("no disclosure started yet for this session");

  fetch(`${conf.irma.url}/session/${req.session.disclosure_token}/result`)
    .then((resp) => resp.json())
    .then((json) => {
      if (!(json.proofStatus === "VALID" && json.status === "DONE"))
        throw new Error("not valid");

      let getValue = (json, id) =>
        json.disclosed[0].filter(
          (attr) => attr.id == id && attr.status == "PRESENT"
        )[0].rawvalue;

      let ids = [
        "irma-demo.gemeente.personalData.initials",
        "irma-demo.gemeente.personalData.familyname",
        "irma-demo.gemeente.personalData.dateofbirth",
      ];

      let [initials, name, dateofbirth] = ids.map((id) => getValue(json, id));

      // TODO: perform db check
      console.log(initials, name, dateofbirth);

      // Let's say the user is allowed a voting card
      req.session.authenticated = true;

      res.status(200).end();
    })
    .catch((err) => {
      console.log(err);
    });
});

// Below are two routes for issuance of a voting card
router.get("/issue/start", (req, res) => {
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
      req.session.issue_token = json.token;
      res.status(200).send(json.sessionPtr);
    })
    .catch((err) => res.status(405).send(`error: ${err}$`));
});

router.get("/issue/finish", (req, res) => {
  // Check if the session is completed successfully. If so,
  // register that this user has retrieved her voting card.
  // Update database accordingly.

  res.status(200).end();
});

module.exports = router;
