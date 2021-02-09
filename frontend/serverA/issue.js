const irma = require('@privacybydesign/irma-frontend')
const style = require('./../assets/style.scss')

let options = {
  debugging: true,
  element: '#irma-web-form',
  session: {
    url: '/user/issue',
    start: {
      url: (o) => `${o.url}/start`,
      method: 'GET',
    },
    mapping: {
      sessionPtr: (r) => r,
    },
    result: {
      url: (o) => `${o.url}/finish`,
      parseResponse: (r) => r.status,
    },
  },
}

const irmaWeb = irma.newWeb(options)
irmaWeb
  .start()
  .then((result) => {
    // wait two seconds to display check mark
    return new Promise((resolve) => setTimeout(() => resolve(result), 2000))
  })
  .then((result) => {
    if (result !== 200) throw new Error('issuance failed')
    console.log('issuance completed')
    window.location.href = 'http://localhost:4445/'
  })
  .catch((error) => console.error('error: ', error))
