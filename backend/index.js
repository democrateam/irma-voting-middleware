const express = require("express");
const sqlite3 = require("sqlite3");

const port = 3000;
const app = express();

let db = new sqlite3.Database("./db/database.db", (err) => {
  if (err) {
    console.log(`Couldn't connect to database ${err.message}`);
  }
  console.log("Connected to database.");

  // Create a table and insert initial count
  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS count_table (id INTEGER PRIMARY KEY CHECK (id = 0), counter INTEGER NOT NULL);",
      (err) => {
        if (err) {
          console.log(err);
          throw err;
        }
      }
    );
    db.run("INSERT INTO count_table (counter, id) VALUES (0, 0);", (err) => {
      if (err && err.code != "SQLITE_CONSTRAINT") {
        console.log(err);
        throw err;
      }
    });
  });
});

// Handlers
app.get("/", (req, res) => {
  db.serialize(() => {
    db.run("UPDATE count_table SET counter = counter + 1 WHERE id=0;");
    db.get("SELECT counter FROM count_table WHERE id=0;", (err, row) => {
      if (err) {
        console.log(`Error getting counter from table: ${err.message}$`);
      } else {
        res.send(`counter: ${row.counter}`);
      }
    });
  });
});

// Start server
const server = app.listen(port, () =>
  console.log(`Listening at http://localhost:${port}.`)
);

// Gracefully shutdown the server
process.on("SIGTERM", close);
process.on("SIGINT", close);

function close() {
  console.log("Shutting down server...");
  server.close();
  db.close((err) => {
    if (err) {
      console.log(`Couldn't close database: ${err.message}$`);
    }
    console.log("Database connection closed.");
  });
}
