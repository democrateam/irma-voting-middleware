# Components

Yarn (faster versie of NPM) is used to fetch dependencies.
Webpack is used as Javascript combinator, SASS (npm version) is used as CSS compiler.

# Requirements

- [ ] DNSSEC (to avoid domain take overs)
- [ ] DDoS protection

# Pilot -> production

- [ ] Distributed database to avoid data loss on server A.
- [ ] Remove timestamps from IRMA signatures (for a number of attacks, such as IRMA keyshare connection logging).

# Trust

- [ ] IRMA keyshare server
- [ ] 

# Build & run

```
yarn run build_frontend
yarn run start_serverA
yarn run start_serverA_irma
yarn run start_serverB
yarn run start_serverB_irma
```

