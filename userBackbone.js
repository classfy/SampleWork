
var userModel = Backbone.Model.extend({
    initialize : function(){
        this.url = "../../user/getProfile";
        this.firstTime = true;
        this.fetch()
    },


});

var usr = new userModel();

usr.on("change", function(data){
    if(data.firstTime == true){
        checkMissing(data, ['paypal', 'username', 'location'], function(rt){
            var str = "Please add "
            for(var x = 0; x<rt.length; x++){
                if(x==rt.length-1){
                    str = str +  " and " + rt[x];
                }else if (x == rt.length -2){
                    str = str + rt[x];
                }else{
                    str = str + rt[x]+", ";
                }
            }
            var str = str + " to your profile."
            data.missing = rt;
            
            if(typeof data.displaypic == "undefined"){
                data.set({displaypic : "http://mediaclassfy.blob.core.windows.net/mediaclassfy-displaypic/dp.jpg"});
            }
           // navBarNotif.addNotification(str);
           // navBarNotif.showNotifBar();
        });        
    }

    function checkMissing(data,missing,cb){
        var rt = missing;
        var da = data.attributes;
        for( x in da){
            var datax = da[x];
            for(var y =0; y<missing[missing.count]; y++){
                if(x == missing[y]){
                    if(datax.length ==0){
                        rt.splice(arr.indexOf(x), 1);
                    }
                }
            }
        }
        cb(rt)
    }
});