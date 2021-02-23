const irma = require('@privacybydesign/irma-frontend')
const style = require('./../assets/style.scss')

document.addEventListener('DOMContentLoaded', () => {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)

  let id = urlParams.get('name')
  if (!id) throw new Error('no name')

  document
    .getElementById('confirm')
    .addEventListener('click', function (event) {
      event.target.disabled = true
      event.target.classList.add('d-none')
      let inputs = document.getElementsByTagName('input')
      console.log(inputs)
      let text = ''
      for (let i = 0; i < inputs.length; ++i) {
        let input = inputs[i]
        input.disabled = true
        if (input.checked) {
          text = input.labels[0].innerHTML
        }
      }
      let after = document.getElementById('after-confirm')
      after.classList.remove('d-none')
      after.classList.add('d-block')
      console.log(event)
      // strip HTML
      text = text.replace(/(<([^>]+)>)/gi, '')
      text = text.trim()
      console.log(text)

      let options = {
        debugging: true,
        element: '#irma-web-form',
        session: {
          url: `/vote/${id}`,
          start: {
            url: (o) => `${o.url}/start`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text }),
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
          return new Promise((resolve) =>
            setTimeout(() => resolve(result), 2000)
          )
        })
        .then((result) => {
          if (result !== 204) throw new Error('signature failed')
          console.log('signature completed')
          //window.location.href = "next.html";
        })
        .catch((error) => console.error('error: ', error))
    })
})
