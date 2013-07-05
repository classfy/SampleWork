var c = require("c.js");

module.exports = function(coll,fnx){
	self = {};

	var optional = function(v){
		var e = typeof v == "undefined" ? {} : v;
		return e;
	}

	var fn = function(err,data){
		if(err){
			//Log database err
			err = ["Try again later."]
		}
		fnx(err,data);
	}

	var db = c.dbPool[coll];
	self.f = {

		findOne : function(call){
			call.sort = optional(call.sort);
			db.findOne(call.query,call.sort,fn);
		},

		find : function(call){
			call.sort = optional(call.sort);
			db.find(call.query,call.sort).toArray(fn);			
		},

		findPaginate : function(call){
			console.log("not implemented")
		}
	}

	self.update = {
		inc : function(call){
			mongoUpdate(call,"$inc")
		},
		set : function(call){
			mongoUpdate(call,"$set")
		},
		unset : function(call){
			mongoUpdate(call,"$unset")
		},
		replace : function(call){
			mongoUpdate(call,"replace")
		},
		array : {
			// Adds item to array
			push : function(call){
				mongoUpdate(call,"$push")
			},
			//Adds to array if it doesnt exist
			addToSet : function(call){
				mongoUpdate(call,"$push")
			},
			//Removes item from array
			pull : function(call){
				mongoUpdate(call,"$push")
			},
			//Removes first or last item from array. {field: -1 or 1}
			pop : function(call){
				mongoUpdate(call,"$push")
			}
		}
	}

	var mongoUpdate = function(uCall, uMethod){
		uCall.options.safe = true;
		
		if(uMethod != "replace"){
			uCall.update = { uMethod : uCall.update};
		}

		db.update(uCall.query, uCall.update, uCall.options,fn)
	}

	self.insert = function(call){
		db.insert(call, {safe : true}, fn);
	}

	self.rmv = function(call){
		db.remove(call,fn);
	}

	return self;
}