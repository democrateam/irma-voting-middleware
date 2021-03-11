const irma = require('@privacybydesign/irma-frontend')
const style = require('./../../assets/style.scss')

let options = {
  debugging: true,
  element: '#irma-web-form',
  session: {
    url: '/api/v1/admin/login',
    start: {
      url: (o) => `${o.url}/start`,
      method: 'GET',
    },
    mapping: {
      sessionPtr: (r) => r,
    },
    result: {
      url: (o) => `${o.url}/finish`,
      parseResponse: (r) => r.json(),
    },
  },
}

var irmaWeb = irma.newWeb(options)
irmaWeb.start().then((resp) => {
  console.log('resp: ', resp)
  if (resp.msg === 'success') {
    setTimeout(() => (window.location.href = '/admin/'), 1500)
  } else if (resp.msg === 'fail') {
    $('#alert_placeholder').html(
      `<div class="alert alert-danger" role="alert">Login mislukt. ${
        resp.err === 'NOT_AN_ADMIN'
          ? 'Uw e-mail adres staat niet in de lijst van administrators.'
          : 'IRMA sessie mislukt.'
      }</div>`
    )
  }
})
