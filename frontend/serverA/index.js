const irma = require('@privacybydesign/irma-frontend')
const style = require('./../assets/style.scss')

const step1 = `Om te kunnen stemmen wordt eerst met IRMA uw identiteit vastgesteld. Dit voorkomt dubbel stemmen. U kunt daarna een anonieme niet-traceerbare stemkaart in uw IRMA app laden. Daarna kunt u op een andere website deze stemkaart inzetten om te stemmen. Doordat het stemmen op een andere website gebeurt, kunt u niet getraceerd worden en weet niemand wie de stem uitbrengt. Houd daarvoor wel uw stemkaart prive.`
const step2 = `Uw identiteit is vastgesteld. U mag stemmen. Um te kunnen stemmen kunt u nu een anonieme niet-traceerbare stemkaart in uw IRMA app laden. Daarna kunt u op een andere website deze stemkaart inzetten om te stemmen. Doordat het stemmen op een andere website gebeurt, kunt u niet getraceerd worden en weet niemand wie de stem uitbrengt. Houd daarvoor wel uw stemkaart prive.`

document.addEventListener('DOMContentLoaded', () => {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)

  // Load all the content from the api
  let url = `/api/v1/election/${urlParams.get('name')}`
  fetch(url)
    .then((res) => res.json())
    .then((json) => {
      document.querySelector('#election-question').innerHTML = json.question
      document.querySelector('#election-date').innerHTML = new Date(
        json.start
      ).toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      document.querySelector('#election-step').innerHTML = step1
    })
    .catch((err) => {
      console.log('unable to get data:', err)
    })

  let options = {
    debugging: true,
    element: '#irma-web-form',
    session: {
      url: '/api/v1/votingcard/disclose',
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

  var irmaWeb = irma.newWeb(options)
  irmaWeb
    .start()
    .then((result) => {
      // wait two seconds to display check mark
      return new Promise((resolve) => setTimeout(() => resolve(result), 2000))
    })
    .then((result) => {
      if (result !== 200) throw new Error('disclosure failed')
      console.log('disclosure completed')
      document.querySelector('#election-step').innerHTML = step2
      document.querySelector('#irma-help-text').innerHTML =
        'Scan dan de QR code rechts om verder te gaan.'
      document.querySelector('#irma-help-btn').remove()
      document.querySelector('#irma-readmore-btn').remove()
      let btn = document.querySelector('#election-step2')
      btn.className = btn.className.replace('btn-secondary', 'btn-primary')
      options.session.url = options.session.url.replace('disclose', 'issue')

      irmaWeb = irma.newWeb(options)
      irmaWeb
        .start()
        .then((result) => {
          // wait two seconds to display check mark
          return new Promise((resolve) =>
            setTimeout(() => resolve(result), 2000)
          )
        })
        .then((result) => {
          if (result !== 200) throw new Error('issuance failed')
          console.log('issuance completed')
          window.location.href = 'http://localhost:4445/'
        })
    })
    .catch((error) => console.error('error: ', error))
})
