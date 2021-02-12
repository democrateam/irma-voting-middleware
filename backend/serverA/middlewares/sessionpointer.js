const mung = require('express-mung')
const conf = require('./../config/conf.json')

// Mung (response middleware) to fix the session pointer
function fixSessionPtr(json, _, _) {
  try {
    if (json && 'u' in json && json.u.includes('session')) {
      let sessionPtr = json
      if (conf.url) {
        sessionPtr.u = `https://${conf.url}/irma/${sessionPtr.u}`
      } else {
        sessionPtr.u = `http://${conf.listen}:${conf.port}/irma/${sessionPtr.u}`
      }
    }
  } catch (err) {
    console.log(('err during middleware', err))
  }
}

module.exports = mung.json(fixSessionPtr)
