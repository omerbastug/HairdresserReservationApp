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
                console.log("retrieved image data");
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
                                        <div class="card-text position-absolute bottom-0 text-light w-100 row" style="margin-left: -16px; color: black;">
                                            <div class="col">7 days ago</div>
                                            <div class="col offset-md-4" =""="" style="/* display: flex; *//* flex-wrap: wrap; */padding-right: 0px;margin-left: 30.094;margin-left: 30px;">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"></path>
                                                </svg>
                                            <p style="display: inline-block;"> ${posts[i].likecount} </p>
                                            </div>
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