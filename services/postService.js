import multer from "multer";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as dotenv from 'dotenv';
dotenv.config()
import crypto from "crypto";
import { getDao, sqlquery } from "../db/CrudDAO.js";
import sharp from "sharp";

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
    file.buffer = await sharp(req.file.buffer).resize({ width: 320, height : 480 }).toBuffer()
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
        params = {homepage: true}
    }
    // implement redis cache / store homepage array in cache
    if(params.homepage && !params.id && !params.likecount && !params.name){

    }

    postDao.getByParam(params,async (err,data)=>{
        if(err){
            console.log(err);
            return res.status(500).json({err:"db error"})
        }
        if(data.rowCount == 0 ){
            return res.json({"err":"no rows found"})
        }
        let posts = data.rows;
        let calls = new Array()
        for(let i = 0; i<posts.length; i++){
            let getObjectParams = {
                Bucket: process.env.BUCKET_NAME,
                Key: posts[i].id
            }
            const command = new GetObjectCommand(getObjectParams);
            calls[i] = getSignedUrl(s3, command);
        }
        let urls = await Promise.all(calls);
        for(let i = 0; i<urls.length; i++){
            posts[i].url = urls[i] 
        }
        res.json({posts: posts})
    })
}

export function deletePost(req,res){
    postDao.delete(req.body,async (err,data)=>{
        if(err){
            console.log(err);
            return res.json({"err":"db generated error"})
        }
        if(data.rowCount==0){
            return res.status(400).json({"err":"rows not found"})
        }
        for(let i = 0; i<data.rows.length; i++){
            let deleteObjectParams = {
                Bucket: process.env.BUCKET_NAME,
                Key: data.rows[i].id
            }
            const command = new DeleteObjectCommand(deleteObjectParams);
            s3.send(command);
        }
        //console.log(data.rows);
        res.json({"deletedRows": data.rows})
    })
}

export function updateHomepage(req,res){
    let IDs = req.body.ids;
    let q = `UPDATE posts SET "homepage" = NOT "homepage" WHERE "id" IN (`;
    for(let i = 0; i<IDs.length; i++){
        q+= ` $${i+1} ,`
    }
    q = q.substring(0,q.length-1) + " )";
    sqlquery(q,IDs,(err,data)=>{
        if(err){
            console.log(err);
            return
        }
        if(data.rowCount==0){
            return res.status(400).json({err:"rows not found"})
        }
        res.json({"success":"rows updated"})
    })
}

export function likePost(req,res){
    let postid = req.body.post_id;
    let userid = JSON.parse(res.get("user")).id;
    let params = {postid,userid}
    postDao.getByParam({id:postid},(err,data)=>{
        if(err){
            console.log(err);
            return res.status(500).json({err:"db generated error"})
        }
        if(data.rowCount == 0){
            return res.status(400).json({err:"post not found"})
        }
        if(!data.rows[0].homepage){
            return res.status(403).json({err:"forbidden"})
        }
        let q= `INSERT INTO likes (post_id,user_id) values ( $1 , $2 ) RETURNING user_id`
        sqlquery(q,[postid,userid],(err,data)=>{
            if(err){
                console.log(err);
                return res.status(400).json({err:"post already liked"})
            }
            res.json({success:"post liked"})
        })
    })
}

export function removeLike(req,res){
    let postid = req.body.post_id;
    let userid = JSON.parse(res.get("user")).id;
    let q = `DELETE FROM likes WHERE post_id = $1 AND user_id = $2 RETURNING post_id`
    sqlquery(q, [postid,userid],(err,data)=>{
        if(err){
            console.log(err);
            return res.status(400).json({err:"bad request"})
        }
        res.json({success: "like deleted"})
    })
}