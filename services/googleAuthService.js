import querystring from "querystring";
import axios from 'axios';
import * as dotenv from 'dotenv';
import cors from "cors";
dotenv.config();
import {Router} from "express";
import { login } from "./userService.js"

export const googleAuthRouter = Router();

let  UI_ROOT_URI = process.env.ROOT_URL+ "/";
googleAuthRouter.use(
    cors({
      // Sets Access-Control-Allow-Origin to the UI URI
      origin: UI_ROOT_URI,
      // Sets Access-Control-Allow-Credentials to true
      credentials: true,
    })
  );

const redirectURI = "google/auth/getdata/";
function getGoogleAuthURL() {
	const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
	const options = {
	  redirect_uri: process.env.ROOT_URL+ "/" + redirectURI,
	  client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
	  access_type: "offline",
	  response_type: "code",
	  prompt: "consent",
	  scope: [
		"https://www.googleapis.com/auth/userinfo.profile",
		"https://www.googleapis.com/auth/userinfo.email",
	  ].join(" "),
	};
    return `${rootUrl}?${querystring.stringify(options)}`;
}
googleAuthRouter.get("/geturl", (req, res) => {
    req.headers.googlecall = process.env.GOOGLE_CALL;
	return res.redirect(getGoogleAuthURL());
  });
async function getTokens(code,clientId,clientSecret,redirectUri){
	const url = "https://oauth2.googleapis.com/token";
  	const values = {
		code,
		client_id: clientId,
		client_secret: clientSecret,
		redirect_uri: redirectUri,
		grant_type: "authorization_code",
	};
  	return axios
		.post(url, querystring.stringify(values), {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})
		.then((res) => res.data)
		.catch((error) => {
			console.error(`Failed to fetch auth tokens`);
			throw new Error(error.message);
		});
}
googleAuthRouter.get(`/getdata`, async (req, res) => {
	const code = req.query.code;

	const { id_token, access_token } = await getTokens(
		code,
		process.env.GOOGLE_OAUTH_CLIENT_ID,
		process.env.GOOGLE_OAUTH_CLIENT_SECRET,
		process.env.ROOT_URL+ "/" + redirectURI
	);
	
	await axios
    .get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    )
    .then((result) =>{
		console.log(result.data);
        let user = result.data;
        req.body = user;
        req.headers.googlecall = process.env.GOOGLE_CALL;
        return login(req,res)
	})
    .catch((error) => {
      console.error(`Failed to fetch user`);
      throw new Error(error.message);
    });
})
