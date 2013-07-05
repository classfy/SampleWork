$.fn.serializeObject = function() {var o = {}; var a = this.serializeArray(); $.each(a, function() {if (o[this.name] !== undefined) {if (!o[this.name].push) {o[this.name] = [o[this.name]]; } o[this.name].push(this.value || ''); } else {o[this.name] = this.value || ''; } }); return o; };
var userId = $.cookie('cfy');
function error(){
	console.log("err")
}


var trns = {
	speedIn : 500,
	speedOut : 400,
	hideDiv : ".pg, .modal",
	default  :"",
	in : function(slct){
		t = this;

		if(slct == "#aboutWrapper"){
			this.setBackground();
		}
		else{
			this.setDefaultBackground();
		}

		this.hideAll(function(){
			t.trnsIn(slct);
		});
	},
	trnsIn : function(slct){
		$(slct).fadeIn(t.speedIn);
		vis = false;
		pages = $(".pg");
		for(x=0;x<pages.length;x++){
			if($(pages[x]).css('display') == "block"){
				vis = true;
			}
		}

		if(!vis){
			this.mainContainer.hide();
		}else{
			this.mainContainer.show();
		}
	},
	mainContainer : {
		hide : function(){
			$("#mainContainer").fadeOut(t.speedOut);
		},
		show : function(){
			$("#mainContainer").fadeIn(t.speedIn);
		}
	},
	slctOut : function(slct){
		$(slct).hide()
	},
	modal : function(slct){
	},
	setBackground : function(url){
		$('body').css('background', url+" no-repeat center center fixed");		
	},
	setDefaultBackground : function(){
		if($('body').css('background') != this.default){
			$('body').css('background', this.default);
		}
	},
	hideAll : function(cb){
		$(this.hideDiv).hide();
		cb(true);
	}
}

trns.default = $('body').css('background');

function ajax(send,cb){
	send._key_ = '4fqd5herle1628jb1l7f26564367533222';
	if(send.method != "GET"){
		send.data._csrf  = $("#csrf").text();		
	}
	
	$.ajax({
		url: send.url,
		type: send.method,
		crossDomain: true,
		data: send.data,
		success: function(data) {
			cb(data)
		},
		error  : function(err) {
			//server errors
		}
	});
}


renderPosts = {
	elements : {
		message : function(userId,postId,username){
			return '<div class="span2"><a href="#msg/compose" class="text-info msgBtn"postId="'+postId+'" username="'+username+'"userId="'+userId+'">\
			<i class="icon-envelope"></i> Message</a></div>'
		},
		removeBtn : function(id){
			return '<div class="span2"><a href="#Posts" class="text-error rmvBtn" postId="'+id+'">\
			<i class="icon-remove"></i> Remove</a></div>'				
		},
		created : function(dt){
			dt = new Date(dt);
			dt = dt.toLocaleDateString();
			return '<div class=" span4 dt">'+dt+'</div>'
		},
		price : function(price){
			return '<div class="text-success span2">$'+price+'</div>'
		},
		topic : function(topic){
			return '<div class="muted span2">'+topic+'</div>'
		},
		username : function (uname) {
			return '<div class="muted span2">'+uname+'</div>'
		}
	},
	c : 0,
	genHtml : function(data,r,cb){
		if(r == 'public'){
			k = this.elements.message(data.userId,data._id,data.username);
			u = this.elements.topic(data.username);
			mainId = 'publicPost-'+data._id;
			
			this.appendTo = function(){
				if(this.c ==2){
					this.c = 1;
					this.fl = "";
					return "#feedCol1"
				}else{
					this.fl = "float:right;";
					this.c = 2;
					return "#feedCol2"
				}
			}
			this.el = "#subs"
			vis = "hide";
		}else{
			this.el = '#postsWrapper';
			k = this.elements.removeBtn(data._id);
			this.appendTo = function(){
				if(this.c ==2){
					this.c = 1;
					this.fl = "";
					return "#postCol1"
				}else{
					this.fl = "float:right;";
					this.c = 2;
					return "#postCol2"
				}
			}
			mainId = 'privatePost-'+data._id
			vis = "";
			u = "";
		}

		ht = '<div class="postSpan span12 '+vis+' topic-'+data.topic+'" id="'+mainId+'" style=" '+this.fl+'margin-left: 1%;width:'+this.getWidth(data.description)+'">\
		<div class="span12 postText"><p>'+data.description+'</p></div>\
		<div class="row-fluid">\
		<div class="span12 btmRow hide">\
		'+k+'\
		'+this.elements.created(data.created)+'\
		'+this.elements.price(data.price)+'\
		'+this.elements.topic(data.topic)+'\
		'+u+'\
		</div></div></div>'
		this.append(ht, function(){
			if(typeof cb !="undefined"){
				cb(data);
			}
		});

	},
	getWidth  : function(data){
		w = data.length * getRandomInt(8,9);
		if(w>00){
			return getRandomInt(280,400)+"px";
		}else{
			return w+"";
		}
		function getRandomInt (min, max) {
		    return Math.random() * (max - min) + min;
		}		
	},
	append : function(data,cb){
		if(typeof this.appendTo == "function"){
			ap = this.appendTo();
		}else{
			ap = this.appendTo;
		}
		$(this.el).find(ap).append(data);
		cb();
	}
}




var crMenu = {
	menu : $("#crMenu").find('li'),
	post : function(){
		this.removeClass()
		$("#cr-menu-post").addClass("active")
	},
	section : function(){
		this.removeClass()
		$("#cr-menu-section").addClass("active");
	},
	removeClass : function(){
		this.menu.removeClass("active");
	}
}


var fv = {
	lenCheck : function(el, settings){
		if(el.length>settings.max || el.length<settings.min){
			return true
		}else{
			return false
		}
	}
}

/*
============================
	Create Post Page
============================
*/
var createPost = Backbone.View.extend({
	el : "#createWrapper",
	events : {
		"click #submitPost" : "submitPost"
	},
	initialize : function(){
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
			url : "../../user/"+userId+"/post/",
			method:"POST",
			data : ""
		},
		errId : '#crPostErr',
		formId: "#cr-form-post",

	},
	submitPost : function(){
		console.log("#$")
		loading.show();
		checkForm = this.vl();
		tcp = this;
		if(checkForm.err){
			this.settings.send.data = checkForm.form;
			this.settings.send.method = "POST";
			ajax(this.settings.send,function(data){
				loading.hide();
				if(data =="Created"){
					tcp.clearForm();
					if(typeof postV != 'undefined'){
						priPoCol.refresh();
					}
					nav.navigate("#Posts",{trigger : true});
					$("#crErr").empty().parent().hide();
				}else{
					$("#crErr").empty().append(data).parent().fadeIn();
				}
			})
		}else{
			//err
		}
	},
	vl : function(){
		form = $(this.settings.formId).serializeObject();
		if(fv.lenCheck(form.price, this.settings.price ) && !isNaN(parseFloat(form.price))){
			return {err : false, form : null}
		}else if(fv.lenCheck(form.description, this.settings.description)){
			return {err : false, form : null}
		}else{
			return {err : true, form : form};
		}
	}
});


/*
============================
	Public Posts
============================
*/

var public_Post_Collection = Backbone.Collection.extend({

	initialize : function(){
		this.feed(function(){

		});
	},
	settings : {
		url : function () {
			ticks =  userModel.get('sub');
			y=0;
			arr = new Array();
			for( x in ticks){
				if(ticks[x] == 'true' || ticks[x] == true){
					arr[y] = x;
					y++
				}
			}
			url = arr.join();
			url = url.replace(/,/g , "+");
			url = "../post/"+url+"/"
			return url
		},
	},
	feed : function(cb){
		var getFeed = {
			url : this.settings.url(),
			method : 'GET',
			data :""
		}
		el = this.el;
		thisPPostColl = this;
		ajax(getFeed, function(r){
			loading.hide();
			renderPosts.el = el
			for(x=0;x<r.length;x++){
				renderPosts.genHtml(r[x],'public',function(){
					thisPPostColl.add( new public_Post_Model(r[x]));
				});
			}
			subV.showByCategory();
			cb();
			loading.hide();
		});
	},

});

var public_Post_Model = Backbone.Model.extend({
	initialize : function(){
		this.createView();
	},
	createView  : function(){
		new public_Post_View({el : '#publicPost-'+this.get('_id'), model : this.attributes })
	}
});


var public_Post_View = Backbone.View.extend({
	events : {
		'mouseenter .btmRow div' : 'btmRowE',
		'mouseleave .btmRow div' : 'btmRowEx',		
		"click .msgBtn" : "sendMsg",
		"click .postText" : "openModal"
	},

	sendMsg : function(e){
	},
	initialize : function(){
		thisppv = this;
	},	
	openModal : function(e){
		this.setModal();
	},
	setModal : function(){
		model = this.model;
		publicPostModal = "#publicPostModal";
		kt = this
		created(kt);
		setUsername(kt);
		sendMessageBtn(kt);
		$(publicPostModal).slideDown()
		function created (kt) {
			dt = new Date(kt.model.created);
			dt = dt.toLocaleDateString();
			$(publicPostModal).find(".dt").empty().append(dt)	
		}

		function setUsername (kt) {
			$(publicPostModal).find("#modalUsername").empty().append(kt.model.username)	
		}

		function sendMessageBtn (kt) {
			$(publicPostModal).find('.msgBtn').attr("userId", kt.model.userId)
			$(publicPostModal).find('.msgBtn').attr("postid", kt.model._id)
			$(publicPostModal).find('.msgBtn').attr("username", kt.model.username)
			compose.setPostID(kt.model._id);
			compose.setRecipient(kt.model.username);			
		}
	},
	btmRowE : function(e){
		$(e.currentTarget).addClass('btmRowHover',80);
	},	
	btmRowEx : function(e){
		$(e.currentTarget).removeClass('btmRowHover',100);
	},		
	
});

var subView = Backbone.View.extend({
	el : "#subs",
	events : {
		"click .subRow" : "subRow",
	},
	settings : {
		url : "../../"+userId+"/",
		submitMsgUrl : function(postId){
			return "../../post/"+postId+"/message/"
		},
		msgFormId : "#compose-message", 
	},
	topics : ['Politics', 'Business', 'Technology', 'Entertainment', 'Other'],

	initialize : function(){
		loading.show();
		this.highlight();
	},

	highlight : function(cb){
		ticks = userModel.get('sub');
		if(jQuery.isEmptyObject(ticks)){
			userModel.initialize(function(){
				subV.initialize();
			});
			return;
		}
		puPoCo = new public_Post_Collection();
		for(x in ticks){
			if(this.topics[0] == x && ticks[x] == 'true' ||  ticks[x] == true){
				highlight(this.topics[0],this);
			}else if(this.topics[1] == x && ticks[x] == 'true' ||  ticks[x] == true){
				highlight(this.topics[1],this)
			}else if(this.topics[2] == x && ticks[x] == 'true' ||  ticks[x] == true){
				highlight(this.topics[2],this)
			}else if(this.topics[3] == x && ticks[x] == 'true' ||  ticks[x] == true){
				highlight(this.topics[3],this)

			}else if(this.topics[4] == x && ticks[x] == 'true' ||  ticks[x] == true){
				highlight(this.topics[4],this)
			}else{
			}
		}
		function highlight(slct,subvT){
			subvT.color.append(slct);
		}
	},

	subRow : function(e){

		sub = $($(e.currentTarget).parent()).attr('sub');
		d = {}
		if(userModel.get('sub')[sub] == 'true' || userModel.get('sub')[sub] == true ){
			d= false;
			this.color.hide(e.currentTarget);
		}else{
			d= true;
			this.color.show(e.currentTarget);
		}
		currentSub = userModel.get('sub');
		currentSub[sub] = d
		userModel.set({sub :currentSub}).ch('sub');
		this.showByCategory();
	},

	showByCategory : function(){
		j = userModel.get('sub')
		for(k in j){
			if(j[k] == 'true' || j[k] == true){
				$('.topic-'+k).not('.btmRow').show('slide',400);
			}else{
				$('.topic-'+k).hide();
			}
		}
	},

	color : {
		getEl : function(slct){
			return $(slct).parent().find('.tick');
		},

		iconOk : '<i class="icon-ok"></i>',
		iconNone : '<i class="icon-minus"></i>',
		show : function(slct){
			$(slct).addClass('subRowSelect');
		},
		hide : function(slct){
			$(slct).removeClass('subRowSelect');
		},
		append : function(slct){
			this.show($("#SubRow-"+slct).find('.subRow'));
		}
	}
});



/*
============================
	Invitation Page
============================
*/

var invite = Backbone.View.extend({
	el : "#inviteWrapper",
	events: {
		'click #submitInvite' : 'invite'
	}, 

	settings : {
		email : {
			min : 4,
			max : 100
		},
		send : {
			data: "",
			url : "invite/",
			method : "POST"

		},
		formId : "#cr-form-invite",
		inviteCount : "#inviteCount"
	},
	initialize : function(){},
	checkInviteCount : function () {
		if(userModel.get("invites")==0){
			return true;
		}else{
			return false;
		}
	},
	invite : function(){
		if(this.checkInviteCount()){
			return;
		}
		loading.show();
		form = $(this.settings.formId).serializeObject();
		iThis = this;
		if(fv.lenCheck(form.email, this.settings.email)){
			error()
		}
		else if(parseInt(userModel.get('invites'))<0){
			error()
		}else{
			inviteSend = this.settings.send;
			inviteSend.data = form;
			ajax(inviteSend,function(data){
				if(data){
					$(iThis.settings.inviteCount).slideUp(1000, function(){
						val = parseInt($(this).text());
						val = val -1; 
						$(this).empty().text(val);
						$(this).slideDown();
						userModel.refresh();
					});
					$(iThis.settings.formId).find('input').val("Invitation Sent");
				}
				loading.hide();
			});
		}
	}
});


/*
============================
	User Profile
============================
*/

var uModel 	= Backbone.Model.extend({

	defaults : {
		sub : {},
	},
	settings : {
		url : "../../user/"+userId+"/",
	},

	initialize : function(cb){
		oldthis = this;
		uMIni = true;
		this.read(function(data){
			oldthis.set(data.user);
			setUsername();
			if(typeof cb == "function"){
				cb()
			}
		});

		function setUsername () {
			u = userModel.get('email');
			//$("#usernamePlace").empty().append(u.substr(0,u.indexOf("@")));
		}
	},

	create : function(data){
		data.method = "POST";
		data.url = this.settings.url;

		ajax(data, function(result){
			console.log(result)
		});
	},
	read : function(cb){
		data = {};
		data.method = "GET";
		data.url = this.settings.url;
		oldthis = this; 

		ajax(data, function(result){
			if(cb){
				cb(result);
			}
		});
	},
	update : function(data){
		data.method = "PUT";
		data.url = this.settings.url;

		ajax(data, function(result){
		});
	},
	delete : function(data){
		data.method = "DELETE";
		data.url = this.settings.url;

		ajax(data, function(result){
			console.log(result)
		});
	},

	ch  :function(m){
		this.update({data : this.get(m)})
	},
	refresh : function(cb){
		this.read(function(data){
			oldthis.set(data.user);
			if(typeof cb == "function"){
				cb()
			}
		});		
	}

});

/*
============================
	Private Posts
============================
*/

var private_Post_Collection = Backbone.Collection.extend({

	initialize : function(){
		loading.show();
		this.feed(function(){

		});
	},
	settings : {
		url : "../../user/"+userId+"/post/",
	},
	feed : function(cb){
		send = {};
		send.url = this.settings.url
		send.method = "GET";
		pv = this;
		ajax(send,function(data){
			loading.hide();
			for(x=0;x<data.length;x++){
				renderPosts.genHtml(data[x],'private', function(){
					pv.add( new private_Post_Model(data[x]));					
				});
			}
		});
	},

	refresh : function(){
		this.rest();
		$("#postsWrapper").find(".pgB").empty();
		this.initialize();
	}

});

var private_Post_Model = Backbone.Model.extend({
	initialize : function(){
		this.createView();
	},
	createView  : function(){
		new private_Post_View({el : '#privatePost-'+this.get('_id'), model : this.attributes})
	}
});

$(".rmvBtn").click(function  () {
	postId = $(this).attr('postid');
	ajx = {}
	ajx.url = "../../user/"+userId+"/post/"+postId+"/";
	ajx.method = "DELETE";
	ajx.data = {_id : postId}
	ajax(ajx, function(result){
		if(result){
			$("#privatePost-"+postId).fadeOut(300,function(){
				$(this).remove();
				$("#closePPModal").click();
			});
		}
	})
});
var private_Post_View = Backbone.View.extend({
	events : {
		'mouseenter .btmRow div' : 'btmRowE',
		'mouseleave .btmRow div' : 'btmRowEx',
		"click .postText" : "openModal",
	},
	initialize : function(){
		thisppv = this;
	},
	openModal : function (e) {
		$("#privatePostModal").slideDown();
		$("#removeee").attr('postid', this.model._id);
	},
	btmRowE : function(e){
		$(e.currentTarget).addClass('btmRowHover',80);
	},	
	btmRowEx : function(e){
		$(e.currentTarget).removeClass('btmRowHover',100);
	},
});

var postView = Backbone.View.extend({
	el : "#postsWrapper",
	events : { 
	},
	settings : {
		send : {
			url : "../../user/"+userId+"/post/",
			method:"POST",
			data : ""
		}
	},
	initialize : function(){
		priPoCol = new private_Post_Collection();
	},
})

/*
============================
	User Settings Page
============================
*/
var uSettings = Backbone.View.extend({
	el : "#settingsWrapper",
	events : {
		"click #deleteAccount" : "deleteAccount", 
	}, 
	settings : {
		send : {
			url : "../../user/"+userId+"/",
			data : "",
		}
	},
	initialize : function(){


	},

	deleteAccount : function(e){
		send = this.settings.send;
		send.method = "DELETE";
		ajax(send,function(data){
			window.location = "../../logout/"
		});
	}
});


/*
============================
	Messaging Modules
============================
*/

var messageCollection = Backbone.Collection.extend({
	initialize : function(cb){
		loading.show()
		loading.show()
		thisMsgCol = this;
		this.getMessages(function(){
			thisMsgCol.inbox = new inboxView()
			thisMsgCol.inbox.genInbox(function(){
				if(typeof cb != "undefined"){
					cb();
				}
			});
			loading.hide();
		});
	},

	settings : {
		url : "../../user/"+userId+"/message/",
	},

	getMessages : function(cb){
		send = {
			url : this.settings.url,
			method : "GET",
			data : ""
		}
		ajax(send, function(data){
			for(x=0;x<data.length;x++){
				thisMsgCol.newMsg(data[x]);
			}
			cb()
		});
	},
	newMsg : function(mdlJson){
		this.add(new messageModel(mdlJson));
	}

});
refresh = {
	inbox : function(hash, cb){
		$("#msgList, #msgText").empty();
		$("#compose-reply").hide();
		if(typeof msgCol == "undefined"){
			nav.navigate("#msg/inbox", {trigger : true});
			return;
		}
		msgCol.inbox.undelegateEvents();
		msgCol.inbox = undefined;
		delete msgCol.inbox;
		msgCol.reset();
		msgCol.initialize(function(){
			if(typeof hash == "string"){
				nav.navigate(hash, {trigger :true});
			}else{
				nav.navigate("msg/inbox", {trigger : true});
			}			
			if(typeof cb != "undefined"){
				cb()
			}
		});
	},
}
var messageModel 	= Backbone.Model.extend({

	defaults : {
	},
	settings : {
	},

	initialize : function(cb){
		this.genView();
	},

	genView : function(){
		this.view = new messageView({el : "#thread-"+this.attributes._id, model : this.attributes})
	},

	ch  :function(m){
		this.update({data : this.get(m)})
	},

});

var msgTrns = {
	outerClass :".outerMsg",
	in : function(threadId,username){
		thismsgt = this;
		this.hideAll(function(){
			thismsgt.textarea(threadId,username);
			thismsgt.show(threadId);
		});
	},
	textarea :function(threadId, username){
		k  = threadId.replace("#thread-","");
		$("#replyBox").attr('threadId', k);
		$("#replyBox").attr('recipient', username);
		$("#compose-reply").show();
	},
	hideAll  : function(cb){
		$(this.outerClass).hide();
		if(typeof cb != "undefined"){
			cb()
		}
	},
	show : function(threadId){
		$(threadId).fadeIn();
	}
}
var messageView = Backbone.View.extend({
	events : "",

	initialize :  function(){
		this.el = "#thread-"+this.model._id;
		thismv = this;
		this.genOuterHtml(this.model._id, function(){
			for(xmsg=0;xmsg<thismv.model.messages.length;xmsg++){
				thismv.genHtml(thismv.model.messages[xmsg]);
			}
		});
		loading.hide();
	},
	append : function(mdl){
		this.genHtml(mdl);
	},
	genHtml : function(mdl){
		ht = 	"<div id='thread-"+mdl.timestamp+"'class='row-fluid msgInnerRow'>\
					<div class='span12'>\
						"+senderUsername(mdl)+"\
						<div class='span10 msgBody'>\
							<div class='row-fluid'>\
							<div class='span12'>\
								"+senderMsg(mdl)+"\
								<div class='row-fluid'>\
									"+timestamp(mdl)+"\
								</div>\
							</div>\
							<div>\
						</div>\
					</div>"
		
		$(this.el).prepend(ht);

		function timestamp(mdl){
			dt = new Date(mdl.timestamp);
			dt = dt.toLocaleDateString();
			return '<div class=" dt">'+dt+'</div>'
		}

		function senderUsername(mdl){
			return "<div class='span2 senderUsername'>"+mdl.senderUsername+"</div>"
		}
		function senderMsg(mdl){
			return "<div class='span12'>"+mdl.body+"</div>"
		}
	},

	genOuterHtml : function(mdlId,cb){
		ht = 	"<div id='thread-"+mdlId+"'class='row-fluid outerMsg hide'></div>"
		$("#msgText").append(ht);
		cb();
	},
});

/*
============================
	Messaging Pages
============================
*/

inboxSideHtml = {
	fromUser : function(data){
		return "<a href='#msg/inbox/thread-"+data.data._id+"/"+data.fromUser+"' class='fromUser span12'>"+data.fromUser+"</a>"
	},
	gen : function(data){
		ht = 	"<div class='row-fluid inboxSpan'>\
				<div class='span12'>\
				"+this.fromUser(data)+"\
				</div></div>"
		this.append(ht);
	},
	append : function(ht){
		$("#msgList").append(ht);
	}
}

var inboxView = Backbone.View.extend({
	events : {
		"keypress #replyBox" : "submitReply", 
	},
	el : ".inboxView",
	initialize :  function(cb){
		// this.genInbox(function(){
		// 	if(typeof cb != "undefined"){
		// 		cb();
		// 	}			
		// });
	},
	genInbox : function(cb){
		k =  msgCol.models
		for(x=0;x<k.length;x++){
			fromUser = getOtherUser(k[x])
			inboxSideHtml.gen({
				fromUser 	: fromUser.name ,
				fromUserId 	: fromUser._id,
				data : k[x].attributes
			});
		}
		if(typeof cb != "undefined"){
			cb();
		}

		function getOtherUser(mdl){
			if(mdl.get('user1_id') == userModel.get("_id")){
				return { name : mdl.get('user2_name') , _id : mdl.get('user2_id')}
			}else{
				return { name : mdl.get('user1_name') , _id : mdl.get('user1_id')}
			}
		}
	},

	submitReply : function(e){
		if(e.keyCode !=13){
			return;
		}
		compose.cmp.hash = nav.tools.currentLocation();
		e.preventDefault();
		nav.navigate("msg/send/#compose-reply/", {trigger : true})
	}
});

var composeView = Backbone.View.extend({
	el  : "#composeWrapper",
	events : {
		"click #closeMsgModal" : "closeMsgModal",
		"click #submitMsg" : "sendMsg"
	},

	settings : {
		submitMsgUrl : function(user){
			return "/user/"+user+"/message/"
		},
	},
	initialize :  function(){
	},
	msgBtn : function(e){
		if($("#msgModal").css('display') == "none"){
			$("#submitMsg").attr("postid",$(e.currentTarget).attr("postid"));
		}else{
			$("#submitMsg").attr("postid","-");
		}
		$('#msgModal').slideToggle();
	},

	closeMsgModal : function(){
		history.go(-1);
	},

	toggle: function(){
		$("#msgModal").slideToggle();
	},
	setPostID : function(postId){
		$("#compose-postId").val(postId);
	},
	setRecipient : function(username){
		$("#compose-recipient").val(username);
	},
	sendMsg : function (e) {
		loading.show('modal');
		form = this.vl($("#compose-message").serializeObject());
		if(!form){
			return false;
		}
		this.active = true;
		this.send(form, function(){
			compose.alert.ok.show("Message Sent");
		});
	},
	alert : {
		ok :{
			show : function(txt){
				$("#composeOkAlertText").empty().append(txt);
				$("#composeOkAlert").show();
			},
			hide : function(){
				$("#composeOkAlertText").empty();
				$("#composeOkAlert").hide();
			}
		},
	},
	src : function(formId){
		switch(formId){
			case "#compose-reply":
				this.cmp.reply(formId);
				break
			default:
				this.cmp.topic(formId);
		}
	},

	cmp : {

		reply : function(formId){
			form = $("#compose-reply").serializeObject();
			$("#replyBox").attr("disabled","disabled");
			form.recipient = $("#replyBox").attr('recipient');
			form.threadId = $("#replyBox").attr('threadId');
			$("#replyBox").val(null);
			compose.active = true;
			thiscmp = this;
			compose.send(form, function(){
				$("#replyBox").removeAttr("disabled");
				compose.active = false;
				refresh.inbox(thiscmp.hash, function(){
					thiscmp.hash = null;
				});		
			});
		}
	},


	active : false,
	send : function(form,cb){

		if(!this.active){
			return;
		}
		loading.show();

		this.active = false;
		subvT = this;
		sendmsg = {
			url : this.settings.submitMsgUrl(form.recipient),
			method : "POST",
			data : form
		}
		ajax(sendmsg, function  (res,err) {
			if(typeof cb != "undefined"){
				cb(res)
			}else{
			}
			loading.hide();	
		});
	},
	vl :function(form){
		if(form.recipient.length == 0){
			return false;
		}else{
			return form
		}
	}
});






var navApp =  Backbone.Router.extend({

	routes: {
		"" 			: 	"home",
		"Settings"	: 	"settings",
		"Create"	: 	"create",
		"Invite"	: 	"invite",
		"Subs"		: 	"subs",
		"Posts"		: 	"posts",
		"About" 	: 	"about",

		"msg/inbox"			: 	"inbox"	,
		"msg/refresh"			: 	"refreshInbox"	,
		"msg/inbox/:threadId/:username"	: 	"readMsg"	,
		"msg/compose"		: 	"composeMsg",	
		"msg/send/:formId/" : 	"sendMsg",

	},

	initialize 	: function(cb){
		if(typeof cb != "undefined"){
			cb()
		}
		compose = new composeView();
	},

	home 		: function(){
		this.create();
	},
	settings	: function(actions) {
		trns.in("#settingsWrapper");
		if( typeof settingsV == "undefined"){
			settingsV = new uSettings();
		}
	},	
	create	: function(actions) {
		trns.in("#createWrapper");
		if(typeof crPostView == 'undefined'){
			crPostView = new createPost();	
		}
		crMenu.post();

	},
	posts : function(){
		trns.in("#postsWrapper");
		if(typeof postV == 'undefined'){
			postV = new postView();
		}		
	},
	invite : function(){
		trns.in("#inviteWrapper");
		if(typeof inv == 'undefined'){
			inv = new invite();
		}
	},
	subs	: function(actions) {
			
		trns.in("#subsWrapper");
		if(typeof subV == 'undefined'){
			subV = new subView();
		}
	},
	about : function(){
		trns.in("#aboutWrapper");
		$("#aboutBody").slideDown(1000);
	},
	tools : {
		currentLocation : function(){
			c = window.location.hash
			c = c.substr(1,c.length);
			return c
		}
	},

	inbox : function(reset){
		if(typeof msgCol =="undefined"){
			msgCol = new messageCollection();
		}
		trns.in("#inboxWrapper");
	},

	composeMsg : function(){
		trns.in("#composeWrapper");
	},	
	sendMsg : function(formId){
		compose.src(formId)
	},
	readMsg : function(threadId,username){
		if(typeof msgCol == "undefined"){
			this.navigate("msg/inbox", {trigger : true})
		}else{
			msgTrns.in("#"+threadId,username);
		}
	},

	refreshInbox : function(){
		refresh.inbox();
	},

	undef : function(v){
		if(typeof v != "undefined"){
			return true
		}else{
			return false
		}
	}
});


function startEngine(cb){
	cb('userModel', userModel = new uModel());
}

startEngine(function(vn,v){
	if(vn == "userModel"){
		nav = new navApp();
		Backbone.history.start();
	}
});

$(".mItem").hover(function () {
	$('.mItem').not(this).find('a').toggleClass('mItemHover');
})