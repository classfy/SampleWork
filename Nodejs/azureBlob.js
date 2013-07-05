var azure = require('azure');
var uuid = require('node-uuid');
var fs=require('fs');
var https=require('https');
var http=require('http');
var mongo     		= require('mongoskin');

var storageSettings = {

	externalDb : ' ',
	localDb : "",
	azureAccountName : "mediaclassfy",
	azureAccessKey : ""

}
var image = {

	err : {
		blobConnection : "Err: az.s.image.connection. Connection Problem ",

	},
	displaypicContainer : "mediaclassfy-displaypic",
	galleryContainer : "mediaclassfy-gallery",
	connect : function(containerName){
		var self = this;
		blobService = azure.createBlobService(storageSettings.azureAccountName,storageSettings.azureAccessKey);
		blobService.createContainerIfNotExists(containerName, function(error){
		    if(!error){
				blobService.setContainerAcl(containerName
				    , 'blob'
				    , function(error){
				        if(!error){
				        	return false
				        }else{
				        	return true;
				        }
				    });
		    }else{
		    	console.log(error);
		    	return true
		    }
		});	
	},

	requestFile : function(url,parent,fn){
		try{
			var request = http.get(url);
		}catch(err){
			var request = https.get(url)
		}
		request.on('error', function(e) {
			fn(true,e)
		});

		request.on('response', function (response) {
			var k = fs.createWriteStream(parent.filePath);
			response.on('data', function (chunk) {
				k.write(chunk);
			});
			response.on('end', function(){
				k.end()
			});
			k.on("close", function(){
				fn(null, parent.filePath)
			})			
		});			
	},

	saveItemDisplayPicture:  function(form, cb){
		if(this.connect(this.displaypicContainer)){
			cb(true, "Connection Problems.")
			true;
		}
		var selfParent = this;
		var data = {
			containerName : this.displaypicContainer,
			blobName : form.displayPicFile,
			filePath : "temp/"+form.displayPicFile,
			blobData : function(fn){
				var self = this;
				var request = selfParent.requestFile(form.displayPic,self,fn)
			},
		}
		blob.uploadFile(data,function(err,data){
			cb(err,data);
		});

	},

	deleteItemDisplayPicture : function(blobname){
		if(this.connect(this.displaypicContainer)){
			console.error(true, "Connection Problems.")
		}
		data = {
			containerName: this.displaypicContainer,
			blobName : blobname
		}

		blob.removeFile(data);
	},

	saveGalleryPics : function(form, cb){
		if(this.connect(this.galleryContainer)){
			cb(true, "Connection Problems.")
		}
		var selfParent = this;
		var xy = 0;
		for(x in form){
			nameCheck = "galleryPic_"+xy;
			if(x == nameCheck){
				var data = {
					containerName : this.galleryContainer,
					blobName : form[nameCheck+"File"],
					filePath : "temp/gallery/"+form[nameCheck+"File"],
					blobData : function(fn){
						var self = this;
						var request = selfParent.requestFile(form[nameCheck],self,fn)},
				}
				xy = xy+1;
				blob.uploadFile(data,function(err,data){
					cb(err,data);
				});
			}
		}

	}
}
var blob = {
	uploadFile : function(data,cb){
		data.blobData(function(err, filePath){
			if(err){
				cb(true, "Failed external connection");
				return
			}

			blobService.createBlockBlobFromFile(data.containerName, data.blobName, filePath, function(error){
			    if(!error){
			        cb(null,null)
			    }else{
			    	cb(true, error)
			    }
			});
		});
	},
	removeFile : function(data,cb){
		blobService.deleteBlob(containerName
		    , data.blobName
		    , function(error){
		        if(!error){
		            cb(null,null)
		        }else{
		        	cb(true,error)
		        }
		    });		
	}
}
