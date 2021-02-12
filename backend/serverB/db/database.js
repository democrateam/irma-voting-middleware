const sqlite3 = require('better-sqlite3')
const conf = require('./../config/conf.json')

let db = new sqlite3(conf.database_file)
db.transaction(() => {
  // Create a table and insert initial count
  db.run(
    'CREATE TABLE IF NOT EXISTS count_table (id INTEGER PRIMARY KEY CHECK (id = 0), counter INTEGER NOT NULL);',
    (err) => {
      if (err) {
        console.log(err)
        throw err
      }
    }
  )
  db.run('INSERT INTO count_table (counter, id) VALUES (0, 0);', (err) => {
    if (err && err.code != 'SQLITE_CONSTRAINT') {
      console.log(err)
      throw err
    }
  })
})

module.exports = db
