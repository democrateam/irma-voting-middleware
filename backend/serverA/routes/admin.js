var express = require('express')
var router = express.Router()

// middleware that is specific to this router
// TODO: use for admin authentication
router.use((req, res, next) => {
  // check the url, /login is permitted
  // check if the req has a cookie
  next()
})

// only admin route that does not require authentication
router.get('/login', (req, res) => {})

router.get('/logout', (req, res) => {})

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
router.post('/new', function (req, res) {
  let db = req.db
  let sql = `INSERT INTO elections (name, question, options, start, end, participants) VALUES (?, ?, ?, ?, ?, ?);`
  let data = req.body

  console.log(req.body)
  // TODO: validate data!!!
  let params = [data.name, data.question, data.options, data.start, data.end, 0]
  db.run(sql, params, (err) => {
    if (err) {
      return res.status(403).json({ err: err })
    }
    return res.status(200)
  })
})

module.exports = router
