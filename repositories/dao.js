const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const saltRounds = 10;

// Specify the database mode: in-memory or file-based
const DB_MODE = process.env.DB_MODE || "file"; // Set DB_MODE to 'memory' or 'file'

const db = new sqlite3.Database(
  DB_MODE === "memory" ? ":memory:" : "./database.db"
);

export default class {
  static setupDbForDev() {
    //  This sets up a DB either in memory or in a file by creating tables, inserting values, etc.
    db.serialize(function () {
      const createUsersTable =
        "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)";
      db.run(createUsersTable);

      const createItemsTable =
        "CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price NUMERIC)";
      db.run(createItemsTable);

      let password = "123";

      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
          console.error("Error hashing password:", err);
          return;
        }
        const insertUsers = `INSERT INTO users (username, password) VALUES (?, ?), (?, ?);`;
        db.run(insertUsers, ["foo", hash, "bar", hash]);
      });

      const insertItems = `INSERT INTO items (name, price) VALUES (?, ?), (?, ?), (?, ?);`;
      db.run(insertItems, ["book", 12.99, "t-shirt", 15.99, "milk", 3.99]);
    });
  }

  static all(stmt, params) {
    return new Promise((res, rej) => {
      db.all(stmt, params, (error, result) => {
        if (error) {
          return rej(error.message);
        }
        return res(result);
      });
    });
  }

  static get(stmt, params) {
    return new Promise((res, rej) => {
      db.get(stmt, params, (error, result) => {
        if (error) {
          return rej(error.message);
        }
        return res(result);
      });
    });
  }

  static run(stmt, params) {
    return new Promise((res, rej) => {
      console.log("in run");
      db.run(stmt, params, function (error) {
        if (error) {
          return rej(error.message);
        }
        return res({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  // New insert method for inserting records with parameterized queries
  static insert(stmt, params) {
    return new Promise((res, rej) => {
      db.run(stmt, params, function (error) {
        if (error) {
          return rej(error.message);
        }
        return res({ lastID: this.lastID });
      });
    });
  }
}
