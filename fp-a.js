/*
  Implementation of Filepicker.io + Aviary
  
*/

filepicker.setKey('');

function fpa(options){

  this.settings = options.settings;
  this.el = options.el;
  this.callback = options.callback;

  this.imageElement = function(count,src){
    if(count == 0){
      active = "active";
    }
    else{
      active = "";
    }
    var img = "<img src="+src+">";
    var wrapper = "<div target='_blank' class='item center"+active+" '>"+img+"</div>";
    return wrapper; 
  };

  this.start = function(){
    var afpthis = this;
    $(this.el.btn).click(function(){
      if(afpthis.settings.filepickerPick == "multiple"){
          afpthis.filepickerMulti(afpthis);
      }else{
          afpthis.filepickerSingle(afpthis);
      }
    });
    if(afpthis.settings.aviary == true){
      afpthis.aviary(afpthis);
    }    
  };

  this.imageEl = function(value, name){
    str = "<input type='hidden' name='"+name+"' class='galleryHiddenInput' value='"+value+"'>";
    return str;
  };

  this.filepickerMulti = function(afpthis){
    filepicker.pickMultiple({mimetype: 'image/*'},function(fpfile){
      
      var appendTo = afpthis.el.gallery
      for(y=0; y<fpfile.length; y++){
          for(x in fpfile[y]){
              if(x == "url"){                      
                  $(appendTo).append(afpthis.imageElement(y,fpfile[y]['url']));
                  var div = afpthis.imageEl(fpfile[y]['url'], 'galleryPic_'+y);
                  $(afpthis.el.linkHolder).append(  div );
              }
          }
      }
      if($(afpthis.el.galleryWrapper).css('display') == "none"){
        $(afpthis.el.galleryWrapper).show(); 
      }
      $('.carousel').carousel('cycle');
      afpthis.finished(afpthis);
    });    
  };

  this.filepickerSingle = function(afpthis){

    filepicker.pick({mimetype: 'image/*'}, function(fpfile) {
        
        $(afpthis.el.preview).attr("src", fpfile.url);
        if($(afpthis.el.preview).css('display') == "none"){
          $(afpthis.el.preview).show(); 
        }
        $(afpthis.el.preview+"-input").val(fpfile.url);
        if(afpthis.settings.aviary == true){
          afpthis.launchAviary(fpfile,afpthis);
        }else{
          afpthis.finished(afpthis);
        }
    });    
  };

  this.aviary = function(afpthis){ 
   this.featherEditor = new Aviary.Feather({
       apiKey: '8e0291306',
       apiVersion: 2,
       tools: 'effects,enhance,orientation,warmth,resize,crop',
       maxSize : "300",
       appendTo: '',
       onClose : function(isDirty){
       },
       onSave: function(imageID, newURL) {
          $(afpthis.el.preview).attr('src',newURL);
          $(afpthis.el.preview+"-input").val(newURL);
          afpthis.finished(afpthis);
       },
       onError: function(errorObj) {
           alert(errorObj.message);
       }
   });
  };

  this.launchAviary = function(fpfile,afpthis){
    var aviaryImageId =  $(afpthis.el.preview).attr("id")
    this.featherEditor.launch({
      image: aviaryImageId,
      url: fpfile.url
    }); 
  };

  this.finished = function(afpthis){
    if(typeof afpthis.callback !="undefined"){
      afpthis.callback();
    } 
  };
  this.start();

}
