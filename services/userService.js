import { getDao } from "../db/CrudDAO.js";
import {dateToString} from "./date/dbformat.js"
import crypto from "crypto";
import EmailValidator from "email-deep-validator";
import jwt from "jsonwebtoken";
import * as dotenv from 'dotenv';
dotenv.config();

const emailValidator = new EmailValidator();
let tablename = "users";
let pk = "id";

const userDao = getDao(tablename, pk);

export function getUserByParam(req,res){
    let {id,fullname,email,role_id,createdAt} = req.body;
    let params = {id,fullname,email,role_id,createdAt};
    if(req.params.id){ params.id = req.params.id}
    if(params.createdAt){
        let x = new Date(params.createdAt);
        if (x instanceof Date && !isNaN(x)) {
            params.createdAt = dateToString(x);
        }
    }
    const authUser = JSON.parse(res.get("user"));
    //console.log(authUser);
    if(authUser.role_id == 1){
        params = { id : authUser.id}
    }
    userDao.getByParam(params, (err, data)=>{
        if(err){
            console.log(err);
            return res.status(500).json({"err":"db error"});
        }
        if(data.rowCount != 0){
            res.json({users : data.rows});
        } else {
            res.status(400).json({"err":"not found"})
        }
    })
}

export async function addUser(req,res) {
    let {fullname,email,password} = req.body;
    const { wellFormed, validDomain, validMailbox } = await emailValidator.verify(email);

    // could do this in frontend and check for flag with a secret
    if(!wellFormed || !validDomain || !validMailbox ) {
        return res.status(400).json({"err":"invalid email"})
    }
    let salt = crypto.randomBytes(16).toString('hex');
    let hash = crypto.pbkdf2Sync(password, salt, 
        1000, 64, `sha512`).toString(`hex`);
    let user = {fullname,email,salt,hash};
    
    // var .hash = crypto.pbkdf2Sync(password, 
    //     this.salt, 1000, 64, `sha512`).toString(`hex`);
    //     return this.hash === hash;
    userDao.add(user, (err,data)=> {
        if(err){
            return res.status(500).json({"err":"db generated error"})
        }
        var token = jwt.sign({ user: user }, process.env.JWT_SECRET);
        res.json({token});
    })
}

export function deleteUser(req,res){
    let {id,fullname,email,role_id} = req.body;
    if(!id && !fullname && !email && !role_id){
        return res.status(400).json({"err":"no valid parameters"})
    }
    let params = {id,fullname,email,role_id};
    const authUser = JSON.parse(res.get("user"));
    //console.log(authUser);
    if(authUser.role_id == 1){
        params = { id : authUser.id}
    }
    userDao.delete(params, (err,data)=>{
        if(err){
            console.log(err);
            return res.status(500).json({"err":"db generated error"})
        }
        if(data.rowCount == 0 ){
            return res.status(400).json({"err":"user(s) not found"});
        }
        res.json({"success":"deleted user(s)","rows":data.rows})
    })
}

export async function updateUser(req,res){
    let {fullname,email,password} = req.body.updates;
    if(email){
        const { wellFormed, validDomain, validMailbox } = await emailValidator.verify(email);
        // could do this in frontend and check for flag with a secret
        if(!wellFormed || !validDomain || !validMailbox ) {
            return res.status(400).json({"err":"invalid email"})
        }
    }
    let updates = {fullname,email};
    if(password) {
        let salt = crypto.randomBytes(16).toString('hex');
        let hash = crypto.pbkdf2Sync(password, salt, 
            1000, 64, `sha512`).toString(`hex`);
        updates.salt = salt;
        updates.hash = hash;
    }
    let params = {
        id : req.body.params.id,
        email : req.body.params.email,
        fullname : req.body.params.fullname
    }
    const authUser = JSON.parse(res.get("user"));
    //console.log(authUser);
    if(authUser.role_id == 1){
        params = { id : authUser.id}
    }
    userDao.update(updates,params,(err,data)=>{
        if(err){
            console.log(err);
            return res.status(500).json({"err":"db generated error"})
        } else {
            if(data.rowCount == 0){
                return res.status(400).json({"err":"no eligible rows found"})
            }

            res.json({"success":"Updated",rows : data.rows})
        }
    })
}

export function login(req,res){
    let {email,password} = req.body;
    let params = {email};

    userDao.getByParam(params, (err,data) => {
        if(err){
            console.log(err);
            return res.sendStatus(500)
        }
        if(data.rowCount == 0){
            return res.status(400).json({"err":"user not found"});
        }
        let dbuser = data.rows[0];
        let hash = crypto.pbkdf2Sync(password, dbuser.salt, 1000, 64, `sha512`).toString(`hex`);        
        if(hash != dbuser.hash){
            return res.status(400).json({"err":"incorrect password"})
        }
        var token = jwt.sign({ user: {id : dbuser.id, role_id : dbuser.role_id, email: dbuser.email} }, process.env.JWT_SECRET);
        res.status(201).json({token})
    })
}

export function isUser(req,res,next){
    const token = req.headers["authorization"];
    let decoded;
    try {
        decoded =  jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({"err":"unauthorized"})
    }
    //console.log("jwt",decoded.user);
    res.set("user",JSON.stringify(decoded.user));
    next();
}