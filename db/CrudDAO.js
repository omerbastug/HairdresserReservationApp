import * as dotenv from 'dotenv';
import _ from "lodash";
dotenv.config();
import pkg from "pg";
const {Pool} = pkg;

const client = new Pool({
    user: process.env.DBUSER,
    host: process.env.DBHOST,
    database: process.env.DBDATABASE,
    password: process.env.DBPASSWORD,
    port: process.env.DBPORT
  });


export function sqlquery (q,params,callback) {
    const start = Date.now()
    return client.query(q, params, (err, res) => {
    const duration = Date.now() - start
    console.log('executed query', { q, params, duration})
    callback(err, res)
    }) 
}


export const getDao = (tablename,pk ) => {
    return {
        getByParam:  (params,callback, sort = '"createdAt"') => {
            let q = "SELECT * FROM " + tablename+"    ";
            let array = [];
            //console.log(params);
            q+=" WHERE";
            let i = 1;
            Object.keys(params).forEach(function(key) {
                var value = params[key];
                //console.log(key, value);
                if(value) {
                    q += ` "${key}" = $${i} AND `;
                    array[i-1] = value;
                    i++;
                }
            });
            if(i==1){
                q = q.substring(0, q.length - 5);
            } else {
                q = q.substring(0, q.length - 4); 
            }
            if(sort != null) {
                q+=" ORDER BY "+sort+" desc";
            }
            //console.log(q, array);
            sqlquery(q,array, callback)
        },
        add: (fields, callback) => {
            //console.log(fields);

            let q = "INSERT INTO " + tablename +" (";
            let values = new Array();
            let i = 0;
            Object.keys(fields).forEach(function(key) {
                var value = fields[key];
                //console.log(key, value);
                if(value) {
                    q += ` "${key}" , `;
                    values[i] = value;
                    i++;
                }
            });
            q= q.substring(0,q.length -2);
            q+= ") values ( ";
            for(let i = 0; i<values.length;i++){
                q+= " $"+(i+1)+" ,";
            }
            q = q.substring(0,q.length -1);
            q+=" ) ";
            sqlquery(q,values,callback);
        },
        delete: (params,callback) => {
            let q = `DELETE FROM ${tablename} WHERE "${pk}" IN ( SELECT "${pk}" FROM ${tablename} WHERE    `;
            let array = new Array();
            let i = 1;
            Object.keys(params).forEach(function(key) {
                var value = params[key];
                //console.log(key, value);
                if(value) {
                    q += ` "${key}" = $${i} AND `;
                    array[i-1] = value;
                    i++;
                }
            });
            q = q.substring(0, q.length - 4);
            q+=` ORDER BY "${pk}" DESC LIMIT 1) RETURNING ${pk}`
            sqlquery(q,array,callback);
        },
        update: (updates,params, callback) => {
            let q = `UPDATE ${tablename} SET  `;
            let array = new Array();
            let i = 1;
            Object.keys(updates).forEach(function(key) {
                var value = updates[key];
                //console.log(key, value);
                if(value) {
                    q += ` "${key}" = $${i} , `;
                    array[i-1] = value; 
                    i++;
                }
            });
            q = q.substring(0, q.length - 2);
            q+= ` WHERE`;
            let j = i;
            Object.keys(params).forEach(function(key) {
                var value = params[key];
                //console.log(key, value);
                if(value) {
                    q += ` "${key}" = $${i} AND `;
                    array[j-1] = value;
                    j++;
                }
            });
            if(j==i){
                q = q.substring(0, q.length - 5);
            } else {
                q = q.substring(0, q.length - 4);
            }
            q += " RETURNING "+pk;
            sqlquery(q,array,callback)
        }
    }
}
