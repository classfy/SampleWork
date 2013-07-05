module.exports = {
	bitcoin :  require("bitcoin"),
	
	client : function (user,cb) {
		var client = new this.bitcoin.Client({
		  host: 'localhost',
		  port: 8332,
		  user: 'classfyApp',
		  pass: 'thisisapassword!@#123'
		});
		return client;
	},

	newAddress : function(cb){
		var client  = this.client();
		client.cmd("getnewaddress", function(err,data){
			if(!err){
				cb(false,data);
			}else{
				cb(true,err);
			}
		});
	},

	getBalance : function(btcAddress,conf, cb){
		var client = this.client();
		client.cmd("getbalance",btcAddress,conf,function(err,data){
			if(!err){
				cb(false,data);
			}else{
				cb(true,err);
			}
		});		
	},

	getReceivedByAddress : function(btcAddress, conf,cb){
		var client = this.client();
		client.cmd("getreceivedbyaddress",btcAddress, conf, function(err,data){
			if(!err){
				cb(false,data);
			}else{
				cb(true,err);
			}
		});				
	},

	sendToAddress : function(data,cb){
		var client = this.client();
		client.cmd("sendtoaddress",data.btcAddress, parseFloat(data.amount), data.comment, function(err,txId){
			if(!err){
				cb(false,txId);
			}else{
				cb(true,err);
			}
		});			
	}
}