require('./../assets/style.scss')
require('bootstrap-datepicker')
require('jquery-form')

$(document).ready(function () {
  $('#election-start')
    .datepicker({
      format: 'dd-mm-yyyy',
      autoclose: true,
    })
    .on('changeDate', function (selected) {
      var minDate = new Date(selected.date.valueOf())
      $('#election-start').datepicker('setStartDate', minDate)
    })

  $('#election-end')
    .datepicker({
      format: 'dd-mm-yyyy',
      autoclose: true,
    })
    .on('changeDate', function (selected) {
      var minDate = new Date(selected.date.valueOf())
      $('#election-end').datepicker('setEndDate', minDate)
    })

  $('#new').ajaxForm({
    url: '/api/v1/admin/new',
    dataType: 'json',
    type: 'POST',
    success: () => {
      $('#alert_placeholder').html(
        `<div class="alert alert-success" role="alert">Nieuwe verkiezing aangemaakt</div>`
      )
    },
    error: (res) => {
      $('#alert_placeholder').html(
        `<div class="alert alert-warning" role="alert">Verkiezing aanmaken mislukt: ${res.responseJSON.err}</div>`
      )
    },
  })
})
