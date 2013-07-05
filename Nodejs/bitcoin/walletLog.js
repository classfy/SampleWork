
var updateDb = function (data,userId,fn){
	var common = require("../../common.js");
	var dbCall = common.dbCall('wallet');
	dbCall.call.update( {userId : userId},data, fn);
}	


var pushToArray = function(data,userId,fn){
	var common = require("../../common.js");
	var dbCall = common.dbCall('wallet');
	var dbData = { $push : { history : data}};
	dbCall.call.updateAll( {userId : userId},dbData, fn);
}

var commonUpdateData = function(updateLog,cb){
	var common = require("../../common.js");
	updateLog.created  = +new Date
	updateLog.updateId = common.uuid.v4()+common.uuid.v4();
	cb(updateLog);
}

exports.newDeposit = function(wallet, data,cb){
	/*
		Update type : 1
		sources:
			1 = bitcoin network
			2 = deposited from other user.
			...
	*/
	var createLog = function(fn){
		var updateLog = {
			amountDeposited : data.amountDeposited,
			updateType : 1,
			source : data.source,
			sourceName : data.sourceName,
		}
		commonUpdateData(updateLog,fn);
	}

	var saveToHistory = function(updateLog){
		pushToArray(updateLog, wallet.userId,cb);
	}

	var start = function(){
		createLog(function(updateLog){
			saveToHistory(updateLog);
		});
	}


	start();
}

exports.newWithdraw = function(wallet,data,cb){

	/*
		Update type : 2
		sources:
			1 = bitcoin network
			2 = btc sent to another user.
			...
	*/	

	var createLog = function(fn){
		var updateLog = {
			withdrawAmount : data.withdrawAmount,
			withdrawTo : data.btcAddress,
			updateType : 2,
			txId : data.txId,
			source : data.source,
			sourceName : data.sourceName,
		}
		commonUpdateData(updateLog,fn);
	}

	var saveToHistory = function(updateLog){
		pushToArray(updateLog, wallet.userId,cb);
	}

	var start = function(){
		createLog(function(updateLog){
			saveToHistory(updateLog);
		});
	}	
}
