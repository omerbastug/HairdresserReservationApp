import { Router } from "express";
import {updateReservation ,deleteReservation, addReservation,getResByParam } from "../services/reservationService.js";
import { isUser } from "../services/userService.js";
export const resrouter = Router();

resrouter.get("/:user_id?", getResByParam)

resrouter.post("/", isUser, addReservation)

resrouter.delete("/", isUser, deleteReservation)

resrouter.patch("/", updateReservation) 