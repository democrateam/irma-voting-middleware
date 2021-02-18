const express = require('express')

var router = express.Router()

// example '/elections/radboudgebouw'
router.get('/:name', (req, res) => {
  var db = req.db
  var stmt = db.prepare('select * from elections WHERE name = ?')
  var name = req.params.name

  try {
    row = stmt.get(name)
    return res.status(200).json(row)
  } catch (err) {
    console.log(`Couldn't get election with name ${name}: ${err}`)
    return res.status(400).json({ error: err.message })
  }
})

module.exports = router
