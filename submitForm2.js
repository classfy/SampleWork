var errCount = 0;
$("#submitLogin").click(function () {

	var email = $("#inputEmail").val();
	var password = $("#inputPassword").val();
	var username = $("#inputUsername").val();

	var formData = function(){
		var data = {
			url : window.location.origin+window.location.pathname,
			data : {
				email : email,
				username :username ,
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
		
		var append = {
			sDiv : "#succ-msghere",
			eDiv : "#err-msghere",
			succ : function(msg){
				this.remove();
				this.add(this.sDiv,msg);
			},
			err : function(msg){
				this.remove();
				this.add(this.eDiv,msg);
			}, 
			add : function(div,msg){
				this.remove();
				$(div).empty().append(msg).parent().slideDown()			
			},
			remove : function(div){
				$(this.sDiv).parent().hide();
				$(this.eDiv).parent().hide();
			}
		}

		if(err == "Created"){
			append.succ("Account Created - Loading...");
		}else{
			errCount++;
			var errStr = err + " - "+errCount+" time(s) tried.";
			append.err(errStr)	
		}
	}

	formData();

});