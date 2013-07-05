var updateWalletDb = function (data,userId,fn){
	var common = require("../../common.js");
	var dbCall = common.dbCall('wallet');
	dbCall.call.update( {userId : userId},data, fn);
}


var walletUpdateFailed  = function(wallet,cb){

	this.newDeposit = function(err, data){
		//Log failed 
		finalcallback(err,data);
	}

	this.newWithdraw = function(err, data){
		finalcallback(err, data)
	}

	finalcallback = function(err,data){
		cb(true,"failed")
	}
}

module.exports = function(wallet){
	this.wallet = wallet;
	var common =  require("../../common.js");

	this.newWithdraw  = function(data, cb){
		
		var errFn = {
			
			btcNetwork : function(err,data){
				fcb(err,data);
			},

			withdrawLog : function(err,data){
				logUpdateFailed(data)
				fcb(err,data);
			},
			setNewBalance : function(err,data){
				fcb(err,data);
			}
		}
		var succFn = function(err,data){
			fcb(err, data);
		}


		var fcb = function(err,data){
			cb(err,data);
		}

		var sendBtcToAddress = function(fn){
			common.bitcoin.btcNetwork.sendToAddress({
				btcAddress  : data.receiverAddress,
				amount 		: data.withdrawAmount,
				comment		: data.comment,
			}, fn);
		}

		var setNewBalance = function(data){
			updateWalletDb({
				currentBalance : data.newBalance,
				totalWithdraw  : data.totalWithdraw,
			},wallet.userId,
			function(err,data){
				if(!err){
					succFn(err,data);
				}else{
					errFn.setNewBalance(err,data);
				}
			});
		}

		var logUpdateFailed = function(dataTx){
			var wuf = new walletUpdateFailed(wallet,cb);
			wuf.newWithdraw(dataTx);
		}

		var btcNetworkSuccess  = function(txid){
			//wallet log and app log
			data.txId = txid;
			common.bitcoin.action.walletLog.newDeposit(wallet, data,function(err,dbData){
				if(!err){
					setNewBalance(data);
				}else{
					errFn.setNewBalance(data)
				}
			});
		}

		sendBtcToAddress(function(err,dataTx){
			if(!err){
				btcNetworkSuccess(dataTx);
			}else{	
				errFn.btcNetwork(dataTx);
			}
		});
	}

	this.newDeposit = function(data, cb){

		var updateFailed = function(err){
			var wuf = new walletUpdateFailed(wallet,cb);
			wuf.newDeposit(err, data);			
		}

		var dbUpdateResult = function(err,data){
			if(!err){
				cb(true,null);
			}else{
				updateFailed();
			}
		}

		var update = {
			currentBalance : data.newBalance,
			totalReceived : data.totalReceived,
		};

		updateWalletDb(update, wallet.userId,function(err,uwData){
			if(!err){
				wallet.totalReceived = data.totalReceived;
				wallet.currentBalance = data.newBalance
				common.bitcoin.action.walletLog.newDeposit(wallet, data,dbUpdateResult);
			}else{
				updateFailed(err)
			}
		});
	}
}