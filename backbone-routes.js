var navigate = Backbone.Router.extend({
  routes: {
  	//User Routes
  	""			:"home",
  	"home"		: "home",
    "submit"	:   "submit",
    "i/:itemId" : "itemPage" 
  },	
  initialize : function(){

  },

  itemPage : function(itemCid){
    if(typeof itemCol == "undefined"){
      route.navigate("#",{trigger : true});
    }else{
      var itemModel = itemCol.get(itemCid);
      new itemDetailPage({
        model : itemModel,
        el : "#itemPageWrapper"
      });
    }
  },
  home : function(){
  	trns.in("#homeWrapper");
  },
  submit : function () {
  	trns.in("#postWrapper")
  }
});

var route = new navigate();
Backbone.history.start();