var loginService = {
    init : function(){
        $("#loginform").validate({
            submitHandler: function(formdata){
                console.log("debug");
                var user = Object.fromEntries((new FormData(formdata)).entries());
                loginService.login(user);
            }
        })

    },
    login : function(entity){
        $("#submitbtnnn").attr('disabled',true);
        $.ajax({
            url: 'user/login',
            type: 'POST',
            data: JSON.stringify(entity),
            contentType: "application/json",
            dataType: "json",
            success: function(result) {
              console.log(result);
              localStorage.setItem("token", result.token);
              localStorage.setItem("loggedIn", true);
              if(!result.admin){
                window.location.replace("/");
              } else {
                window.location.replace("rest/docs");
              }
              
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                $("#submitbtnnn").attr('disabled',false);
                toastr.error(XMLHttpRequest.responseJSON.message);
            }
        });
    },
    logout: function(){
      localStorage.clear();
      location.reload()
    },
    registerForm : ()=> {
      let html = `<form id="registerform">
                  <div class="form-outline mb-4">
                    <input type="name" name="fullname" id="form3Example2" class="form-control form-control-lg"
                      placeholder="Enter your full name" />
                    <label class="form-label" for="form3Example2">Full name</label>
                  </div>
                  
                  <!-- Email input -->
                  <div class="form-outline mb-4">
                    <input type="email" name="email" id="form3Example3" class="form-control form-control-lg"
                      placeholder="Enter a valid email address" />
                    <label class="form-label" for="form3Example3">Email address</label>
                  </div>
                  
                  <!-- Password input -->
                  <div class="form-outline mb-3">
                    <input type="password" name="password" id="form3Example4" class="form-control form-control-lg"
                      placeholder="Enter password" />
                    <label class="form-label" for="form3Example4">Password</label>
                  </div>
                  
                  <div class="text-center text-lg-start mt-4 pt-2">
                    <button id="registerButton" type="submit" class="btn btn-primary btn-lg"
                      style="padding-left: 2.5rem; padding-right: 2.5rem;">Register</button>
                  </div>
                  </form>`
      $("#formwrapper").html(html);
      $("#registerform").validate({
        submitHandler: (formdata)=>{
          $("#registerButton").attr("disabled",true)
          var user = Object.fromEntries((new FormData(formdata)).entries());
          $.ajax({
            url: "user/",
            type: 'POST',
            data: JSON.stringify(user),
            contentType: "application/json",
            dataType: "json",
            success: function(result) {
              console.log(result);
              localStorage.setItem("token", result.token);
              localStorage.setItem("loggedIn", true);
              location.replace("/")
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                $("#registerButton").removeAttr('disabled');
                console.log(XMLHttpRequest, textStatus, errorThrown);
                toastr.error(XMLHttpRequest.responseJSON.message);
            }
          })
        }
      })
    }
}