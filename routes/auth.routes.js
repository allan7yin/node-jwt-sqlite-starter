import * as express from "express";
import { createUser, login, verify } from "../controllers/auth.controller";
const router = express.Router();

router.post("/login", login);
router.post("/new", createUser);
router.post("/verify", verify);

module.exports = router;
