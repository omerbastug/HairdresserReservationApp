import express from "express";
export const app = express();
import  {resrouter} from "./reservationRouter.js";
import {userrouter} from "./userRouter.js"
import {postRouter} from "./postRouter.js"
app.use(express.json());
app.use((req,res,next)=>{
    console.log(req.method, req.url);
    next();
})

app.use("/reservation",resrouter);
app.use("/user/",userrouter);
app.use("/post", postRouter)
