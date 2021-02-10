const express = require('express')
const sqlite3 = require('sqlite3')

const conf = require('./../config/conf.json')

// Connect to the database and initialize it
let db = new sqlite3.Database(conf.database_file, (err) => {
  if (err) {
    console.log(`Couldn't connect to database ${err.message}`)
    throw err
  }
  console.log('Connected to database.')

  db.serialize(() => {
    // Create the elections table
    // Stores id, readable name, question, options, (start/end) date, nr of participants, creation date.

    db.run(
      `CREATE TABLE IF NOT EXISTS elections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        start DATE NOT NULL,
        end DATE NOT NULL,
        participants INTEGER NOT NULL,
        creation DATETIME DEFAULT (DATETIME('now')),
        UNIQUE(name)
      );`,
      (err) => {
        if (err) throw err
      }
    )

    // Insert a sample election
    db.run(
      `INSERT INTO elections (name, question, options, start, end, participants) VALUES (
        "radboudgebouw",
        "Wat wordt de naam van het nieuwe universiteitsgebouw?",
        "Optie 1,Optie 3,Optie 3",
        "2021-2-28",
        "2021-3-7",
        "0"
      );
    `,
      (err) => {
        if (err && err.code != 'SQLITE_CONSTRAINT') {
          throw err
        }
      }
    )
  })
})

module.exports = db
