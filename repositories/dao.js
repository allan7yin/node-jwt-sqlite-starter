const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const saltRounds = 10;

// Specify the database mode: in-memory or file-based
const DB_MODE = process.env.DB_MODE || "file"; // Set DB_MODE to 'memory' or 'file'

const db = new sqlite3.Database(
  DB_MODE === "memory" ? ":memory:" : "./database.db"
);

export default class {
  static setupDbForDev() {
    db.serialize(function () {
      const createUsersTable =
        "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT, password TEXT)";
      db.run(createUsersTable);

      const createItemsTable =
        "CREATE TABLE IF NOT EXISTS items (id TEXT PRIMARY KEY, name TEXT, price NUMERIC)";
      db.run(createItemsTable);

      let password = "123";

      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
          console.error("Error hashing password:", err);
          return;
        }
        // Generate UUIDs for each user
        const insertUsers = `INSERT INTO users (id, username, password) VALUES (?, ?, ?), (?, ?, ?);`;
        db.run(insertUsers, [uuidv4(), "foo", hash, uuidv4(), "bar", hash]);
      });

      // Generate UUIDs for each item
      const insertItems = `INSERT INTO items (id, name, price) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?);`;
      db.run(insertItems, [
        uuidv4(),
        "book",
        12.99,
        uuidv4(),
        "t-shirt",
        15.99,
        uuidv4(),
        "milk",
        3.99,
      ]);
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

  static run(stmt, params = []) {
    return new Promise((res, rej) => {
      db.run(stmt, params, function (error) {
        if (error) {
          console.log(error.message);
          return rej(error.message);
        }
        return res({ changes: this.changes }); // Removed lastID as it's not relevant for UUIDs
      });
    });
  }

  static insert(stmt, params = [], uuid) {
    return new Promise((res, rej) => {
      db.run(stmt, params, function (error) {
        if (error) {
          return rej(error.message);
        }
        return res({ id: uuid }); // Return the UUID that was passed as a parameter
      });
    });
  }
}
