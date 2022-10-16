let postsIDtoIndex = {};
const Service = {
    schedule : async () => {
        $("#schedule").hide()
        let reservations;
        let call = $.ajax({
            url : "reservation/schedule",
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
        if(day == 0){
            day = 1;
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
            url : "post/",
            method : "GET",
            success : (data) => {
                console.log("retrieved image data");
                posts = data.posts;
                console.log(posts);
                let html = ""
                for(let i = 0; i<posts.length; i++){
                    postsIDtoIndex[`${posts[i].id}`] = i;
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
                                    <div class="card-text position-absolute bottom-0 text-light w-100" style="display: flex;margin-left: -16px;/* color: black; */justify-content: space-between;">
                                    <div  class="" style="
                                        display: flex;
                                        flex-direction: column-reverse;
                                        ">
                                        <p style="
                                            margin-left: 16px;
                                            ">
                                            ${diffDays} days ago</p>
                                            </div>

                                        <div>
                                            <div id="likecount${i}" style="
                                                position: relative;
                                                left: 47%;
                                                bottom: -73%;
                                            "> ${posts[i].likecount} </div>
                                            <input type="checkbox" class="checkbox" id="checkbox${i}" value="${posts[i].id}">
                                            <label for="checkbox${i}">
                                            <svg id="heart-svg" viewBox="467 392 58 57" xmlns="http://www.w3.org/2000/svg">
                                            <g id="Group" fill="none" fill-rule="evenodd" transform="translate(467 392)">
                                            <path d="M29.144 20.773c-.063-.13-4.227-8.67-11.44-2.59C7.63 28.795 28.94 43.256 29.143 43.394c.204-.138 21.513-14.6 11.44-25.213-7.214-6.08-11.377 2.46-11.44 2.59z" id="heart" fill="#AAB8C2"></path>
                                            <circle id="main-circ" fill="#E2264D" opacity="0" cx="29.5" cy="29.5" r="1.5"></circle>

                                            <g id="heartgroup7" opacity="0" transform="translate(7 6)">
                                                <circle id="heart1" fill="#9CD8C3" cx="2" cy="6" r="2"></circle>
                                                <circle id="heart2" fill="#8CE8C3" cx="5" cy="2" r="2"></circle>
                                            </g>

                                            <g id="heartgroup6" opacity="0" transform="translate(0 28)">
                                                <circle id="heart1" fill="#CC8EF5" cx="2" cy="7" r="2"></circle>
                                                <circle id="heart2" fill="#91D2FA" cx="3" cy="2" r="2"></circle>
                                            </g>

                                            <g id="heartgroup3" opacity="0" transform="translate(52 28)">
                                                <circle id="heart2" fill="#9CD8C3" cx="2" cy="7" r="2"></circle>
                                                <circle id="heart1" fill="#8CE8C3" cx="4" cy="2" r="2"></circle>
                                            </g>

                                            <g id="heartgroup2" opacity="0" transform="translate(44 6)">
                                                <circle id="heart2" fill="#CC8EF5" cx="5" cy="6" r="2"></circle>
                                                <circle id="heart1" fill="#CC8EF5" cx="2" cy="2" r="2"></circle>
                                            </g>

                                            <g id="heartgroup5" opacity="0" transform="translate(14 50)">
                                                <circle id="heart1" fill="#91D2FA" cx="6" cy="5" r="2"></circle>
                                                <circle id="heart2" fill="#91D2FA" cx="2" cy="2" r="2"></circle>
                                            </g>

                                            <g id="heartgroup4" opacity="0" transform="translate(35 50)">
                                                <circle id="heart1" fill="#F48EA7" cx="6" cy="5" r="2"></circle>
                                                <circle id="heart2" fill="#F48EA7" cx="2" cy="2" r="2"></circle>
                                            </g>

                                            <g id="heartgroup1" opacity="0" transform="translate(24)">
                                                <circle id="heart1" fill="#9FC7FA" cx="2.5" cy="3" r="2"></circle>
                                                <circle id="heart2" fill="#9FC7FA" cx="7.5" cy="2" r="2"></circle>
                                            </g>
                                            </g>
                                            </svg>
                                            </label>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                             </div>`
                   // Service.likepost(posts[i].id)
                }
                let likeajax = $.ajax({
                    url : "post/my/likes",
                    method: "GET",
                    beforeSend: function(xhr){
                        xhr.setRequestHeader('Authorization', localStorage.getItem("token"));
                    },
                    success : (data) => {
                        console.log("retrieved likes");    
                    }
                })
                $("#cardgroup").html(html)
                likeajax.then( data =>{
                    for(let k = 0;k<data.likes.length; k++){
                        let i = postsIDtoIndex[data.likes[k].post_id]
                        $("#checkbox"+i).prop('checked', true);
                    }
                })
                $(document).ready(function () {
                    $('.checkbox').change(function () {
                        let index = postsIDtoIndex[this.value]
                        let like = parseInt($(`#likecount${index}`).text())
                        $(`#likecount${index}`).html(this.checked ? (like+1) : (like-1))
                        $.ajax({
                            url: "post/like",
                            method: this.checked ? "POST" : "DELETE",
                            data: JSON.stringify({
                                post_id : this.value
                            }),
                            contentType: "application/json",
                            dataType: "json",
                            beforeSend: function(xhr){
                                xhr.setRequestHeader('Authorization', localStorage.getItem("token"));
                            },
                            success : (data)=>{
                                console.log(data);
                            }
                        })
                    });
                });
            }
        })
    },
    likePost : function(id){
        $.ajax({
            url: "post/like",
            type: "POST",
            beforeSend: function(xhr){
              xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
            },
            contentType: 'application/json',
            data: JSON.stringify({
                post_id: id
            }),
            dataType: 'json',
            success: function(data) {
                console.log(data);
                if(data.err){
                    return toastr.error(data.err);
                }
                let like = parseInt($(`#likecount${id}`).text())
                $(`#likecount${id}`).html(like+1)

            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                toastr.error(XMLHttpRequest.responseJSON.message);
                loginService.logout();
            }
        })
    },
}


let dow = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]