import * as dotenv from "dotenv";
dotenv.config();
import { app } from "./api/apiapp.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/', (req, res) => {
  	res.sendFile(__dirname + '/views/index.html')
});
app.get('/login', (req, res) => {
	res.sendFile(__dirname + '/views/login.html')
  });

app.get("/.well-known/pki-validation/762F0E791CAD1C3D1A7F3B34346BB20C.txt",(req,res)=>{
  res.sendFile(__dirname +"/762F0E791CAD1C3D1A7F3B34346BB20C.txt")
})

app.listen(process.env.PORT || 8080, ()=>{
    console.log("Server started on",process.env.PORT);
});

