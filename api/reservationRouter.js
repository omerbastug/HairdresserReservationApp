import { Router } from "express";
import {updateReservation ,deleteReservation, addReservation, getResByParam, getSchedule } from "../services/reservationService.js";
import { isUser } from "../services/userService.js";
export const resrouter = Router();

resrouter.get("/schedule", getSchedule)

resrouter.get("/:user_id?", getResByParam)

resrouter.post("/", isUser, addReservation)

resrouter.delete("/", isUser, deleteReservation)

resrouter.patch("/", updateReservation) 