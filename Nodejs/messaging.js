/*
>>>>>>>>>>>>>>
8888888888888888888888888888888888888
8888888888888888888888888888888888888
	MESSAGING ROOT
8888888888888888888888888888888888888
8888888888888888888888888888888888888
>>>>>>>>>>>>>>
*/

/*	
	++++++++++
	CREATE a message and send to another user

	NOT A REPLY
	++++++++++
*/


var msg = require('../../web/email.js');


exports.create = function(req,res){

//================================================================
	/*
		If this message is regarding a post
	*/
//================================================================
/*	if(typeof req.body.postId.length > 0 ){
		incrementStats(req,function(err,data){
			if(!err){

			}else{

			}
		});		
	}*/

//================================================================
	/*
		Processes
	*/
//================================================================
	
	//Generate Message Json
	theMessage = exports.createMessageContent(req, function(emailJson){
		//req.app.resp.createdData(res,msg);
	});


	//Check if a thread between these 2 users exists
	exports.checkIfThreadExists(req, function(err,threadExists){
		if(!err){
			if(threadExists){

				//-----------------------
				// Add to existing thread
				//-----------------------
				exports.addToThread(req,theMessage, threadExists, function(err,data){
					if(!err){
						req.app.resp.createdData(res,"Reply Sent");
						// Send Email Alert
					}else{
						req.app.resp.generic500(res)
					}

				});

			}else{

				//-----------------------------
				// Create thread and Add to it
				//----------------------------		
				
				exports.createThread(req,function(err,thread){
					if(!err){

						exports.addToThread(req,theMessage, thread, function(err,data){
							if(!err){
								req.app.resp.createdData(res,"Message Sent");

								email.newResponse(req,thread,theMessage)
							}else{
								req.app.resp.generic500(res)
							}

						});
					}else{
						req.app.resp.notFound(res)
					}
				});				
			}
		}else{
			req.app.resp.generic500(res);
		}
	});


}

//################################################################
//################################################################
//################################################################
//================================================================
	/*
		Email Alerts
	*/
//================================================================

	var email = {

		newResponse : function(req,thread,theMessage){
				op = {
					recipients : theUser2.email,
					subject : "New Response",
					from : "infoTrader@infoTrader.co",
					body : { 
						content : ""
					}
				}
				msg.email.newResponse(op,function(){
				});
			}
		}


//================================================================
	/*
		Find User2
	*/
//================================================================	
	function getUser2(req,fn){
		if(typeof theUser2 != 'undefined'){
			fn(null,theUser2);
			return;
		}
		req.app.db.db.user.profileWithUsername(req.params.userId, function(err,user){
			theUser2 = user;
			fn(err,user)
		});
	}
//================================================================
	/*
		addToThread
	*/
//================================================================

exports.addToThread = function(req,message,thread, cb){
	select = {"_id" : thread._id};
	update = {$push : { messages : message }}
	req.app.db.db.msg.addToThread(select,update, function(err,res){
		cb(err,res)
	});
}
//================================================================
	/*
		checkIfThreadExists
	*/
//================================================================

exports.checkIfThreadExists = function(req,cb){

	getUser2(req,function(err,user_a){
		if(!err){
			user_b = req.session.user.username;
			select = {$or : [{ user1_name : user_a.username, user2_name : user_b}, {user1_name : user_b, user2_name : user_a.username}]};
			req.app.db.db.msg.findUserThread(select, function(err,data){
				if(!err){
					if(typeof data =="object"){
						cb(null,data);
					}else{
						console.trace()
						cb(true,null)
					}
				}else{
					console.trace()
					cb(true,null)
				}
			});
		}else{
			console.trace()
			cb(true,null);
		}
	});

}


//================================================================
	/*
		Updates post Statistics
	*/
//================================================================

function incrementStats(req){
	postId = req.params.id;

	update =  { $inc : { msgCount :  +1 }}
	select = {_id : postId}
	req.app.db.db.post.incrementStats(select,update, function(err,res){
		cb(err,res)
	});
}


//+================================================================
//	/*
//		Create  Thread
//	*/
//================================================================

exports.createThread = function(req,cb){
	

	getUser2(req,function(err,user){
		if(!err){
			generateThread(req,user, function(thread){
				req.app.db.db.msg.createMessageThread(thread, function(err,data){
					if(!err){
						cb(null,data[0]);
					}else{
						cb(500,data)
					}
				});

			});
		}else{
			cb(400,user)
		}
	});

	function generateThread(req,user2,fn){
		thread = {
			user1_id 	: req.session.user._id,
			user1_name  : req.session.user.username,
			user1_removed : false,
			user1_newMsg : false,

			user2_id 	: user2._id,
			user2_name  : user2.username,
			user2_removed : false,
			user2_newMsg : false,

			timestamp : new Date().getTime(),
			messages : new Array()

		}
		fn(thread)
	}
}

//================================================================
	/*
		Create Message Content
	*/
//================================================================

exports.createMessageContent = function(req,cb){
	form = req.body;
	newForm = {};
	newForm.timestamp   		= new Date().getTime();

	newForm.senderUsername 		= req.session.user.username;

	newForm.recieverUsername	= req.params.username
	newForm.recieverViewed 		= false;
	newForm.body				= form.msgText;

	newForm.user1_Msg_Deleted 	= false;
	newForm.user2_Msg_Deleted	= false;	

	if(typeof cb != "undefined"){
		cb(newForm)
	}
	return newForm;
}

//################################################################
//################################################################
//################################################################
//################################################################


/*	
	++++++++++
	Get a user's inbox
	All of messages
	++++++++++
*/
exports.read = function(req,res){
	userId = req.params.userId;
	req.app.db.db.msg.getMessages(userId, function(err,data){
		if(!err){
			req.app.resp.okData(res,data);
		}else{
			req.app.resp.generic500(res);
		}
	})

}
