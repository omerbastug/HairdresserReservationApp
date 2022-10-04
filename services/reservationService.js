import {getDao} from "../db/CrudDAO.js";
import _ from "lodash";
const tablename = "reservation";
const pk = "datetime";

const resDao = getDao(tablename,pk);

export function getByParam(req,res){
    let params = {};
    if(req.body) params = req.body;
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
                let response = {date : new Date(data.rows[0].datetime).toUTCString()};
                res.json(response);
            } else {
                res.status(400).json({"err":"not found"})
            }
        }
    },"datetime")
}

export function addReservation(req,res){
    let fields = req.body;
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
    let params = {};

    if(req.body.user_id){ params.user_id = req.body.user_id}

    if(req.body.datetime){
        let x = new Date(req.body.datetime);
        if (x instanceof Date && !isNaN(x)) {
            params.datetime = dateToString(x);
        }
    }

    if(_.isEmpty(params)){
        return res.status(400).json({
            "err":"enter user_id or date of reservation in the body"
        })
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

function pad2(n) { return n < 10 ? '0' + n : n }
function dateToString(date){
    return date.getFullYear().toString()+ "-" + pad2(date.getMonth() + 1)+ "-" + pad2( date.getDate())+ " " + pad2( date.getHours() ) +":"+ pad2( date.getMinutes() ) +":"+ pad2( date.getSeconds() )+".000000";
}