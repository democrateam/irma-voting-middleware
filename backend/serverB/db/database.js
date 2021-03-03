const sqlite3 = require('better-sqlite3')
const conf = require('./../config/conf.json')

let db = new sqlite3(conf.database_file)

db.transaction(() => {
  // Create a table and insert initial count

  try {
    db.prepare(
      `CREATE TABLE IF NOT EXISTS election_results (
        id INTEGER NOT NULL,
        signature TEXT NOT NULL
      );`
    ).run()
  } catch (err) {
    if (err) {
      throw err
    }
  }
})()

module.exports = db
