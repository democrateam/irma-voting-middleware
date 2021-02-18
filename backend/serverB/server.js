const express = require('express')
const cookieSession = require('cookie-session')
const { createProxyMiddleware: proxy } = require('http-proxy-middleware')
const bodyParser = require('body-parser')
const vote = require('./routes/vote')

const { networkInterfaces } = require('os')

var conf = require('./config/conf.json')

if (!('external_url' in conf)) {
  console.log(
    "no 'external_url' set in config, resolving external ip address (assuming HTTP in dev mode)"
  )
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        conf.external_url = 'http://' + net.address + ':' + conf.port
        break
      }
    }
  }
}

const db = require('./db/database')
const app = express()

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

app.use('/vote', bodyParser.urlencoded({ extended: false }))
app.use('/vote', bodyParser.json())

// Use all routes from /routes
// TODO: could do this programmatically for all routes
app.use('/vote', vote)

// Serve static public directory
app.use(express.static('public'))

// Start server
const server = app.listen(conf.port, conf.listen, () =>
  console.log(
    `Listening at ${conf.listen}:${conf.port}, publically available at ${conf.external_url}.`
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
      return
    }
    console.log('Database connection closed.')
  })
}
