import dao from "./dao";
const bcrypt = require("bcrypt");
const saltRounds = 10;

export default class {
  static async getAllItems() {
    return await dao.all("SELECT * FROM items", []);
  }

  static async getItemById(id) {
    return await dao.get("SELECT * FROM items WHERE id = ?", [id]);
  }

  static async getUserByUsername(username) {
    return await dao.get("SELECT * FROM users WHERE username = ?", [username]);
  }

  static async getUserById(id) {
    return await dao.get("SELECT * FROM users WHERE id = ?", [id]);
  }

  static async createUser({ username, password }) {
    console.log("Username: ", username);
    console.log("Password: ", password);

    try {
      const result = await dao.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, password]
      );
      console.log("Insert result: ", result);

      return {
        id: result.lastID,
        username: username,
      };
    } catch (error) {
      console.error("Error in createUser: ", error);
    }
  }
}
