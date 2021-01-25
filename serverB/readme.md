# IRMA-vote Server A
This package contains a NodeJS server acting as server A for irma-vote.

## Installing and running

To install all decepencies:
```
npm install
```

To run a local irma server (make sure you have the `irma` binary):
```
npm run start_irma_server
```

To run the irma-vote server A:
```
npm run start
```

## API
The server exposes endpoints:

- `/admin`: admin endpoints to create new election.
- etc.

