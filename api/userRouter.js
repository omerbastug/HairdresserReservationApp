import { Router } from "express";
import { getUserByParam, addUser, deleteUser ,updateUser, login, isUser, verifyUser } from "../services/userService.js";
export const userrouter = Router();

userrouter.get("/:id?", isUser, getUserByParam);

userrouter.post("/", addUser)

userrouter.delete("/", isUser, deleteUser)

userrouter.patch("/", isUser, updateUser)

userrouter.post("/login", login)

userrouter.get("/isvalid", isUser, verifyUser)