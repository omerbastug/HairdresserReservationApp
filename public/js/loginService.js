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
    }
}