

var sys 	= require('sys');
var events 	=  require('events').EventEmitter;

var inAppTransaction = function(key,val){

	var common = require("../../../common.js");
	var self = this;
	this.transaction = {}

	//update wallet attributes
	this.update = {};

	this.wallet = {};
	//transfer btc to another user
	this.transaction.sendToUser = function(){

	}

	// get wallet
	this.getWallet = function(cb){
		common.bitcoin.action.getWallet(key,val,function(err,data){
			if(!err){
				self.wallet = data;
				cb(false,data);
			}else{
				cb(true,["Couldn't get wallet"]);
			}
		});
	}

}




sys.inherits(inAppTransaction, events);
module.exports = inAppTransaction;