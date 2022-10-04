import { json, Router } from "express";
import {updateReservation ,deleteReservation, addReservation,getByParam } from "../services/reservationService.js";
export const resrouter = Router();
resrouter.use(json())

resrouter.get("/:user_id?", getByParam)

resrouter.post("/",addReservation)

resrouter.delete("/", deleteReservation)

resrouter.patch("/", updateReservation) 