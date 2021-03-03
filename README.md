# Polls using the IRMA vote process

## Disclaimer
Do not use this for elections (= political, or high-stakes, or about persons, etc), where voting secret is a hard requirement. This project is intended for getting feedback of citizens/members, in a safer way compared to current processes.

## Components

Node.js is used to run the server. There is also a IRMA server needed, which can be installed locally.
Yarn (faster versie of NPM) is used to fetch dependencies.
Webpack is used as Javascript combinator, SASS (npm version) is used as CSS compiler.

There are two servers involved:
- Server A identifies users (using an IRMA card) and check voting eligibility. If eligible, it issues an IRMA voting card (which is anonymous, it can not be traced to a user).
- Server B registers the votes cast. A user selects their voting option, and confirms it using their IRMA voting card.

Running either server A or server B consists of two processes:
- node.js webserver with application logic;
- an IRMA server.

All outside communication is to the node.js webserver (which will facility communication between the IRMA app and the IRMA server if needed). The IRMA server needs internet connectivity to fetch the latest schemes.

# Build & run locally

1. Install `irmago`: see https://github.com/privacybydesign/irmago.

2. Install IRMA app and set IRMA app to [developer mode](https://irma.app/docs/irma-app/) (so HTTP connections are allowed, instead of requiring HTTPS connections).

3. Add your own administrator email address to `backend/serverA/config/conf.json` to the `admins` field.

4. Start 5 processes using the following commands. Connect to [http://127.0.0.1:4444](http://127.0.0.1:4444) and make sure that your phone is on the same (WiFi) network as your local computer (because the IRMA app needs a connection to the IRMA server running on your local computer). Yarn commands to start these services (on Debian it might be `yarnpkg`):
  - `yarn run build_frontend --watch`
  - `yarn run start_serverA` (starts node.js process for server A, on port 4444)
  - `yarn run start_serverA_irma` (starts IRMA process for server A)
  - `yarn run start_serverB` (starts node.js process for server B, on port 4445)
  - `yarn run start_serverB_irma` (starts IRMA process for server B)

5. Login in to the administrator section of the servers to create a poll. The same poll needs to be created at both server A as server B (because the servers do not share data).
  - server A: [http://127.0.0.1:4444/login.html](http://127.0.0.1:4444/login.html)
  - server B: [http://127.0.0.1:4445/login.html](http://127.0.0.1:4445/login.html)

## Requirements

WIP

- [ ] DNSSEC (to avoid domain take overs)
- [ ] DDoS protection

## Pilot -> production

WIP

- [ ] Distributed database to avoid data loss on server A.
- [ ] Remove timestamps from IRMA signatures (for a number of attacks, such as IRMA keyshare connection logging).

## Trust

WIP

- [ ] IRMA keyshare server
