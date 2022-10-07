import * as dotenv from "dotenv";
dotenv.config();
import { app } from "./api/apiapp.js";


app.listen(process.env.PORT, ()=>{
    console.log("Server started on",process.env.PORT);
});

