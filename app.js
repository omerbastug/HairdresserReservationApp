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

app.get("/.well-known/pki-validation/89C3F17754AC08AE6152608E9067C78D.txt",(req,res)=>{
  res.sendFile(__dirname +"/89C3F17754AC08AE6152608E9067C78D.txt")
})

app.listen(process.env.PORT || 8080, ()=>{
    console.log("Server started on",process.env.PORT);
});

