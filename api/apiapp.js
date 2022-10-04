import express from "express";
export const app = express();
import  {resrouter} from "./reservationRouter.js";

app.use((req,res,next)=>{
    console.log(req.method, req.url);
    next();
})

app.use("/reservation",resrouter);

