const express = require("express");
const sqlite3 = require("sqlite3");
const cookieSession = require("cookie-session");
const { createProxyMiddleware: proxy } = require("http-proxy-middleware");

const conf = require("./config/conf.json");
const app = express();

let db = new sqlite3.Database(conf.database_file, (err) => {
  if (err) {
    console.log(`Couldn't connect to database ${err.message}`);
    throw err;
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

// Make the database globally accesible
app.use(function (req, _, next) {
  req.db = db;
  next();
});

// Cookie setup
app.use(
  cookieSession({
    // TODO: maxAge, secure, domain, sameSite all according to
    // node.ENV == "dev" or "production" etc.
    name: "session",
    keys: ["key1", "key2"],
  })
);

// Use all routes from /routes
// TODO: could do this programmatically for all routes
const vote = require("./routes/vote");
app.use("/vote", vote);

// Proxy IRMA app traffic to IRMA server
app.use("/irma", proxy({ target: `${conf.irma.url}`, changeOrigin: true }));

// Serve static public directory
app.use(express.static('public'))

// Start server
const server = app.listen(conf.node_port, conf.url, () =>
  console.log(`Listening at ${conf.url}:${conf.node_port}.`)
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
