$.fn.serializeObject = function() {var o = {}; var a = this.serializeArray(); $.each(a, function() {if (o[this.name] !== undefined) {if (!o[this.name].push) {o[this.name] = [o[this.name]]; } o[this.name].push(this.value || ''); } else {o[this.name] = this.value || ''; } }); return o; };

var trns = {
	speedIn : 500,
	speedOut : 400,
	allEl : ".fnd",
	in : function(slct){
		this.hideAll(function(){
			$(slct).fadeIn(this.speedIn);
			$("#mainContainer").addClass("opacityMain",300);			
		});
	},
	out : function(slct){
		$("#mainContainer").removeClass("opacityMain");
		$(slct).fadeOut(this.speedOut)
	},
	toggle : function(slct){
		if($(slct).css('display') == "block"){
			this.out(slct);
		}else{
			this.in(slct);
		}
	},
	hideAll : function(cb){
		$(".pg").fadeOut();
		cb(true);
	},
	oIn : function(){

		$(this.allEl).addClass("opacityMain",1000);
		$(this.allEl).fadeOut(1000);

	},
	oOut : function(){
		$(this.allEl).removeClass("opacityMain");
		$(this.allEl).show();
	}
}

var validate = {
	msg 		: undefined,
	errorLabel 	: "",
	err 		: false,
	username 	: function(username){
		err = false // check if duplicate exists
		duplicate =false //ajaxs
		var myRegxp = /^([a-zA-Z0-9_-]+)$/; 

		if(username.length<=0){
			this.msg = "Username is too short."
			err = true;
		}else if(duplicate){
			this.msg = "Username exists."
			err = true
		}else if(!myRegxp.test(username)) { 
			this.msg = "Only letters and numbers"
			err = true;
		}
		if(err){
			this.append();			
		}
	},
	
	password 	: function(password){
		if(password.length<6){
			this.msg = "Password too short."
		}
		this.append();
	},

	email 		: function(email){
		if(email.indexOf("@") == -1 || email.indexOf(".") == -1 || email[0] == "@" ){
			this.msg = "Enter a valid email."
		}else if(email.length<4){
			this.msg = "Enter a valid email."
		}

	},

	checkbox 	: function(checkbox){
		if(!$(checkbox).prop("checked")){
			this.msg = "Read the Terms and Conditions."
		}

		this.append();
	},

	append : function(){
		if(typeof this.msg == 'string'){
			$("#crErr").empty().append(txt);
			$("#crErrWrap").show();			
			this.err = true;
			this.msg = undefined;
		}else{	}
	},
	clearErr : function(){
		$("#crErrWrap").hide();		
		$("#crErr").empty()
		this.err = false;
		this.errorLabel = "";	
	}
}

var createPost = Backbone.View.extend({
	el : "#createWrapper",
	events : {
		"click #submitPost" : "submitPost"
	},
	initialize : function(){
		thiscpv = this;
	},
	
	clearForm : function(){
		$(this.settings.formId).find("input[type=text], textarea").val("");
	},
	settings :{
		description : {
			min : 5,
			max : 300
		},
		price : {
			min: 1,
			max: 20
		},
		send : {
			url : "/post/",
			method:"POST",
			data : ""
		},
		errId : '#crPostErr',
		formId: "#cr-form-post",

	},
	submitPost : function(){
		loading.show()
		this.err.clear();
		checkForm = this.vl();
		tcp = this;
		if(checkForm.err){
			this.settings.send.data = {
				user : {
					email : checkForm.form.email
				},
				post : {
					price : checkForm.form.price,
					topic : checkForm.form.topic,
					description  :  checkForm.form.description

				}
			}
			this.settings.send.method = "POST";
			ajax(this.settings.send,function(data){
				if(data == "Created"){
					tcp.succ.create("<p>Information Posted.</p> Check your email for account details.");
				}else{
					tcp.err.create(data)
				}
				loading.hide();
			});
		}else{
			loading.hide();
			this.err.create(checkForm.form);
		}
	},
	err : {
		create : function(txt){
			$("#crErr").empty().append(txt);
			$("#crErrWrap").show();
		},
		clear : function(){
			$("#crErrWrap").hide()
			$("#crErr").empty();
			thiscpv.succ.clear();

		}
	},
	succ : {
		create : function(txt){
			$("#crSucc").empty().append(txt);
			$("#crSuccWrap").show();
		},
		clear : function(){
			$("#crSuccWrap").hide()
			$("#crSucc").empty();
		}
	},
	loading : { 
		el : "",
		start : function(){
			this.el = $("#cr-form-post").html();
			$("#cr-form-post").empty().append("<h1> Loading...</h1>")
		},
		end : function(){
			$("#cr-form-post").empty().append(this.el);
		}
	},
	vl : function(){
		form = $(this.settings.formId).serializeObject();
		if(!fv.priceCheck(form.price, this.settings.price )){
			return {err : false, form : 'Price Error'}
		}else if(fv.lenCheck(form.description, this.settings.description)){
			return {err : false, form : 'Description Error'}
		}else if(!fv.emailCheck(form.email)){
			return {err : false, form : 'Email Error'}
		}else{
			return {err : true, form : form};
		}
	}
});


var fv = {
	lenCheck : function(el, settings){
		if(el.length<settings.max && el.length>settings.min){
			return false
		}else{
			return true
		}
	},
	priceCheck : function(el,settings){
		if(el.length == 0){
			return false
		}
		if(parseFloat(el)>settings.max && parseFloat(el)<settings.min){
			return false
		}else{
			return true
		}
	},
	emailCheck : function(el){
		if(el.length ==0){
			return false
		}

		if(el.length<4 || el.indexOf("@") == -1 || el.length>90){
			return false
		}else{
			return true
		}
	}
}
var cAuth_V =  Backbone.View.extend({
	el 		: '#loginUser',

	events 	: {
		"click #loginBtn"	: "loginUser",
		"keyup input "	: 'enterKey',
	},
	initialize : function(){
	},

	enterKey : function (e) {
		if(e.keyCode == 13){
			this.loginUser();
		}
	},

	loginUser		: function (event) {
		//Needs verification
		var form = $("#loginUser").serializeObject();
		this.loading.start();
		oldthis = this;
		$.ajax({//ajax function
			url: "/login",
			type: 'POST',
			crossDomain: true,
			data: form,
			success: function(data) {
				if(data.err){
					oldthis.createErr("#loginError",data);			
				}else{
					oldthis.clearErr("#loginError",data);
					window.location = "/wu/main";
				}
				oldthis.loading.end();
			},
			error  : function(err) {
				oldthis.createErr("#loginError",err);
				oldthis.loading.end();
			}
		});
	},

	createErr 		: function(slct, data){
		$(slct).empty().text(data.msg).fadeIn()
	},

	clearErr 		: function (slct, data) {
		$(slct).empty().fadeOut();
	},

	loading : {
		start : function () {
			$("#loginBtn").fadeOut().empty().append("Loading...").fadeIn().attr("id", "loginBtn-loading")
		},
		end : function  () {
			$("#loginBtn-loading").fadeOut().empty().append("Login").fadeIn().attr("id", "loginBtn")
		}
	},

	closecAuth 		: function(){
		nav.navigate("",{trigger : true});
		trns.out(this.el);
	},

})

var applyView = Backbone.View.extend({
	el:"#applyBox",
	events : {
		"keyup input" : 'enterKey',
		"click #submitAppli" : 'submit' 
	},

	initialize : function () {
		
	},

	settings : {
		formId : "#apply-form"
	},

	enterKey : function (e) {
		if(e.keyCode == 13){
			this.submit();
		}
	},
	err : function (text) {
		this.hideMsg();
		$("#formErr").append(text);
		$("#formErrWrap").fadeIn();
	},
	success : function (text) {
		this.hideMsg();
		$("#formErr").empty();
		$("#formErrWrap").hide();

		$("#done").append(text);
		$("#doneWrap").fadeIn();
	},
	loading : {
		start : function () {
			this.stat = true;
			$("#submitAppli").empty().append("Loading").attr("id","loadingAppli");
		},
		end : function () {
			this.stat = false;
			$("#loadingAppli").empty().append("Signup").attr("id","submitAppli");
			this.clearForm();
		},
		stat : false
	},
	clearForm : function () {
		$(this.settings.formId).find('input').val();
	},
	hideMsg : function(){
		$("#done, #formErr").empty();
		$("#doneWrap, #formErrWrap").hide();
		this.clearForm();
	},
	submit : function () {
		if(this.loading.stat){
			return;
		}
		this.loading.start();
		var form = $(this.settings.formId).serializeObject();
		if(form.email.length <=3 || form.email.indexOf("@") == -1){
			this.err("Email is invalid");
			this.loading.end();
		}else{
			at = this;
			$.ajax({//ajax function
				url: "/invite/",
				type: 'POST',
				crossDomain: true,
				data: form,
				success : function (data) {
					if(data == 'Created'){
						at.success("Invite Sent")
					}else{
						at.err(data)
					}
					at.loading.end();
				}

			})
		}
	}

});


var forgetPass = Backbone.View.extend({
	el : "#forgetPassBox",
	events : {
		"click  #forgotPassSubmit" : "submit"
	},
	
	initialize : function(){

	},

	submit : function(){
		form = $("#forgetPass-form").serializeObject();
		if(this.vl(form)){
			this.send(form);
		}else{
			this.err("Error with Email Address")
		}
	},
	err : function(text){
		$("#passDoneTxt").empty();
		$("#passDoneWrap").hide();			
		$("#passErrTxt").empty().append(text);
		$("#passErrWrap").fadeIn();
	},
	success : function(text){
		$("#passDoneTxt").empty().append(text);
		$("#passDoneWrap").fadeIn();	
		$("#passErrWrap").hide();
		$("#passErrTxt").empty();
	},
	vl : function(form){
		if(typeof form.email == "undefined"){
			return false;
		}
		if(form.email.length <3 ){
			return false;
		}
		if(form.email.indexOf("@") ==-1){
			return false;
		}
		return true
	},
	send : function(data,cb){
		thisfp = this;
		ajax({
			url : "/forgotPass",
			method : "POST",
			data : data,
		}, function(data){
			console.log(data)
			if(data == created){
				thisfp.success("Email sent");
			}
		});
	}

});

function ajax(form,cb){
	$.ajax({
		url: form.url,
		type: form.method,
		crossDomain: true,
		data: form.data,
		success : function (data) {
			cb(data)
		}

	});
}

var navApp =  Backbone.Router.extend({

	routes: {
		"#" 		:"home",
		"" 		:"home",
		"inquire": "inquire",
		"password": "password"
	},
		
	initialize : function(){
		$("#splashPic").ready(function(){
			$("#logo").fadeIn(600,function (argument) {
				$(".bottom").show("slide",100);
			});
			window.setTimeout('$(".smallSlogan").show("blind",300)',960);
		});
		var cAuth_View = new cAuth_V();
	},

	home : function(){
		trns.oOut()

		$(this.modal).slideUp();
	},
	inquire: function(actions) {
		if(typeof applyV != "undefined"){
			applyV.hideMsg();
		}
		applyV = new applyView();
		$('#applyBox').slideDown();
	},

	password  : function(){
		if (typeof forgetPass != "undefined"){
			//forgetPass.hide();
		}
		fp = new forgetPass();
		$("#forgetPassBox").slideDown();
	},
	modal : "#applyBox, #forgetPassBox"
});

var nav = new navApp();
Backbone.history.start();
		var crPost = new createPost()

