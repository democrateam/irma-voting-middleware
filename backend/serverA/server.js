const express = require('express')
const cookieSession = require('cookie-session')
const { createProxyMiddleware: proxy } = require('http-proxy-middleware')
const bodyParser = require('body-parser')

const sessionPtrMiddleware = require('./middlewares/sessionpointer')
const { networkInterfaces } = require('os');

var conf = require('./config/conf.json')

if (!("external_url" in conf)) {
	console.log("no 'external_url' set in config, resolving external ip address (assuming HTTP in dev mode)");
	const nets = networkInterfaces();
	for (const name of Object.keys(nets)) {
			for (const net of nets[name]) {
					// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
					if (net.family === 'IPv4' && !net.internal) {
						conf.external_url = "http://" + net.address + ":" + conf.port;
						if (!("vote_url" in conf)) {
							conf.vote_url = "http://" + net.address + ":" + conf.vote_port;
						}
						break;
					}
			}
	}
}

const admin = require('./routes/admin')
const votingcard = require('./routes/votingcard')
const election = require('./routes/election')

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

// API routes
// Checks for any session pointers and corrects them
app.use('/api', sessionPtrMiddleware)
app.use('/api', bodyParser.json())
app.use('/api', bodyParser.urlencoded({ extended: false }))

app.use('/api/v1/admin', admin)
app.use('/api/v1/votingcard', votingcard)
app.use('/api/v1/election', election)

// Serve static public directory (frontend for now)
app.use(express.static('public'))

// Start server
const server = app.listen(conf.port, conf.listen, () =>
  console.log(
    `Listening at ${conf.listen}:${conf.port}, publically available at ${conf.external_url}.`
  )
)

// Gracefully shutdown the server
process.on('exit', () => close)
process.on('SIGHUP', () => process.exit(128 + 1))
process.on('SIGINT', () => process.exit(128 + 2))
process.on('SIGTERM', () => process.exit(128 + 15))

function close() {
  console.log('Shutting down server...')
  server.close()
  db.close()
}
