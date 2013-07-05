var c = require("c.js");

module.exports = function(mw, cb){

	var finalCallback = function(err,data){
		cb(err,data);
	}


	var dbCall = function(cb){
		var db = new c.dbCall(mw.reqUrl.dbColl, finalCallback);
		cb(db)
	}

	var encryptForm = function(fn){
		var enCount = 0;
		for( var fx in mw.form){
			var fxm = mw.form[fx];
			for( var wrapperf in fxm){
				for( var attrf in fxm[wrapperf]){
					var encry = mw.model.modelSchema[wrapperf][attrf]['encryption'];
					if(typeof encry != "undefined"){
						enCount++;
						c.crypt().encrypt(fxm[wrapperf][attrf], encry, function(wrapperf, attrf,fxm, err,data){
							if(!err){
								mw.form[fxm][wrapperf][attrf] = data
								if(enCount == mw.model.misc.encryptedAttr){
									fn();
								}
							}else{								
								finalCallback(true,["Failed to validate!"]);
							}
						}.bind(this, wrapperf, attrf,fx))
					}
				}
			}
		}
		if(enCount == 0){
			fn();
		}
	}

	var convertFormForDb = function(cb){
		var form = mw.form;
		var dbf = {}
		for( var fx in mw.form){
			var fxm = mw.form[fx];
			for( var wrapperf in fxm){
				if(!dbf.hasOwnProperty(wrapperf)){
					dbf[wrapperf] = {}
				}
				for( var attrf in fxm[wrapperf]){
					dbf[wrapperf][attrf] = fxm[wrapperf][attrf];
				}
			}
		}
		mw.databaseForm = dbf;
		cb();
	}
	var doAction = {};

	doAction.create = function(){
		dbCall(function(db){
			convertFormForDb(function(){
				db.insert(mw.databaseForm);
			});
		});
	}

	encryptForm(function(){
		doAction[mw.reqUrl.action]();
	})

}