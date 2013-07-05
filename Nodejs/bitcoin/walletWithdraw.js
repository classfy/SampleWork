var common = require("../../common.js");


var theFinalCallback = function(err,data,fn){
	if(!err){
		fn(err,data)
	}else{
		fn(true,"Error. Try again later.");		
	}
}

var updateDb = function (data,userId,fn){
	var dbCall = common.dbCall('wallet');
	dbCall.call.update( {userId : userId},data, fn);
}

var JSONtoAmount = function(value) {
    return Math.round(1e8 * value);
}


module.exports = function(profileWallet, form ,fcb){
	var common = require("../../common.js");

	var btcValue = function(numbr){
		var btcnum	= parseFloat(numbr);
		btcnum = JSONtoAmount(btcnum);
		return btcnum;
	}


	var profile 		= profileWallet.profile;
	var wallet 			= profileWallet.wallet;
	var withdrawAmount 	= form.withdrawAmount;
	var username 		= profile.username;
	var clientAddress	= form.withdrawAddress;





	var finalFn = function(err,data){
		fcb(err,data);
	}

	var errorFn = function(err,data){
		finalFn(err,data);
	}

	var succFn = function(err,data){
		finalFn(err,data);
	}



	var performChecks = function(wallet, cb){

		//===
		var checkBtcAddress = function(fn){

			var checkAddress = function(fnn){
				
				var len = {
					min : 27,
					max : 34
				}
				var bLen = profile.btcAddress.length;
				if(bLen>=len.min && bLen <= len.max){
					if(profile.btcAddress == clientAddress){
						fnn(false,null)
					}else{
						fnn(true,"Please refresh page and try again.");
					}
				}else{
					fnn(true, "Your withdraw bitcoin address is invalid");
				}

			}

			checkAddress(fn);
		}

		checkBtcAddress(wallet,cb);
	}


	var performWithdraw = function(cb){

		//===
		var calculateWithdraw = function(){
			var newTotalWithdraw = parseFloat(wallet.totalWithdraw) + parseFloat(withdrawAmount);
			var newBalance = parseFloat(wallet.totalReceived) - parseFloat(newTotalWithdraw);
			if(newBalance >= 0.0){
				updateWallet({
					newBalance 		: newBalance,
					totalWithdraw 	: newTotalWithdraw,
					withdrawAmount 	: withdrawAmount,
					receiverAddress : profile.btcAddress,});
			}else{
				cb(false,["Insufficient funds."]);
			}
		}

		var updateWallet = function(data){
			data.source = form.source;
			data.sourceName = form.sourceName;
			data.comment = "Withdraw_"+common.uuid.v4()+common.uuid.v4()
			var uw = new common.bitcoin.action.updateWallet(wallet);
			uw.newWithdraw(data, cb);
		}
		
		calculateWithdraw();
	}


	var start = function(){

		performChecks(function(err,pcData){
			if(!err){

				performWithdraw(function(err,data){
					if(!err){
						succFn(err,data);
					}else{
						errorFn(err,data);
					}
				});

			}else{
				errorFn(err,pcData);
			}
		});

	}

	start();
}

	