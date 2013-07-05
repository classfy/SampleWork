var errCount = 0;
$("#submitLogin").click(function () {

	var email = $("#inputEmail").val();
	var password = $("#inputPassword").val();

	var formData = function(){
		var data = {
			url : window.location.origin+window.location.pathname,
			data : {
				email : email,
				password : password
			}
		};
		submit(data);	
	}


	var submit = function(data){
		ajax.post(data, function(err,data){
			appendMsg(err,data)
		});
	}

	var appendMsg = function(err,data){
		
		var append = function(div,msg){
			$(div).empty().append(msg).parent().slideDown()			
		}
		if(err == "OK"){
			append("#succ-msghere","Success!");	
			window.setTimeout(function(){
				window.location = "../../"				
			},1000);
		}else{
			errCount++;
			var errStr = err + " - "+errCount+" time(s) tried.";
			append("#err-msghere",errStr)	
		}
	}

	formData();

});