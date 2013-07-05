var c = require("c.js");
var genV = require("./validate/genValidate.js")
var EventEmitter = require('events').EventEmitter;
var util = require('util');



/*
	Idea:
	Make new "user" datatype with permissions and everything from the model built in
	prototype a string and add fns
	
*/


module.exports = function(){


	/*
		Prototypes.
	*/
	arrContains = function(arr, obj) {
	    var i = arr.length;
	    while (i--) {
	        if (arr[i] === obj) {
	            return true;
	        }
	    }
	    return false;
	}

	var userModel = require("./model/user.js")();


	var middlewares = function(gp, req,res,next){



		var returnFn = function(){

			var returnVal = {};

			returnVal.render = function(){
				res.send(err,data)
			}

			returnVal.json = function(err,data){
				res.send(err)
			} 

			returnVal.err = {
				e500 : function(err){
					res.send(500)
				},
				e404 : function(err){
					res.send(404)
				}
			}

			return returnVal;
		}



		var mw = {};
		var construct = function(cb){

			var cReqUrl = function(fn){
				mw.reqUrl = req.params
				mw.reqUrl.xhr = req.xhr;
				fn();
			}

			var cReqUser = function(fn){
				if(!req.session.user){
					mw.reqUser = { settings  : {}};
					mw.reqUser.settings.userType1 = "noReg";
					mw.reqUser.settings.userType2 = "regular";
				}				
			}

			var cModel = function(fn){
				mw.model = require("./model/"+mw.reqUrl.dbColl+".js")();
			}


			mw.reqAllowed = false;
			var parseForm = function(){
				var form = req.body;
				mw.form = [];
				for( var fx in form){
					var aw = form[fx];
					var attr = fx.substr(fx.indexOf(".")+1,fx.length);
					var wrapper = fx.substr(0, fx.indexOf("."));
					var formObj = {}
					formObj[wrapper] = {};
					formObj[wrapper][attr] = form[fx];
					mw.form.push(formObj);
				}
			}

			cReqUrl(function(){
				parseForm();
				cReqUser();
				cModel();
				cb();
			});
		}

		var getObject = function(cb){
			var db = new c.dbCall(mw.reqUrl.dbColl, function(err, data){
				if(!err){
					mw.dbObject = data;
				}else{
					mw.dbObject = null;
				}
				cb(mw.dbObject);
			});
			var q = {query : ""};
			q["query"][mw.reqUrl.keyId ] = mw.reqUrl.valId;
			db.f.findOne(q);
		}

		/*
			Performs data validation
			output:
				err: error value of validation
				init : crud = actions to be done after validation

		*/
		var doValidate = function(cb){


			var formValidate = function(cb){
				var errArr = [];
				var cbCount = 0;

				var attrCheck = function(fnx){
					for( var arrF in mw.form){
						var formObj = mw.form[arrF];
						for(var wrapperf  in formObj){
							for( var attrf in formObj[wrapperf]){
								var vlObj = mw.model.modelSchema[wrapperf][attrf]['validation'];

								singleAttrUpdate(wrapperf, attrf, vlObj, formObj, function(err){
									cbCount++;
									if(err.err.length != 0){
										var errObj = {};
										errObj[wrapperf]= {};
										errObj[wrapperf][attrf] = err.err;
										errArr.push(errObj);
									}
									if(cbCount == mw.form.length ){
										fnx(null, errArr);
									}
								});			
							}
						}
					}
				}
				var miniReqCheck = function(fnx){
					var miniReq = new genV(mw.model);
					miniReq.checkMinimumReq(mw.reqUrl, mw.form, function(err){
						fnx(null,err)
					});			
				}
				var errArr = [];
				c.async.parallel({ attrCheck : attrCheck, miniReqCheck : miniReqCheck}, function(err,data){
					// Totally reject if minimum input requirements are not met
					if(data.miniReqCheck.length != 0 ){
						cb({"general" : { "minimumRequirement" : data.miniReqCheck}});
					}else{
					// callback result of input text checkking	
						cb(data.attrCheck);
					}
				});

			}

			var singleAttrUpdate = function(wrapper,attr , vlObj, formObj, fn){
				var vlKey = wrapper+"."+attr;
				if(wrapper in formObj){
					var vlFn = new genV(mw.model);
					vlFn.on("validated", function(err){
						console.log('dssssss')
						fn(err);
					});
					vlFn.check(vlObj, wrapper, attr, formObj[wrapper][attr]);
				}else{
					var errVal = ["Failed Key"];
					fn(errVal);
				}				
			}


			if( typeof mw.reqUrl.attr != "undefined"){
				var vlObj = mw.model.modelSchema[mw.reqUrl.wrapper][mw.reqUrl.attr]['validation'];
				singleAttrUpdate(mw.reqUrl.wrapper, mw.reqUrl.attr, vlObj, mw.form[0], cb)
			
			}else{
				formValidate(cb);
			}			
		}


		/*
			Is the user allowed to do the crud action?
			input:
				crudVal = crud : {create : ['item']...ect}
			output
				false = can do it
		*/
		var doCrudPermitCheck = function(crudval,cb){
			var crud = {};

			crud.create = function(action, fn){
				if(arrContains(crudval['create'], mw.reqUrl.dbColl)){
					if(crudval['create'].indexOf("!") == -1){
						fn(false)
					}
				}else{
					fn(true);
				}
			}

			var theRest = function(action, fn){
				var actval = crudval[action];
				if(arrContains(actval[mw.reqUrl.dbColl][mw.reqUrl.wrapper], mw.reqUrl.attr)){
					fn(false)
				}else{
					fn(true)
				}
			}

			crud.update = crud.read = theRest;
			crud[mw.reqUrl.action](mw.reqUrl.action,cb);
		}


		/*
			General Permit Check
			gp: 
				* General Permission model is required.
			output: 
				changes mw.reqAllowed
				moves to object permit check
		*/
		var doGeneralPermitCheck = function(cb){

			var userTypeValidation = function(fn){


				var auth = function(fnx){

					var doAuthCheck = function(fnx){
						if(mw.reqUser.auth == true){
							fnx(false);
						}else{
							fnx(true);
						}
					}


					var init = {
						crud : function(){
							if(typeval["auth"] == false){
								fnx(false);
							}else{
								doAuthCheck(fn);
							}
						}
					}

					init[mw.reqUrl.init]();
				}


				var db = function(fnx){

					if(typeof typeval[db] == "undefined"){
						fnx(false);
						return;
					}

					var dbcheck = typeval['db'][mw.reqUrl.dbColl];

					for(var wrapper in dbcheck){
						for( var attr in dbcheck[wrapper]){
							if(reqUser[wrapper][attr] != dbcheck[wrapper][attr]){
								fnx(true)
							}
						}
					}
					fnx(false)
				}




				var typeval = gp[mw.reqUser.settings.userType1][mw.reqUser.settings.userType2]['userTypeValidation'];
				auth(function(err){
					if(!err){
						db(fn);
					}else{
						fn(err)
					}
				});
			}


			userTypeValidation(function(err){
				if(!err){
					doCrudPermitCheck(
						gp[mw.reqUser.settings.userType1][mw.reqUser.settings.userType2]['crud'],
						function(err){
							
							/*
								If a permission is not granted here.
								It maybe granted in object permit
							*/
							mw.permitAllowed =  err;
							cb();
					});
				}else{
					returnFn().json(err);
				}
			});			
		}

		/*
			Object permit
			gp: 
				* General Permission model is required.
			output: 
				changes mw.reqAllowed
				moves to object permit check
		*/
		var doObjectPermit = function(cb){
			var permit = mw.model.permit.theObj;
			var wrapper = mw.reqUrl.wrapper;
			var attrName = mw.reqUrl.attr;

	
			/*
				Is this the object owner?
			*/
			var ownerPermit = function(cb){
				var owners = permit.owners;
				var checkOwner = function(sessVal, objVal, permitObject){
					if(sessVal == objVal){
						cb(false, permitObject);
					}else{
						cb(true, null);
					}
				}

				for( var owner in owners){
					var ownerAttrKey = owners[owner]['attrKey'];
					if(owner.indexOf(".") != -1){
						checkOwner(reqUser[owner],mw.dbObject[ownerAttrKey], owners[owner]);
					}
				}
			}

			/*
				Can CURD action be performed on this object?
			*/
			var crudPermit = function(permitObject, cb){
				var crudPermit = permitObject['crud'];
				crudValidation(permitObject.crud, self.reqUrl, function(err){
				
					/*

					incomplete

					*/
					if(!err){

					}else{

					}
				});
			}

			/*
				you dont always have to get an object...
			*/

			getObject(function(dbObject){
				if(dbObject){
					ownerPermit(dbObject, function(err, permitObject){
						if(!err){
							crudPermit(dbObject,permitObject, function(err){

							});
						}else{
							cb(err);
						}
					});
				}else{
					cb(dbObject);
				}
			});
		}

		var run = function(){

			var initActionCb = function(err,data){

			}


			var validationCb = function(err){

				var vlp = {
					'vl' : function(){
						if(mw.reqUrl.xhr){
							returnFn().json(err);
						}else{
							returnFn().err.e500(err)
						}
					},
					'do' : function(){
						if(err.length == 0 ){
							require("./initActions/"+mw.reqUrl.init+".js")(mw, initActionCb);
						}else{
							this.vl();
						}
					},
				}

				if( typeof vlp[mw.reqUrl.validate] != "undefined"){
					vlp[mw.reqUrl.validate]();
				}else{
					returnFn().err.e500();
				}
			}

			if(typeof mw.reqUrl.attr == "undefined"){
				doValidate(validationCb);				
			}else{
				doObjectPermit(function(){
					doValidate(validationCb);	
				});
			}
		}

		construct(function(){
			doGeneralPermitCheck(function(){
				run();
			});
		});
	}

	this.genRoutes = function(){
		var dbColl = require("./dbColl.js");

		var dbCollActions = {
			create : "post",
			read : "get",
		}

		var attrActions = {
			create : "post",
			update : "put",
		}

		for( var dbc in dbColl){
			var dbcx = dbColl[dbc];
			var model = require("./model/"+dbcx+".js")();
			var ms = model.modelSchema;

			for(var action in dbCollActions){
				c.app[dbCollActions[action]](model.routing.dbCollUrl, 
					middlewares.bind(this,userModel.permit.generalPermit),
					function(){});			
			}

			for(var action in attrActions){
				c.app[attrActions[action]](model.routing.attrUrl, 
					middlewares.bind(this,userModel.permit.generalPermit),
					function(){})
			}
		}
	}
	return this;
}