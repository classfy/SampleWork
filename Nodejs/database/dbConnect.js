var c = require("c.js");


module.exports = function(cb){

	c.dbPool = {};

	var MongoClient = require("mongodb").MongoClient;

	var port = 27017;

	var url = "mongodb://localhost:"+port+"/test";

	var coll = ["user", "transaction", "item", "ticket"];

	var bootC = 0;
	var booted = function(){
		bootC++;
		if(bootC == coll.length){
			cb();
		}
	}

		MongoClient.connect(url, function(err, db) {
			if(!err){
				for(var x in coll){
					c.dbPool[coll[x]] = db.collection(x);
					booted();
				}
			}
		});
}