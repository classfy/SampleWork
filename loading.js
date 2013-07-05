var loadingView = Backbone.View.extend({
	el :'#loadingModal',
	initialize : function () {
		thisloading = this;
		$(this.el).modal({
					backdrop : false,
					keyboad : true,
					show : false,
					animate: true,
		});		
	},
	settings : {
		id : "#loadingModal",
		speedIn : 500,
		speedOut: 300,
	},
	show : function (slct,cb) {
		if(typeof slct == "string"){
			this.elx.start(slct);
			if(typeof cb =="function"){
				cb()
			}			
			return;
		}else{
			this.modalShow();
		}
	},
	modalShow : function(){
		$(this.el).slideDown(this.speedIn);
		$(this.el).show();
	},
	modalHide : function(){
		$(this.el).slideUp(this.speedOut,function(){
			
		}).modal('hide');
	},
	hide : function(msg, cb){
		if(typeof msg=="string"){
			//show msg and hide
		}
		if(typeof this.elx.active !="undefined"){
			this.elx.end();
			slct = undefined;
		}
		this.modalHide();
	},
	modal : {
		hide : function(){
			m=$('.modal');
			for(x=0;x<m.length;x++){
				if($(m[x]).css('display') == "block"){
					this.el = m[x];
					break;
				}
			}
			$(this.el).not(thisloading.el).fadeOut(thisloading.speedOut)
			thisloading.modalShow();
		},
		show : function(){
			$(this.el).fadeIn(thisloading.speedIn);
		}
	},
	elx : {
		start : function(slct){
			if(slct == "modal"){
				thisloading.modal.hide();
				this.active = "modal";
			}			
			this.active = slct;
			this.deactive = this.oldSlct+"Loading"
			$(this.active).attr("id",this.deactive);
		},
		end : function () {
			if(this.active =="modal"){
				thisloading.modal.show();
				this.kill();
			}
			$(this.deactive).attr('id',this.active);
			this.kill();
		},
		kill : function(){
			this.active = undefined;
			this.deactive = undefined;
		}
	}
});
	var loading = new loadingView();
