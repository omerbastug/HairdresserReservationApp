
function pad2(n) { return n < 10 ? '0' + n : n }
export function dateToString(date){
    return date.getFullYear().toString()+ "-" + pad2(date.getMonth() + 1)+ "-" + pad2( date.getDate())+ " " + pad2( date.getHours() ) +":"+ pad2( date.getMinutes() ) +":"+ pad2( date.getSeconds() )+".000000";
}