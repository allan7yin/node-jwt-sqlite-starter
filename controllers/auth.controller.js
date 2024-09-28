import njwt from "njwt";
import repository from "../repositories/repository";
const bcrypt = require("bcrypt");

const { APP_SECRET = "secret" } = process.env;

const encodeToken = (tokenData) => {
  return njwt.create(tokenData, APP_SECRET).compact();
};

const decodeToken = (token) => {
  return njwt
    .verify(token, APP_SECRET)
    .setExpiration(new Date().getTime() + 604800000).body; //1 week
};

export const authMiddleware = async (req, res, next) => {
  const token = req.header("Access-Token");
  if (!token) {
    return next();
  }

  console.log("Token: ", token);

  try {
    const decoded = decodeToken(token);
    console.log(decoded);
    const { userId } = decoded;
    const user = await repository.getUserById(userId);
    if (user) {
      req.userId = userId;
    }
    console.log(user);
  } catch (e) {
    console.error("Invalid token:", e.message);
    return res.status(401).json({ error: "Invalid token" });
  }

  next();
};

export const authenticated = (req, res, next) => {
  if (req.userId) {
    return next();
  }

  res.status(401);
  res.json({ error: "User not authenticated" });
};

const returnInvalidCredentials = (res) => {
  res.status(401);
  return res.json({ error: "Invalid username or password" });
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await repository.getUserByUsername(username);

  if (!user) {
    returnInvalidCredentials(res);
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      const accessToken = encodeToken({ userId: user.id });
      return res.json({ accessToken });
    } else {
      return returnInvalidCredentials(res);
    }
  });
};

// New route to create a user
export const createUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    return res.json({ error: "Username and password are required" });
  }

  console.log(username);
  console.log(password);

  // Hash the password before saving to database
  bcrypt.hash(password, 10, async (err, hashedPassword) => {
    if (err) {
      res.status(500);
      return res.json({ error: "Internal server error" });
    }

    console.log(hashedPassword);

    try {
      // Create user in the repository
      const newUser = await repository.createUser({
        username,
        password: hashedPassword,
      });

      console.log("new user:");
      console.log(newUser);

      // Generate a JWT token for the newly created user
      const accessToken = encodeToken({ userId: newUser.id });
      return res.status(201).json({ accessToken });
    } catch (e) {
      res.status(500);
      return res.json({ error: "Error creating user" });
    }
  });
};

export const verify = (req, res) => {
  console.log("User verified successfully");
  return res.status(200).json({ message: "User verified successfully" });
};
