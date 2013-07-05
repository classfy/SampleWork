
$.fn.serializeObject = function() {var o = {}; var a = this.serializeArray(); $.each(a, function() {if (o[this.name] !== undefined) {if (!o[this.name].push) {o[this.name] = [o[this.name]]; } o[this.name].push(this.value || ''); } else {o[this.name] = this.value || ''; } }); return o; };

var BackboneInput = Backbone.View.extend({
  events : {
    'click .formBtn' : "submit",
    'click .btn' : "submit",
    "keyup input" : "inputKeypress",
    'click input' : 'inputClick',
    'focus input' : 'inputFocus',
    'blur input'  : 'inputBlur'
  },

  tagName : "div",

  initialize : function() {
    var Tbi = this;
    createEl(this);
    createForm(this, function(){
      createElements(Tbi);
    });
  },

  keypress : function(e){
    if(e.keyCode == 13){
      this.submit();
    }
  },

  inputKeypress : function(e){
    if(typeof this.options.onKeypress != "undefined"){
      this.options.onKeypress(e)
    }
  },
  inputBlur : function(e){
    if(typeof this.options.onBlur != "undefined"){
      this.options.onBlur(e)
    }
  },

  inputFocus : function(e){
    
    if(typeof this.options.onFocus != "undefined"){
      this.options.onFocus(e)
    }
  },
  inputClick : function(e){

    
    if(typeof this.options.onClick != "undefined"){
      this.options.onClick(e)
    }
  },


  disableBtn : function(){
    $(".btn, .formBtn").addClass("disabledBtn");
  },

  enableBtn : function(){
    $(".btn, .formBtn").removeClass("disabledBtn");
  },

  btnStatus : function(){
    if($(".btn, .formBtn").hasClass("disabledBtn")){
      return true
    }else{
      return false
    }
  },

  vl_Username : function(d,cb){
    var vl = new Validator();
    if(typeof vl.check(d).len(1, 100).isAlphanumeric().getErrors() != "undefined"){
      cb(true, "Invalid Username")
    }else{
      cb(false, null)
    }
  },

  vl_Email : function(d,cb){
    var vl = new Validator();
    if(typeof vl.check(d).len(3, 64).isEmail().getErrors() != "undefined"){
      cb(true, "Invalid Email")
    }else{
      cb(false, null)
    }
  },

  vl_Password:function(d,cb){
    var vl = new Validator();
    if(typeof vl.check(d).len(6,500).getErrors() != "undefined"){
      cb(true, "Password must be 6 char or more")
    }else{
      cb(false, null)
    }
  },

  vl_schemaValidate : function (schema,data,cb) {
    for(x in schema){
      switch(x){
        case "maxChar":
          schemaValidator.char_.maxV(schema,data, function(err,msg){
            if(err){
              cb(err,msg);
            }
          });
          break
        case "required":
          schemaValidator.required(schema,data, function(err,msg){
            if(err){
              cb(err,msg);
            }
          });
          break;
        case "maxInt":
          schemaValidator.int_.maxV(schema,data,function(err,msg){
            if(err){
              cb(err,msg);
            }
          });
          break
        default : 
          cb(false,null)
      }
    }
  },

  submit : function(){
    if(this.btnStatus()){
      return;
    }

    var Tbi = this;
    new_form = $("#"+this.options.formId).serializeObject();
    new_form._csrf = $("#csrf").text();
    validateInput(new_form, this, function(err){
      if(!err){
        Tbi.show_success("Loading...");
        Tbi.model.set(new_form);
        if(Tbi.options.save){
          Tbi.saveModel(new_form)
        }else{
          if(typeof Tbi.options.callback != "undefined"){
            Tbi.options.callback(new_form,Tbi)
          }else{}        
        }
      }
    });
  },

  saveModel : function(form){
    Tbi.model.set(form);
    var k = Tbi.model.save(form, {
      error: function(modeL, response, options){
        errResponse(response,options)
      },
      success : function(modeL, response, options){
        succResponse(response,options)
      }
    });

    if(typeof Tbi.options.callback != "undefined"){
      Tbi.options.callback(form, Tbi)
    }else{}

    function errResponse(response, options){
      if(response.status == 200){
        Tbi.show_error(response.responseText)
      }else if(response.status == 201){
        Tbi.show_success("Success!");
        Tbi.clearForm()
        if(Tbi.options.msgHide){
          setTimeout('Tbi.hide_Msgs()',5000);
        }
      }
   
    }

    function succResponse(response,options){
      if(response.err == true){
        Tbi.show_error(response.msg)
      }else{
        Tbi.clearForm()
        if(Tbi.options.msgHide){
          setTimeout('Tbi.hide_Msgs()',5000);
        }
      }
    }
  },

  clearForm : function(){
    $(this.el).find("input, textarea").val("");
    $(this.el.preview).attr("src","").hide();
    $(this.el.galleryWrapper).hide();
    $(this.el.gallery).empty();
  },

  show_error : function(msg, time){
    this.hide_Msgs();
    $("#"+this.options.formMsgId).addClass("label-important").append("<i class=' icon-exclamation-sign'></i><br>").append(msg);
    if(typeof time == "number"){
      this.hide_Msgs_Timer(time)
    }
  },
  show_success : function(msg, time,b){
    this.hide_Msgs();
    $("#"+this.options.formMsgId).addClass("label-success").append("<i class=' icon-ok-sign'></i><br>").append(msg).show();
    if(typeof time == 'number'){
      this.hide_Msgs_Timer(time)
    }    
  },
  hide_Msgs : function(){
    $("#"+this.options.formMsgId).empty().removeClass("label-success label-important");  
  },
  hide_Msgs_Timer : function(t){
    window.setTimeout("Tbi.hide_Msgs()",t)
  }
});




function createEl(b){
  $(b.el).attr("id","formWrapper_"+b.cid)
  $(b.el).addClass("formWrapper")
}

function createForm (b,cb) {

  b.options.formId = "form_"+$("form").length;
  formMsgBox = generateformMsgBox(b);

  $(b.el).append("<form id='"+b.options.formId+"' class='"+b.options.formClass+"'>"+formMsgBox+"</form>");
  $(b.options.appendTo).append(b.el)
  cb()
}

function createElements(b){
  schema = b.options.schema;
  for(x in schema){
      genElements(x, schema[x],b)
  }
  appendButton(b);
}

function genElements(title, schema,b){
    $("#"+b.options.formId).append("<div class='row-fluid'>"+schema.html+"</div>")
}

function appendButton(b){
  $("#"+b.options.formId).append("<a class='"+b.options.buttonClass+"'>"+b.options.buttonText+"</a>")
}

function generateformMsgBox(b){
  b.options.formMsgId = b.options.formId+"_MsgBox"
  formMsgBox = "<div id='"+b.options.formMsgId+"' class='label  label-important formErr'></div>"
  return formMsgBox;
}

function validateInput(form,b,cb){
  var formErr = false;
  function username(b){
    b.vl_Username(new_form.email, function(err,msg){
          if(err){
            b.show_error(msg);
            formErr = true;
          }else{
            
          }
    }); 
  }

  function email(b){
    b.vl_Email(new_form.email, function(err,msg){
      if(err){
        b.show_error(msg,b);
        formErr = true;
      }else{
        
      }
    }); 
  }

  function password(b){
    b.vl_Password(new_form.password, function(err,msg){
      if(err){
        b.show_error(msg);
        formErr = true;
      }else{
      }
    }); 
  }

  function schemaValidate (b,name) {
    b.vl_schemaValidate(b.options.schema[name], new_form[name], function (err,msg) {
      if(err){
        b.show_error(msg);
        formErr = true;
      }
    });
  }

  for(x in form){
    schemaValidate(b,x);
    switch(x){
      case "email":
        email(b);
        break;
      case "username":
        username(b);
        break;     
      case "password":
        password(b);
        break;
    }    
  }

  cb(formErr)
}

schemaValidator = {
  char_ : {
    minV : function (schema, data,cb) {
      var vl = new Validator();
      if(typeof vl.check(data).len(0,schema.minChar).getErrors() != "undefined"){
        cb(true,"Too many chars.")
      }else{
        cb(false,null)
      }
    },
    maxV : function(schema, data,cb){
      var vl = new Validator();      
      if(typeof vl.check(data).len(0,schema.maxChar).getErrors() != "undefined"){
        cb(true,"Too many chars.")
      }else{
        cb(false,null)
      }
    },
  },
  int_ : {
    minV : function(schema, data,cb){
      var vl = new Validator();      
      if(typeof vl.check(data).isInt().min(schema.minInt).getErrors() != "undefined"){
        cb(true,"Number too low.")
      }else{
        cb(false,null)
      }
    },
    maxV : function(schema, data,cb){
      var vl = new Validator();      
      if(typeof vl.check(data).isInt().max(schema.maxInt).getErrors() != "undefined"){
        cb(true,"Number too high.")
      }else{
        cb(false,null)
      }
    },

  },
  required : function(schema,data,cb){
      var vl = new Validator();      
      if(schema.required){
        if(typeof vl.check(data).len(1,10000).getErrors() != "undefined"){
          cb(true,"Try again.")
        }else{
          cb(false,null)
        }        
      }
  }
}