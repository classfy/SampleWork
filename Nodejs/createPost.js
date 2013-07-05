/*
>>>>>>>>>>>>>>
8888888888888888888888888888888888888
8888888888888888888888888888888888888
	POST ROOT						
8888888888888888888888888888888888888
8888888888888888888888888888888888888
>>>>>>>>>>>>>>
*/

//===========================================

/*
>>>>>>>>>>>>>>
Create a post
----
Create a post for the user
>>>>>>>>>>>>>>
*/

function validate(req,form,cb){
	var vlr = "";
/*	req.app.db.validate.post.title(form.title, function(data){
		if(!data){
			cb(false)
		}else{
			good = true;
		}
	});
*/	
req.app.db.validate.post.price(form.price, function(data){
		if(!data){
			cb(true,"Price must be in this format: 120.00");
			return;
		}else{
			checkDescription(cb)
		}
	});

	function checkDescription (cb) {
		req.app.db.validate.post.description(form.description, function(data){
			if(!data){
				cb(true, "Description Error")
				return
			}else{
				cb(false,null);
			}
		});
	}
}

function addDetails(form, req, user, cb){
	form.created   	= new Date().getTime();
	form.url		= genUrl();
	form.userId 	= user._id;
	form.username 	= user.username;
	form.active 	= true;
	form.msgCount   = 0;
	
	function genUrl(){

		function x1(){return Math.floor(Math.random() * (Math.random() - Math.random() + Math.random())) + Math.random()};
		function x2(){return Math.floor(Math.random() * ( Math.random()- Math.floor((Math.random()*878899)+1) + 1)) + Math.random()};
		x3 = parseInt(form.created) + form.title + parseInt(x2())+parseInt(x1())
		root = parseInt(x1())+parseInt(x2())+parseInt(x3);
		root = Math.abs(parseInt(root*Math.random()/Math.log(Math.random())));
		root = root.toString(32);
		return root.toString(32);	
	}

	cb(form)	
}

function save(req,form,cb){
	req.app.db.db.post.create(form, function(err,data){
		cb(err,data)
	});
}



//==
//Get user source logged off
//===
function getUser(req,src,cb){

	if(typeof req.session.user =="undefined"){
		if(typeof src.data != 'undefined'){
			cb(src.data)
		}
	}
}

/*
==
	Post Creation Sources
==
*/
exports.createPost = function(req,res,src,cb){
	if(src.status == "LoggedIn"){

		user = req.session.user;

		generatePost(req,res,user, function(err,data){
			theCallback(err,data,cb)
		});

	}else if(src.status == "NotLoggedIn"){

		getUser(req,src, function(user){
			generatePost(req,res,user, function(err,data){
				theCallback(err,data,cb)
			});
		});

	}

	function theCallback(err,data,cbb){

		if(typeof cbb != "undefined"){
			cbb(err,data)
		}else{
			//nothing
		}
	}
}


/*
==|
>>>>Trigger Post Creation
==|
*/
function generatePost(req,res,user,cb){

	form = req.body;
	validate(req, form, function(err,vlr){
		if(!err){

			addDetails(form,req,user, function(form){
				save(req,form, function(err,data){
					if(!err){
						req.app.resp.created(res);
						cb(false,data);
					}
					else{
						req.app.resp.generic500(res);
						cb(true,err)
					}
				});

			});

		}else{
			req.app.resp.okData(res,vlr);
			cb(true,err);
			return;
		}
	});

}

/*
==
	Create Post When the user is logged in
==
*/
exports.create = function (req,res) {
	src = {
		status : "LoggedIn"
	}
	exports.createPost(req,res,src);
}

/*
>>>>>>>>>>>>>>
Read a post
----
Read a specific post
>>>>>>>>>>>>>>
*/

function getPosts(req,cb){
	select = {"userId" : req.session.user._id, active : true}
	req.app.db.db.post.find(select, {}, function(err,data){
		cb(err,data)
	});
}

exports.read = function (req,res) {
	
	getPosts(req, function(err,data){
		if(!err){
			req.app.resp.okData(res,data)
		}else{
			req.app.resp.generic500(res);
		}
	});
}

/*
exports.update = function (req,res) {
	// body...
}

exports.delete = function (req,res) {
	// body...
}
*/