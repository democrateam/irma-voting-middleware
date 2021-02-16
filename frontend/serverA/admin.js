require('./../assets/style.scss')
require('bootstrap-datepicker')
require('bootstrap-table')
require('jquery-form')

function deleteElection(id) {
  fetch(`/api/v1/admin/${id}/delete`, { method: 'DELETE' }).then((res) => {
    if (res.status === 204) $('#overview').bootstrapTable('refresh')
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
      $('#overview').bootstrapTable('refresh')
    },
    error: (res) => {
      $('#alert_placeholder').html(
        `<div class="alert alert-warning" role="alert">Verkiezing aanmaken mislukt: ${res.responseJSON.err}</div>`
      )
    },
  })

  $('#overview').bootstrapTable({
    columns: [
      { field: 'id', title: 'Election ID' },
      { field: 'name', title: 'Election Name' },
      { field: 'start', title: 'Start' },
      { field: 'end', title: 'End' },
      { field: 'creation', title: 'Creation date' },
      { field: 'participants', title: 'Participants' },
      {
        field: 'actions',
        title: 'Actions',
        formatter: (value, row, index) => {
          return `<button id='${row.id}' type='button' style='font-size:17px' class='btn btn-outline-danger border-0' ><i class='far fa-trash-alt'></i></button>`
        },
      },
    ],
    onLoadSuccess: () => {
      $('#overview :button')
        .parent()
        .on('click', () => {
          deleteElection(window.event.target.id)
        })
    },
  })
})
