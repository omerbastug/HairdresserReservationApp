import { Router } from "express";
import { getUserByParam, addUser, deleteUser ,updateUser, login } from "../services/userService.js";
export const userrouter = Router();

userrouter.get("/:id?", getUserByParam);

userrouter.post("/", addUser)

userrouter.delete("/", deleteUser)

userrouter.patch("/", updateUser)

userrouter.post("/login", login)