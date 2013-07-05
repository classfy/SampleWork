var Items 		= new Meteor.Collection("items");
var loggedInUsers 		= new Meteor.Collection("loggedInUsers");
var userItems 		= new Meteor.Collection('userItems');
var utz 		= new ut();
var sidebarArr 	= []
function ut(){
	this.unix = function(){
		return Math.round(new Date().getTime()/1000);
	},
	this.dateTime = function(dt){
		if(typeof dt != 'undefined'){
			dt = new Date(dt);
			return dt.getDay() + "/" +dt.getDate() + " || " + dt.getHours()+" : "+ dt.getMinutes()				
		}
	}
}

if (Meteor.is_client) {
(function(a){a.tiny=a.tiny||{};a.tiny.scrollbar={options:{axis:"y",wheel:40,scroll:true,lockscroll:true,size:"auto",sizethumb:"auto",invertscroll:false}};a.fn.tinyscrollbar=function(d){var c=a.extend({},a.tiny.scrollbar.options,d);this.each(function(){a(this).data("tsb",new b(a(this),c))});return this};a.fn.tinyscrollbar_update=function(c){return a(this).data("tsb").update(c)};function b(q,g){var k=this,t=q,j={obj:a(".viewport",q)},h={obj:a(".overview",q)},d={obj:a(".scrollbar",q)},m={obj:a(".track",d.obj)},p={obj:a(".thumb",d.obj)},l=g.axis==="x",n=l?"left":"top",v=l?"Width":"Height",r=0,y={start:0,now:0},o={},e=("ontouchstart" in document.documentElement)?true:false;function c(){k.update();s();return k}this.update=function(z){j[g.axis]=j.obj[0]["offset"+v];h[g.axis]=h.obj[0]["scroll"+v];h.ratio=j[g.axis]/h[g.axis];d.obj.toggleClass("disable",h.ratio>=1);m[g.axis]=g.size==="auto"?j[g.axis]:g.size;p[g.axis]=Math.min(m[g.axis],Math.max(0,(g.sizethumb==="auto"?(m[g.axis]*h.ratio):g.sizethumb)));d.ratio=g.sizethumb==="auto"?(h[g.axis]/m[g.axis]):(h[g.axis]-j[g.axis])/(m[g.axis]-p[g.axis]);r=(z==="relative"&&h.ratio<=1)?Math.min((h[g.axis]-j[g.axis]),Math.max(0,r)):0;r=(z==="bottom"&&h.ratio<=1)?(h[g.axis]-j[g.axis]):isNaN(parseInt(z,10))?r:parseInt(z,10);w()};function w(){var z=v.toLowerCase();p.obj.css(n,r/d.ratio);h.obj.css(n,-r);o.start=p.obj.offset()[n];d.obj.css(z,m[g.axis]);m.obj.css(z,m[g.axis]);p.obj.css(z,p[g.axis])}function s(){if(!e){p.obj.bind("mousedown",i);m.obj.bind("mouseup",u)}else{j.obj[0].ontouchstart=function(z){if(1===z.touches.length){i(z.touches[0]);z.stopPropagation()}}}if(g.scroll&&window.addEventListener){t[0].addEventListener("DOMMouseScroll",x,false);t[0].addEventListener("mousewheel",x,false)}else{if(g.scroll){t[0].onmousewheel=x}}}function i(A){a("body").addClass("noSelect");var z=parseInt(p.obj.css(n),10);o.start=l?A.pageX:A.pageY;y.start=z=="auto"?0:z;if(!e){a(document).bind("mousemove",u);a(document).bind("mouseup",f);p.obj.bind("mouseup",f)}else{document.ontouchmove=function(B){B.preventDefault();u(B.touches[0])};document.ontouchend=f}}function x(B){if(h.ratio<1){var A=B||window.event,z=A.wheelDelta?A.wheelDelta/120:-A.detail/3;r-=z*g.wheel;r=Math.min((h[g.axis]-j[g.axis]),Math.max(0,r));p.obj.css(n,r/d.ratio);h.obj.css(n,-r);if(g.lockscroll||(r!==(h[g.axis]-j[g.axis])&&r!==0)){A=a.event.fix(A);A.preventDefault()}}}function u(z){if(h.ratio<1){if(g.invertscroll&&e){y.now=Math.min((m[g.axis]-p[g.axis]),Math.max(0,(y.start+(o.start-(l?z.pageX:z.pageY)))))}else{y.now=Math.min((m[g.axis]-p[g.axis]),Math.max(0,(y.start+((l?z.pageX:z.pageY)-o.start))))}r=y.now*d.ratio;h.obj.css(n,-r);p.obj.css(n,y.now)}}function f(){a("body").removeClass("noSelect");a(document).unbind("mousemove",u);a(document).unbind("mouseup",f);p.obj.unbind("mouseup",f);document.ontouchmove=document.ontouchend=null}return c()}}(jQuery));

	Meteor.startup(function(){
		Session.set('sidebarChange', 'null');
		Session.set('highlight', false);
		Meteor.autosubscribe(function () {
			Meteor.subscribe("items");
			if(Meteor.user() != "null" ){
		  		Meteor.subscribe("loggedInUsers");
		  		Meteor.subscribe("userItems");
				Meteor.subscribe('sidebar', Session.get('sidebarChange'))
			}
		});				

		Items.find({active : true}).observe({
			added: function(doc){
				console.log("------Added-----:"+doc.text);
				for(x=0;x<=doc.group.length;x++){ //loop through all users in group
					if(doc.group[x] == Meteor.user()._id){ //user is in the group
						find = userItems.find({'itemId': this.itemId}).fetch()[0];
						add = false;
						for(y=0;y<find.items.length<y++){ //loop through all of users itemSideBar
							if(find.items[y]._id != doc._id){ //
								userItems.update({'itemId': this.itemId}, {$push : { items : doc}}, 
									{multi : false});
							}							
						}
						if(typeof find !='undefined' && find.length<0){

						}						
					}
				}
			},
			changed: function(newDoc, index, oldDoc){
				console.log("------Changed-----: "+newDoc.text);
				for(x=0;x<=newDoc.group.length;x++){
					if(newDoc.group[x] == Meteor.user()._id){
						console.log('change....Updating.')
						userItems.update({'itemId': this.itemId}, {$push : { items : newDoc}}, 
							{multi : false});
					}
				}				
			}
		})		
		loggedInUsers.find({}).observe({
			added: function(doc){
				if(doc.loggedIn == 'false' && Meteor.user() != 'null'){
					loggedInUsers.remove({'userId' : Meteor.user()._id}, function(){
						//Meteor.logout();
					});
				}
			},
			changed: function(doc){
				if(doc.loggedIn == 'false' && Meteor.user() != 'null'){
					loggedInUsers.remove({'userId' : Meteor.user()._id});
					//Meteor.logout();
				}
			}
		});
	});

	Template.itemContent.events = {
		'click #closeChatPopup ' : function(e){
			chatPop.CLOSE();
		}
	}

	Template.topBar.events = {

	}
//Items Profile
	Template.items_P.item = function(){
		if(Meteor.user() != "null" ){
			return Items.find({active : true, userId : Meteor.user()._id});
		}
	}

	Template.profile_chat.cht = function(){
		return this.chat;
	}
	
	Template.sideBarContent.itemSideBar = function(){
		c = userItems.find({active : true, userId : Meteor.user()._id});
		return c.items;
	}

	Template.itemContent.events = {
		'click .itemText' : function(e){
			$(".mainInput").attr('chatto',this._id);
			$(".mainInput").focus();
			$("body").find('.itemHighlight').removeClass('itemHighlight');
			$(".item_P_"+this._id).toggleClass('itemHighlight')		
		},
	}


	Template.profile.events = {
		'click .profileTitle'	: function(e){

		},
	}

	Template.itemContent.rendered = function(){

		//Scroll to bottom of chat box & Focus on chat inpy
		scroll = this.find('.chatMsgBox');
		scroll.scrollTop =scroll.scrollHeight;
		if(!this.data.firstTime  ){
			$('.mainInput').focus();
		}else{
			this.data.firstTime = false;			
		}
		if(Session.get('highlight')){
			$(Session.get('highlight')).toggleClass('itemHighlight');
		}
	}
/*	function notificationSytem(t){
		for(x=t.data.chat.length;x>0;x--){
			if(typeof t.data.chat[x] != "undefined"){
				if(t.data.chat[x].userId == Meteor.user()._id && t.data.chat[x].read ==false){
					$("#mNotif").addClass('mNotif');
					chatPop.OPEN();
					break;
					return true;
				}
			}
		}
	}*/

	Template.items.created = function(){
		if(typeof this.data !='undefined'){
			this.data.firstTime = true;
			if(this.data.userId == Meteor.user()._id){
				for(x=this.data.chat.length;x>0;x--){
					if(typeof this.data.chat[x] != "undefined"){
						if(this.data.chat[x].read == false){
							$("#mNotif").addClass('');
							return true;
						}
					}
				}
			}	
		}
		$(".chatMsgBox").tinyscrollbar();
	}

	Template.chatContent.helpers({
	  firstTime: true
	});	


	Template.items.item = function(){
		return Items.find({active : true});
	}
	Template.itemContent.height = function(){	
		if(this.chat.length >=1){
			return '120px'
		}else{
			return '0px'
		}
	}

	Template.items.events = {
		'click .itemTextChat' : function(e){

		},

		'keypress .itemChatInput' : function(e){
			if(e.keyCode == 13){
				s = new submitChat(e,this).analyse();
				$(e.target).blur();					
				$(e.target).val("");			
			}else{
				//fancy shit
			}
		}
	}
	Template.chatMsgBox.cht = function(){
		return this.chat
	}

	Template.login.events = {
		'mouseenter a.login-link-text' : function(e){
		},
		'mouseleave a.login-link-text' : function(e){
		}

	}


	Template.settings.events = {
		'click #settingsMenuBtn' : function(e){
			$("#settingsContent").toggleClass('hide');
		}
	}


	Template.topBar.events = {
		'click #mLogout': function () {
			Meteor.logout();
		},
		'click #mProfile': function(){
			$("body").animate({ scrollTop: 0}, 500);
			$("#profilePage").toggle();
			$("#globalFeedPage").toggle();
		},
		'click #mSidebar' : function(){
			chatPop.TOGGLE();
		},	  
	};	

	Template.mainInput.events = {
		'keypress .mainInput' : function(e){
			if(e.keyCode == 13){
				itemId = $(e.target).attr('chatto');
				if(itemId == 'null'){
					return false;
				}				
				s = new submitChat(e,itemId).analyse();
				Session.set('highlight', ".item_P_"+itemId);
				h = document.getElementById("chatMsgBox_P_"+itemId).scrollHeight+100;
				$("#chatMsgBox_P_"+itemId).animate({ scrollTop: h}, 500);
				$(e.target).focus();			
				$(e.target).val("");			
			}else{
				$(e.target).val($(e.target).val());
			}			
		}		
	}

	Template.posttxt.events = {
		'click #postBtn' : function(){
			v = $("#posttxt").val();
			price 	= ""
			user 	= Meteor.user();
			chat 	= new Array();
			group 	= new Array();
			group[0] = user._id;
			if(v.length<=200){
				Items.insert({	text: v, price : price, active : true, 
								userEmail: user.emails[0]['email'],
								timestamp 	: utz.unix(),
								dateTime  	: utz.dateTime(utz.unix()),
								userId	  	: user._id, 
								chat 		: chat,
								group 		: group
							});
				$("#posttxt").val("");
				$("html, body").animate({ scrollTop: $(document).height() }, 1000);
			}
			else{
				$("#postCharCount").empty().text("Too Long");
			}
		},
		'keyup #posttxt ': function(e){
			v = $(e.currentTarget).val();
			len = 200 - v.length;
			if(len<=20){
				$("#postCharCount").css('color', 'black');
			}else{
				$("#postCharCount").css('color', '#BFBFBF');
			}
			$("#postCharCount").empty();
			$("#postCharCount").text(len);
		},
		'click #posttxt' : function(e){
			$(e.target).val("");
			v = $(e.target).val();
			if(v != "What Do You Want" && v.length == 0){
				$(e.target).val("");
			}
		}
	}	

	function standardTextHover(slct){
	}

	function submitChat(e,itemId){
		this.itemId = itemId;
		this.v = $(e.target).val();
		this.e = e;
		this.detectPrice 	= function(){
			vL = this.v.length;
			tag = this.v.indexOf("#$");
			if(tag != -1){
				tb = true
			}
			else{
				tb = false
			}
			if(tb){
				pNum = v.substr(tag+2, vL-tag);
				pNum = parseInt(pNum);
				return pNum;
			}
			else{
				return null;
			}
		},

		this.analyse 	= function(){
			if(this.v.length>0){
				j = {
					price 		: this.detectPrice(this.v),
					timestamp	: utz.dateTime(utz.unix()),
					userId 		: Meteor.user()._id,
					text 		: this.v,
					read 		: false
				}
				g = this.appendToGroup();
				if(!g){
					this.submit_WithUser(j);
				}else{
					this.submit_WithoutUser(j);
				}
			}
		},

		this.submit_WithUser 	= function(j){
			Items.update({'_id': this.itemId}, {$push : { chat : j, group : Meteor.user()._id}}, 
				{multi : false});
		},
		this.submit_WithoutUser = function(j){
			Items.update({'_id': this.itemId}, {$push : { chat : j}}, 
				{multi : false});
		},
		this.appendToGroup	= function(){
			try{
				ui = Items.find({'_id' : this.itemId}).fetch()[0];
				for(x=0;x<=item.group.length;x++){
					if(item.group[x] == Meteor.user()._id){
						return true;
					}else{
						return false
					}
				}
			}catch(e){

			}
		}
	}


	chatPop = {
		TOGGLE : function(){
			$("#sideBarLayer").toggleClass('span4');
			$("#sideBarLayer").toggleClass('offset7');
			$("#sideBarLayer").toggleClass('span8');
		},
		OPEN 	: function(){
			$("#sideBarLayer").slideDown('fast')
		},
		close 	: function(){
			$("#sideBarLayer").slideUp('fast')
		}
	}

}









if (Meteor.is_server) {
  Meteor.startup(function () {

  });

   Meteor.publish('userItems', function(){
   		if( this.userId() != null){
   			find = userItems.find({active : true, userId : this.userId()}).fetch()[0];
   			if(typeof find != 'undefined'){
   				return userItems.find({active : true});
   			}else{
   				items = [];
   				userItems.insert({'active' : true, userId : this.userId(), items: items});
   				return userItems.find({active : true});
   			}
   		}
   });      

   Meteor.publish('items', function(){
   	return Items.find({active : true});
   });   

   Meteor.publish('loggedInUsers', function(){
   		if( this.userId() != null){
  			j = loggedInUsers.find({userId : this.userId()}).fetch();
   			if(j.length>1){
				loggedInUsers.update({'userId': this.userId()}, {$addToSet : { loggedIn : false}});
	   		}else{
   				loggedInUsers.insert({userId : this.userId()});	   			
	   		}
   			return loggedInUsers.find({userId : this.userId()})
   		}
   });

}

