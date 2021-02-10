const express = require('express')
const sqlite3 = require('sqlite3')
const cookieSession = require('cookie-session')
const { createProxyMiddleware: proxy } = require('http-proxy-middleware')

// Load the configuration
const conf = require('./config/conf.json')

const app = express()
const db = require("./database");

// First define the proxies,
// then define the middlewares,
// then define the routes.

// Proxy IRMA app traffic to IRMA server
app.use('/irma', proxy({ target: `${conf.irma.url}`, changeOrigin: true }))

// Make the database globally accesible
app.use(function (req, _, next) {
  req.db = db
  next()
})

// Cookie setup
app.use(
  cookieSession({
    // TODO: maxAge, secure, domain, sameSite all according to
    // node.ENV == "dev" or "production" etc.
    name: 'session',
    keys: ['key1', 'key2'],
  })
)

// Use all routes from /routes
// TODO: could do this programmatically for all routes
const admin = require('./routes/admin')
app.use('/admin', admin)

const user = require('./routes/votingcard')
app.use('/user', user)

// Serve static public directory
app.use(express.static('public'))

// Start server
const server = app.listen(conf.port, conf.listen, () =>
  console.log(
    `Listening at ${conf.listen}:${conf.port}, publically available at ${conf.url}.`
  )
)

// Gracefully shutdown the server
process.on('SIGTERM', close)
process.on('SIGINT', close)

function close() {
  console.log('Shutting down server...')
  server.close()
  db.close((err) => {
    if (err) {
      console.log(`Couldn't close database: ${err.message}$`)
    }
    console.log('Database connection closed.')
  })
}
