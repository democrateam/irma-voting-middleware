# IRMA-vote Server B

This package contains a NodeJS server acting as server B for irma-vote.
Server B's main tasks are:

- Acting as requestor to start signature (voting) session:
- Storing the result (signature, ballot & attribute) in a database.

## Installing and running

To install all decepencies:

```
npm install
```

To run a local irma server (make sure you have the `irma` binary):

```
npm run start_irma_server
```

To run the irma-vote server B:

```
npm run start
```

## API

The server exposes endpoints:

- `/vote/{start,finish}`: To start voting session and to retrieve the result, respectively.
