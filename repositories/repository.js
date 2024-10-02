import dao from "./dao";
const { v4: uuidv4 } = require("uuid");
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

    const userId = uuidv4(); // Generate a new UUID for the user

    try {
      // Insert the new user with the generated UUID
      await dao.run(
        "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
        [userId, username, password]
      );

      console.log("User created with ID: ", userId);

      return {
        id: userId,
        username: username,
      };
    } catch (error) {
      console.error("Error in createUser: ", error);
    }
  }
}
