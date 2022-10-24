import express from "express";
export const app = express();
import  { resrouter } from "./reservationRouter.js";
import { userrouter } from "./userRouter.js"
import { postRouter } from "./postRouter.js"
import { googleAuthRouter } from "../services/googleAuthService.js"

app.use(express.json());
app.use((req,res,next)=>{
    req.url.startsWith("/static/") ? null : console.log(req.method, req.url) ;
    next();
})

app.use("/reservation",resrouter);
app.use("/user/",userrouter);
app.use("/post", postRouter);
app.use("/google/auth", googleAuthRouter);
app.use("/static",express.static('public'))
