import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv';
dotenv.config()
import crypto from "crypto";
import { getDao } from "../db/CrudDAO.js";

const s3 = new S3Client({
    credentials : {
        accessKeyId : process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_ACCESS_KEY_SECRET
    },
    region : process.env.BUCKET_REGION
})

function generatePostID(){
    return crypto.randomBytes(32).toString("hex");
}

export async function postImage(req,res){
    const file = req.file;
    const id = generatePostID();
    const params = {
        Bucket : process.env.BUCKET_NAME,
        Key : id,
        Body : file.buffer,
        ContentType : file.mimetype
    }
    const command = new PutObjectCommand(params)
    let resp = await s3.send(command);
    if(resp.$metadata.httpStatusCode == 200){
        addToDB({name:file.originalname,id:id});
        res.json({"success":"post made with id "+id})
    } else {
        res.status(500).json({"err":"failed to store to s3"})
    }
}

const postDao = getDao("posts","id");

async function addToDB(post){
    let postToSend = {name:post.name, id:post.id}
    postDao.add(postToSend, (err,data)=>{
        if(err) return console.log(err);
        //console.log(data.rows[0]);
    })
}

export function getPosts(req,res){
    let {id,likecount,name,homepage} = req.body;
    let params = {id,likecount,name,homepage};
    if(!res.get("user") || JSON.parse(res.get("user")).role_id == 1){
        params.homepage = true;
    }
    postDao.getByParam(params,(err,data)=>{
        if(err){
            console.log(err);
            return res.status(500).json({err:"db error"})
        }
        if(data.rowCount == 0 ){
            return res.json({"err":"no rows found"})
        }
        res.json({posts: data.rows})
    })
}