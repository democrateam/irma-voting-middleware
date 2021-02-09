var express = require('express')
var router = express.Router()

// middleware that is specific to this router
// TODO: use for admin authentication
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

// overview of all elections?
router.get('/', (req, res) => {
  let db = req.db
  db.serialize(() => {
    db.run('UPDATE count_table SET counter = counter + 1 WHERE id=0;')
    db.get('SELECT counter FROM count_table WHERE id=0;', (err, row) => {
      if (err) {
        console.log(`Error getting counter from table: ${err.message}$`)
        return res.status(405).send(`error: ${error}`)
      }
      res.status(200).send(`counter: ${row.counter}`)
    })
  })
})

// new: create a new election
// TODO: include election details in POST data
router.post('/new', function (req, res) {
  res.send('make a new election')
})

module.exports = router
