const express = require('express')

var router = express.Router()

// example '/elections/radboudgebouw'
router.get('/:name', (req, res) => {
  var db = req.db
  var sql = 'select * from elections WHERE name = ?'
  var name = req.params.name

  db.get(sql, [name], (err, row) => {
    if (err) {
      console.log(`Couldn't get election with name ${name}: ${err}`)
      return res.status(400).json({ error: err.message })
    }
    return res.status(200).json(row)
  })
})

module.exports = router
