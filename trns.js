
/*
	Transitions between div
*/
var trns = {
	speedIn : 500,
	speedOut : 400,
	allEl : ".fnd",
	in : function(slct){
		var self = this;
		this.hideAll(function(){
			self.current = slct;
			$(slct).fadeIn(this.speedIn);
		});
	},
	out : function(slct){
		$(slct).fadeOut(this.speedOut);
	},
	toggle : function(slct){
		if($(slct).css('display') == "block"){
			this.out(slct);
		}else{
			this.in(slct);
		}
	},
	hideAll : function(cb){
		$(".pg").hide();
		cb(true);
	},
	oIn : function(){

		$(this.allEl).fadeOut(1000);

	},
	oOut : function(){
		$(this.allEl).show();
	}
}


/*
	Show and hide pages
*/
var display = {

	show : function(slct,effect, cb){
		slct = $(slct);
		if(effect == "slide"){
			slct.slideDown(function(){
				display.callback(cb);
			});
		}else if(effect == "fade"){
			slct.fadeIn(function(){
				display.callback(cb);
			});
		}else{
			if(typeof effect == "function"){
				cb = effect;
			}			
			$(slct).show();
			this.callback(cb);
		}
	},

	hide : function(slct,effect, cb){
		slct = $(slct);

		if(effect == "slide"){
			slct.slideUp(function(){
				display.callback(cb);
			});
		}else if(effect == "fade"){
			slct.fadeIn(function(){
				display.callback(cb);
			});
		}else{
			if(typeof effect == "function"){
				cb = effect;
			}
			$(slct).hide();
			this.callback(cb);
		}
	},
	toggle : function(slct,effect, cb){
		slct = $(slct);
		if(effect == "slide"){
			slct.slideToggle(function(){
				display.callback(cb);
			});
		}else if(effect == "fade"){
			slct.fadeToggle(function(){
				display.callback(cb);
			});
		}else{
			if(typeof effect == "function"){
				cb = effect;
			}			
			$(slct).toggle();
			this.callback(cb)
		}
	},

	callback : function(cb){
		if(typeof cb != 'undefined'){
			cb();
		}
	}
}


$(".toggleBtn").click(function(){
	var show = $(this).attr("show");
	var hide = $(this).attr("hide");
	
	var toggleShow = function(){
		if( $(show).css("display") == "none" ){
			display.show(show,'slide');
		}else{
			display.hide(show, 'slide');
		}		
	}

	if( $(hide).css("display") != "none" ){
		display.hide(hide, "slide",function(){
			toggleShow()
		});
	}else{
		toggleShow()
	}

});