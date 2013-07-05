var c = require("c.js");
var EventEmitter = require('events').EventEmitter;
var util = require('util');


var Validate = function(modelObj){

	var vt = {};


	arrContains = function(arr,obj) {
	    var i = arr.length;
	    while (i--) {
	        if (arr[i] === obj) {
	            return true;
	        }
	    }
	    return false;
	}

	var self = this;
	var gl = {};
	var nodevl = require('validator');
	var Validator = nodevl.Validator;

	Validator.prototype.error = function (msg) {
	    this._errors.push(msg);
	    return this;
	}

	Validator.prototype.getErrors = function () {
	    return this._errors;
	}

	self.err = [];
	/*
		Data type check
	*/

	var dataType = {};

	String.prototype.capitalize = function() {
	    return this.charAt(0).toUpperCase() + this.slice(1);
	}
	
	dataType.anyString = function(cb){
		var vl = new Validator();
		vl.check(gl.val).len(gl.vlObj.min,gl.vlObj.max);
		cb(vl.getErrors());
	}	
	dataType.password = function(cb){
		var vl = new Validator();
		vl.check(gl.val,gl.attr+" must be alphanumeric.").isAlphanumeric();
		var errMsg = gl.attr+" must be between "+gl.vlObj.min+" - "+gl.vlObj.max+" characters.";
		vl.check(gl.val, errMsg).len(gl.vlObj.min,gl.vlObj.max);
		cb(vl.getErrors());
	}
	dataType.alphanumeric = function(cb){
		var vl = new Validator();
		vl.check(gl.val,gl.attr+" must be alphanumeric.").isAlphanumeric();
		var errMsg = gl.attr+" must be between "+gl.vlObj.min+" - "+gl.vlObj.max+" characters.";
		vl.check(gl.val, errMsg).len(gl.vlObj.min,gl.vlObj.max);
		cb(vl.getErrors());
	}
	dataType.email = function(cb){
		var vl = new Validator();
		vl.check(gl.val).isEmail();
		cb(vl.getErrors());
	}	
	dataType.integer = function(cb){
		var vl = new Validator();
		var errMsg = gl.attr+" is not a valid integer."
		vl.check(gl.val, errMsg).isInteger()
		vl.check(gl.val, errMsg).min(gl.vlObj.min).max(gl.vlObj.max);
		cb(vl.getErrors());
	}
	dataType.currency = function(cb){
		var vl = new Validator();
		var errMsg = gl.attr+" is not a valid currency value like: 12.34"
		vl.check(gl.val, errMsg).isFloat();
		errMsg = gl.attr+" must be be betweet "+gl.vlObj.min+" - "+gl.vlObj.max;
		vl.check(gl.val,errMsg).min(gl.vlObj.min).max(gl.vlObj.max);
		cb(vl.getErrors());
	}
	dataType.arrayList = function( cb){
		var vl = new Validator();
		var errMsg = gl.attr+" is not in the list."		
		vl.check(gl.val, errMsg).isIn(gl.vlObj.arrList);
		cb(vl.getErrors());		
	}
	dataType.image = function(cb){
		console.log("not implemented");	
	}
	dataType.boolean = function(cb){
		if(typeof gl.val != "boolean" ){
			cb(["Not a boolean."])
		}else{
			cb([])			
		}
	}

	var dataTypeCheck = function(vlVal,cb){
		dataType[vlVal](cb)
	}	

	var uniqueCheck = function(vl,fn){

		var dbResult = function(err,data){
			if(!data){
				fn([]);
			}else{
				fn(["Enter unique "+gl.attr]);
			}
		}
		var db = new c.dbCall(modelObj.dbColl, dbResult);
		var qKey = gl.wrapper+"."+gl.attr;
		var q = {};
		q[qKey] = gl.val;
		db.f.findOne({query : q});
	}

	var requiredCheck = function(vl,fn){
		if(typeof gl.val != "undefined"){
			fn([])
		}else{
			fn([key+" is required."]);
		}
	}

	self.vlFn = {
		dataType : dataTypeCheck,
		unique 	: uniqueCheck,
		required : requiredCheck,
	}


	var appendErr = function(err){
		self.err = self.err.concat(err);
	}

	var skipVals = ['min','max',]

	this.check = function( vlObj,wrapper, attr, val ){
		gl.vlObj = vlObj;
		gl.wrapper = wrapper;
		gl.attr = attr;
		gl.val = val;
		for( var vx in gl.vlObj){
			if(!arrContains(skipVals, vx)){
				self.vlFn[vx](gl.vlObj[vx],appendErr);
			}
		}
		//Database is taking longer than for loop to finish 
		//make the instance before the loop and count the number of attrs & cb
		self.emit('validated',{ err : self.err });
	}

	this.checkMinimumReq = function(reqUrl, form,cb){
		/*
			check to see if all the minimum requirements in
			model.minimumReq[init][action][wrapper] = [attr]
			is inside mw.form
		*/

		var fn = {
			err : function(){
				cb(["Enter all required inputs."])
			},
			succ : function(){
				cb([])
			}
		}
		try{

			var miniReq = modelObj.minimumReq[reqUrl.init][reqUrl.action]
			var mqArr = {};

			for( var fx in form){
				var fxm = form[fx];

				for(var wrapperf in fxm){
					
					if(typeof mqArr[wrapperf] == 'undefined'){
						mqArr[wrapperf] = miniReq[wrapperf].length;
					}

					for(var attrf in fxm[wrapperf]){
						for(var x in miniReq[wrapperf]){
							if(attrf == miniReq[wrapperf][x] && fxm[wrapperf][attrf] != ""){
								mqArr[wrapperf]--;
							}
						}
					}
				}
			}

			for(var x in mqArr){
				if(mqArr[x] != 0){
					fn.err();
					return;
				}
			}	

			fn.succ()

		}catch(e){
			cb(["Enter all required inputs."])
		}
	}
}
util.inherits(Validate, EventEmitter);
module.exports = Validate;
