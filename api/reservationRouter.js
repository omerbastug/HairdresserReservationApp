import { Router } from "express";
import {updateReservation ,deleteReservation, addReservation,getResByParam } from "../services/reservationService.js";
export const resrouter = Router();

resrouter.get("/:user_id?", getResByParam)

resrouter.post("/",addReservation)

resrouter.delete("/", deleteReservation)

resrouter.patch("/", updateReservation) 