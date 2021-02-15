require('./../assets/style.scss')
require('bootstrap-datepicker')
require('bootstrap-table')
require('jquery-form')

function delete_row(id) {
  fetch(`/api/v1/admin/${id}/delete`, { method: 'DELETE' }).then((res) => {
    if (res.status === 204) getTable()
  })
}

function getTable() {
  fetch('/api/v1/admin/elections')
    .then((resp) => resp.json())
    .then((json) => {
      $('#overview').bootstrapTable({ data: json })
      $('#overview thead tr').append('<td><strong>Actions</strong></td>')
      Object.keys(json).forEach((tableRow) => {
        $(`[data-index="${tableRow}"]`)
          .append(
            `<td><button type='button' style ='font-size:17px' class='btn btn-outline-danger border-0' ><i class='far fa-trash-alt'></i></button></td>`
          )
          .on('click', () => delete_row(json[tableRow].id))
      })
    })
}

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

  getTable()
})
