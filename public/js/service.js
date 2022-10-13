const Service = {
    schedule : async () => {
        $("#schedule").hide()
        let reservations;
        let call = $.ajax({
            url : "http://mybarbershop.us-east-1.elasticbeanstalk.com/reservation/schedule",
            success : (data) => {
                console.log("retrieved schedule");
                reservations = data.rows;
            }
        })

        let now = new Date();
        let day = now.getDay()
        let hour = now.getHours()
        let minute = now.getMinutes();
        if(hour >=17 || (hour == 16 && minute > 30)){
            day++;
            day = day%7;
            hour = 9;
            minute = 0;
        }
        if(hour<9) {
            hour = 9;
            minute = 0;
        }
        let html = "";
        // first today row based on time
        if(day <= 6){
            html += `<div id="dow${day}" class="btn-group mr-2" role="group" aria-label="First group" style="flex-wrap: wrap;" >`
            html += `<div class="container">${dow[day]}</div>`
            if(minute == 0){
                html += `<button id="dow${day}time${hour+"-"+0}" type="button" class="btn btn-outline-info rounded-pill" style="margin: 5px;">${hour+":"+"00"}</button>`
                html += `<button id="dow${day}time${hour+"-"+30}" type="button" class="btn btn-outline-info rounded-pill" style="margin: 5px;">${hour+":"+"30"}</button>`
                hour++;
            } else if(minute < 30 && minute != 0){
                html += `<button id="dow${day}time${hour+"-"+30}" type="button" class="btn btn-outline-info rounded-pill" style="margin: 5px;">${hour+":"+"30"}</button>`
                hour++;
            } else {
                hour++;
            }
            while(hour<17){
                html += `<button id="dow${day}time${hour+"-"+0}" type="button" class="btn btn-outline-info rounded-pill" style="margin: 5px;">${hour+":"+"00"}</button>`
                html += `<button id="dow${day}time${hour+"-"+30}" type="button" class="btn btn-outline-info rounded-pill" style="margin: 5px;">${hour+":"+"30"}</button>`
                hour++;
            }
            html += "</div>"
            hour = 9;
            day++;
        }
        // other days of the week
        while(day<=6){
            html += `<div id="dow${day}" class="btn-group mr-2" role="group" aria-label="First group" style="flex-wrap: wrap;">`
            html += `<div class="container">${dow[day]}</div>`
            while(hour<17){
                html += `<button id="dow${day}time${hour+"-"+0}" type="button" class="btn btn-outline-info rounded-pill" style="margin: 5px;">${hour+":"+"00"}</button>`
                html += `<button id="dow${day}time${hour+"-"+30}" type="button" class="btn btn-outline-info rounded-pill" style="margin: 5px;">${hour+":"+"30"}</button>`
                hour++;
            }
            html += "</div>"
            hour = 9;
            day++;
        }
        $("#schedule").html(html)

        //disable reserved times
        call.then(()=>{
            for(let i = 0; i< reservations.length; i++){
                let date = new Date(reservations[i].datetime);
                let day = date.getDay()
                date.setHours(date.getHours() - 2); // timezone configuration
                let hour = date.getHours()
                let minute = date.getMinutes()
                $(`#dow${day}time${hour+"-"+minute}`).removeClass("btn-outline-info").addClass("btn-danger").attr("disabled","true")
            }
        })

    },
    showSchedule : ()=>{
        if($("#schedule").is(":hidden")){
            $("#scheduleButton").attr("disabled","true").removeClass("btn-warning").addClass("btn-danger").removeAttr('disabled')
            $("#schedule").show()
        } else {
            $("#scheduleButton").attr("disabled","true").removeClass("btn-danger").addClass("btn-warning").removeAttr('disabled')
            $("#schedule").hide()
        }
    },
    showImages : ()=>{
        $.ajax({
            url : "http://mybarbershop.us-east-1.elasticbeanstalk.com/post/",
            method : "GET",
            success : (data) => {
                console.log("retrieved schedule");
                posts = data.posts;
                console.log(posts);
                let html = ""
                for(let i = 0; i<posts.length; i++){
                    const date1 = new Date(posts[i].createdAt);
                    const date2 = new Date();
                    const diffTime = Math.abs(date2 - date1);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                    html += `<div class="col">
                                <div class="card bg-dark text-white">
                                    <img src="${posts[i].url}" alt="">
                                    <!-- <p class="p-2 m-0 small">
                                    Loading...
                                    </p> -->
                                    <div class="card-img-overlay ">
                                        <div class="card-text position-absolute bottom-0 text-light w-100" style="margin-left: -16px; color: black;">
                                            <p class="p-2 m-0 small">
                                                ${diffDays} days ago
                                            </p>
                                        </div> 
                                    </div>
                                </div>
                            </div>`
                }
                $("#cardgroup").html(html)
            }
        })
    }
}

let dow = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]