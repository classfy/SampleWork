

var c = require("c.js");

module.exports = function(){

	this.rawData = {};

	var modelData = function (){

		var group = {
			objectOwner : {read : ['price'], update : []},
			regUser 	: {read : [], update : []},
			noReg 		: {read : [], update : []},
		}	
		var objectData = {};

		objectData.transaction = {

			transactionId : {
				defaultValue : undefined,
				editable : false,
				validation : {
					datatype : "allString",
					maxChar : "0",
					minChar : "100"
				},
			},		
		}

		objectData.coreVal = {

			price : {
				required : true,
				permit : [
				validation : {
					dataType : "currency",
					currencyType : ['usd','btc','aud'],
					minVal : 1,
					maxVal : 1000000
				}
			},

			title : {
				required : true,
				validation : {
					dataType : "alphanumeric",
					minChar : 0,
					maxChar : 100,
				}
			},

			description : {
				required : true,
				validation : {
					dataType : "allString",
					minChar : 1,
					maxChar : 300,
				}
			},

			quantity : {
				required : true,
				validation : {
					dataType : "number",
					minVal : 1,
					maxVal : 10
				}
			},

			shippingCountries : {
				required : true,
				validation : {
					dataType : "array",
					arrayContent : "countryList" // #> must be a function
				}
			},

			coverPicture : {
				required : true
				validation :{
					dataType : "picture",
					maxFileSize : 5 //in Mb
				}
			}
		}
		
		objectData.booleanVal = {
			hidden : false,
			transactionEnded : false,
			deleted : false,
			promoted : false,
		}

		objectData.stats = {
			views : 0,
			buyClicks : 0,
			quantitySold : 0,
		}

		objectData.comments = {
			commenterId : {
				required : true
				validation : {
					type : "allString",
					minVal : 1,
					maxVal : 200
				}
			},
			commentText : {
				required : true,
				validation : {
					dataType : "allString",
					minChar : 1,
					maxChar : 400,
				}
			},		
		}

		this.rawData.objectModel = objectData;
	}

	var permission  = function(){

		var createMainObject = ['regUser'];

		var createSubjObject = ['regUser',objectOwner];

		var objectOwner = "sellerId";

		this.rawData.permissionData = object;
	}

}