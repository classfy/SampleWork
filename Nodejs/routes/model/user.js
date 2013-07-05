

var c = require("c.js");

module.exports = function(){
	var self = {};
	self.dbColl = "user";
	self.misc = {
		encryptedAttr : 1
	}
	self.modelSchema = {};
	//Model Schema

	var modelData = function(){

		var account = {}

		account.username =	{
			validation : {
				dataType : "alphanumeric",
				min:1,
				max:200,
				required : true,
				unique : true, 
			},
			callback : function(){},

		}

		account.password =	{
			validation : {
				dataType : "password",
				min:5,
				max:200,
				required : true,
			},
			encryption : {
				algorithm : "sha512",
				saltLength : 512,
			},
			callback : function(){},
		}

		account.email =	{
			validation : {
				dataType : "email",
				required : true,
				unique : true, 
			},
			callback : function(){},
		}

		account.coverPic =	{
			validation : {
				dataType : "image",
				required : false,
			},
			callback : function(){},
		}

		account.paypal =	{
			validation : {
				dataType : "email",
				required : false,
			},
			callback : function(){},
		}


		var settings = {};

		settings.userType2 =	{
			attributes : {
				defaultValue : "seller", // Seller, nonSeller,
			},
			validation : {
				dataType : "string",
			},
			callback : function(){},
		}

		settings.userType1 =	{
			attributes : {
				defaultValue : "member", // member,
			},
			validation : {
				dataType : "string",
			},
			callback : function(){},
		}

		settings.publicView =	{
			attributes : {
				defaultValue : true,
			},
			validation : {
				dataType : "boolean",
			},
			callback : function(){},
		}

		settings.verifiedEmail =	{
			attributes : {
				defaultValue : false,
			},
			validation : {
				dataType : "boolean",
			},
			callback : function(){},
		}


		var stats = {};


		settings.logins =	{
			attributes : {
				defaultValue : 0,
			},
			validation : {
				dataType : "incremental",
			},
			callback : function(){},
		}

		self.modelSchema = {
			stats : stats,
			account : account,
			settings : settings
		}

	}
	modelData();


	/*
		Permissions gained for being associated to this object.
		All of these can only by done on this object ONLY.
	*/
	var thisObjPermit = {

		owners : { // meaningless for now
			"_id" : { // sessionValue
				attrKey : ['_id'],
				crud : {
					create : null,
					read : {
						user : {
							account : ['email', 'paypal'],
							settings : ['publicView','userType', 'verifiedEmail']
						}
					},
					update : {
						user : {
							account : ['email', 'password', 'coverpic', 'paypal'],
							settings : ['publicView','verfiedEmail'],
						}
					},
					delete : []
				}
			}
		}, 
	}


	/*
		Common permissions of seller and non seller
	*/
	var commonPermit  = {
		create : ['ticket', 'transaction', '!user'],
		read : {
		},
		update : {
		},
		delete : {
		}
	}


	/*
		General Permissions
	*/
	var generalPermit  = {

		member : { //Usertype1
			seller : { //Usertype2
				crud : {
					create : ['item'].concat(commonPermit.create),
					read : null,
					update : null,
					delete : null,
				},
				userTypeValidation : {
					auth : true,
					db : {
						// Db Coll
						user : {
							// mongo call
							settings : {
								userType2 : 'seller',
							}
						},
					}
				}
			},
			nonSeller : {
				crud : {
					create : [].concat(commonPermit.create),
					read : null,
					update : null,
					delete : null
				},
				userTypeValidation : {
					auth : true,
					db : {
						user : {
							settings : {
								userType2 : 'nonSeller',
							}
						},
					}
				}				
			}
		},	

		/*
			Everyone can do these.
		*/
		noReg : {
			regular : {
				crud : {
					create : ['user'],
					read : {
						user : {
							account : ['username', 'coverpic']
						}
					},
					update : null,
					delete : null					
				},
				userTypeValidation : {
					auth : false,
				}	
			}

		}		
	}


	self.permit = {
		theObj : thisObjPermit,
		generalPermit : generalPermit,
	}

	/*
		Minimum requirements to create this object
	*/

	self.minimumReq = {
		crud : {
			create : {
				account : ['username', 'email', 'password']
			}
		},
	};

	self.routing = {
		prefix : "/app",
		attrUrl : "app/:init/:action/:dbColl/:wrapper/:attr/:keyId/:valId/:validate",
		dbCollUrl : "/:init/:action/:dbColl/:validate",
	}

	return self;
}