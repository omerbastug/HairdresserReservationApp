import {getDao} from "../db/CrudDAO.js";
import _ from "lodash";
import {dateToString} from "./date/dbformat.js"
const tablename = "reservations";
const pk = "datetime";

const resDao = getDao(tablename,pk);

export function getResByParam(req,res){
    let {datetime,createdAt,user_id} = req.body;
    let params = {datetime,createdAt,user_id};
    if(req.params.user_id){ params.user_id = req.params.user_id}
    if(params.datetime){
        let x = new Date(params.datetime);
        if (x instanceof Date && !isNaN(x)) {
            params.datetime = dateToString(x);
        }
    }
    if(params.createdAt){
        let x = new Date(params.createdAt);
        if (x instanceof Date && !isNaN(x)) {
            params.createdAt = dateToString(x);
        }
    }
    resDao.getByParam(params,(err,data)=>{
        if(err){
            console.log(err);
            res.status(500).json({"err":"db error"});
        } else {
            if(data.rows[0]){
                if(_.isEmpty(params)){
                    return res.json({allreservations : data.rows})
                }
                let response = {reservations : data.rows};
                res.json(response);
            } else {
                res.status(400).json({"err":"not found"})
            }
        }
    },"datetime")
}

export function addReservation(req,res){
    let {datetime,user_id} = req.body;
    let fields = {datetime,user_id}
    fields.datetime = dateToString(new Date(fields.datetime));
    resDao.add(fields,(err,data)=>{
        if(err){
            console.log(err);
            return res.status(500).json({"err":"DB error",
            "message":"given time might be reserved",
            "warning":"make sure to enter data in exact mid or start of hour"})
        }
        res.json({"success":"reservation made"})
    })
}

export function deleteReservation(req,res){
    let {datetime,user_id} = req.body;
    if(!datetime && !user_id){
        return res.status(400).json({
            "err":"enter user_id or date of reservation in the body"
        })
    }

    let params = {datetime,user_id};

    if(datetime){
        let x = new Date(datetime);
        if (x instanceof Date && !isNaN(x)) {
            params.datetime = dateToString(x);
        }
    }

    resDao.delete(params,(err,data)=>{
        if(err){
            console.log(err);
            return res.status(500).json({"err":"db generated error"})
        }
        if(data.rowCount == 0){ 
            return res.status(400).json({"err":"reservation does not exist"})
        }
        let prettydate = data.rows[0]["datetime"].toUTCString();
        res.json({"success":"deleted that was reservation made in " + prettydate})
    })
}

export function updateReservation(req,res){
    
    if(_.isEmpty(req.body.updates) || req.body.updates.datetime == undefined){
            return res.json({"err":"no updates to be made"})
        }
    
    let updates = {};
    let {datetime} = req.body.updates;

    updates.datetime  = new Date(datetime);

    
    let params = {};
    params.datetime = new Date(req.body.params.datetime);

    resDao.update(updates,params,(err,data)=>{
        if(err){
            console.log(err);
            return res.status(500).json({"err":"db generated error"})
        } else {
            if(data.rowCount == 0){
                return res.status(400).json({"err":"no eligible rows found"})
            }

            res.json({"success":"Updated",datetime : data.rows[0].datetime})
        }
    })
}