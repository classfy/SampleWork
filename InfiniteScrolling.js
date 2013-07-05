
var iScroll = function(wrapperDiv){

  this.wrapperDiv = wrapperDiv; 

  var self =this;

  var status = {
    ajaxLoaded : true,
    currentPage : 1,
    endData : false
  }

  var scrollEvent = function(e){

    var statusCheck = function(){
      if(!status.endData && status.ajaxLoaded){
        return true;
      }else{
        return false;
      }
    }

    var scrollCheck = function(){
      if ($(window).scrollTop() >= ($(document).height() - $(window).height() - 400)) {    
        return true;  
      }else{
        return false;
      }
    }
    if(statusCheck() && scrollCheck()){
      loadContent();
    }else{
      spinner.hide();
      endData.show();
    }
  }


  var loadContent = function(){
    status.ajaxLoaded = false;
    var nextPage = status.currentPage + 1;
    spinner.show();
    var url = window.location.origin+"/p/"+$("#username").text()+"/dash/ajax/allForPurchase/"+nextPage+"/";
    ajax.post({
      url:url,
    }, function(data){
      if(typeof data.items != "undefined"){
        status.currentPage = nextPage;
        appendContent(data.items)
      }else if( typeof data.endData != "undefined" ){
        status.endData = true;
      }
    })
  }

  var appendContent = function(items){

    var showDiv = function(el){
        $(el).fadeIn(1,function(){
          status.ajaxLoaded = true;
          spinner.hide();
       });
    }

    var template = "";
    spinner.hide();
    for(var x = 0; x<items.length; x++){
      template = ich.itemList(items[x]);
      $(self.wrapperDiv).append(template);
      var el = "#itemWrapper_"+items[x]["_id"];
      showDiv(el);
    }

  }

  var spinner = {
    el : "#itemLoadingWrapper",
    show : function(){
      $(this.el).fadeIn(1);
    },
    hide : function(){
      $(this.el).hide();
    },
  }

  var endData = {
    el : "#endDataWrapper",
    show : function(){
      $(this.el).show();
    },
  }

  $(window).scroll(function(e){
    scrollEvent(e);
  });
}

var sc = new iScroll("#itemListSpan");    