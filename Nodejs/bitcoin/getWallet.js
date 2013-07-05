
var dbCall = function(select,coll,fn){

	var common = require("../../common.js");
	
	var dbCall = common.dbCall(coll);
	dbCall.call.findOne(
		select,
		function(err,data){
			fn(err,data);
		}
	);	
}

var getWallet = function(key,val){
	var select = {};
	select[key] = val;
	dbCall(select, 'wallet', cb);
}



module.exports = function(key,val fn){
	var common = require("../../common.js");

	var theFinalCallback = function(err,data){
		fn(err,data);
	}

	var calcNewBalance = function(wallet, tb){
		var newBalance = tb - wallet.totalWithdraw;
		var amountDeposited = wallet.totalReceived - tb;
		updateTheWallet({
			newBalance : newBalance, 
			amountDeposited : amountDeposited,
			totalReceived : tb}, wallet);
	}

	var checkChange = function(tb,wallet){

		var balCheck = wallet.totalReceived - wallet.totalWithdraw;
		if(wallet.totalReceived == tb && balCheck == wallet.currentBalance){
			theFinalCallback(false,wallet);	
		}else{
			calcNewBalance(wallet,tb);
		}
	}

	var updateTheWallet = function(data, wallet){

		//source 1 = Source of deposit is from the bitcoin network.

		data.source = 1;
		data.sourceName = "External";
		var uw = new common.bitcoin.action.updateWallet(wallet);
		uw.newDeposit(data,function(err,data){
			if(!err){
				theFinalCallback(false,wallet);
			}else{
				theFinalCallback(true,err);
			}
		});
	}		

	var getUserWallet = function(key, val){

		getWallet(key,val, function(err,wallet){
			if(!err){
				getReceivedByAddress(wallet);
			}else{
				theFinalCallback(true,err);			
			}
		});
	}

	var getReceivedByAddress = function(wallet){
		common.bitcoin.btcNetwork.getReceivedByAddress(wallet.address, 0,function(err,tb){
			if(!err){
				checkChange(tb,wallet);
			}else{
				theFinalCallback(true,"Wallet is down.");
			}
		});
	}
	getUserWallet(key,val);
}
