pageSettings = {
    itemOverlay : true,
}
var navbarView = Backbone.View.extend({
    el : ".navbarview",
    events : {
        "click #moreMenu" : "moreMenu",
        'click .drawer-btn' : "drawerClose",
    },
    initialize : function(){

    },
    moreMenu : function () {
        var display = $("#menu-drawer").css('display');
        if(display == "block"){
            this.drawer.hide();
        }else{
            this.drawer.show()
        }
    },

    drawerClose : function(){
    },

    drawer : {
        el : "#menu-drawer",
        btnRow : "#btnRow",
        toggleIcon : {
            show : "<i class='icon-double-angle-down dToggle'></i>",
            hide : "<i class='icon-double-angle-up dToggle'></i>",
            el : "#moreMenu",
        },
        hide : function(){
            search.searchDrawer.hideSearchResult();
            search.searchDrawer.clearSearchResult();
            this.toggle(this.toggleIcon.show,'hide')

        },
        show : function(){
            search.searchDrawer.hideSearchResult();
            search.searchDrawer.clearSearchResult();
            this.toggle(this.toggleIcon.hide,'show');
        },
        toggle : function(iconToggle, status){
            if(status == "show"){
                $("body").addClass("bodyDrawerShow")
                $(this.toggleIcon.el).addClass("nav-btnHover");
                $(this.el).slideDown(100);
                $(this.toggleIcon.el).find("i").remove();
                $(this.toggleIcon.el).append(iconToggle);
                $(trns.current).addClass('opacityClass')
            }else{
                $("body").removeClass("bodyDrawerShow")
                $(this.toggleIcon.el).removeClass("nav-btnHover");
                $(this.el).slideUp(100);
                $(this.toggleIcon.el).find("i").remove();
                $(this.toggleIcon.el).append(iconToggle);
                $(trns.current).removeClass('opacityClass')
            }
        },
        hideBtn :function() {
            $(this.btnRow).hide();
        },
        showBtn: function(){
            $(this.btnRow).show();
        },
        toggleBtn : function(){
            if($(this.btnRow).css("display") == "none"){
                this.showBtn();
            }else{
                this.hideBtn();
            }
        },


    }

});

var navbarV = new navbarView();

var searchCollection = Backbone.Collection.extend({
    initialize : function(){
    },

});
var searchCol = new searchCollection();


var searchItems = Backbone.Model.extend({
    urlRoot : "//",
    schema: {
        title:  { html: "<input type='text' name='title' id='frontpageSearch' placeholder='Search....' class='dToggle span12 '>", type: "text", required:"true", maxChar : 100},
    },
    initialize : function(){
        var self = this;
        form = new BackboneInput({
            appendTo : "#searchWrapper",
            model : this,
            formClass :"form span12",
            schema : this.schema,
            buttonClass: "btn hide",
            buttonText  : "",
            msgHide: true, 
            save : false,
            callback : function () {
            },
            onClick : function(e){

            }, 
            onFocus : function(e){
                if(!$(e.currentTarget).val().length >0){
                    self.searchDrawer.clearSearchResult();
                }else{
                    self.searchDrawer.clearSearchResult();
                }              
            },
            onKeypress : function(e){
                if ( e.keyCode == 13 ){
                     e.preventDefault();
                }
                var val = $(e.currentTarget).val();
                if(val.length >0){
                    self.searchDrawer.showSearchResult();
                    self.searchDrawer.setSearchTitle("Searching...");
                    self.searchDrawer.getResult(0,4,val);
                }else{
                    self.searchDrawer.clearSearchTitle();
                    self.searchDrawer.clearSearchResult();
                }
            },
        });
    },
    searchDrawer :{
        searchResultRow : "#searchResultRow",

        getResult : function(skip,limit,val){
            var self = this;
            var url =  "../../search/"+val+"/"+skip+"/"+limit;
            ajax.get({url :  url , data : ""}, function(data){
                search.searchDrawer.clearSearchTitle();
                if(data.length>0){                        
                    for( x in data){
                        if(searchCol.where({_id : data[x]._id}).length == 0){
                            searchCol.add(new searchModel(data[x]));
                        }else{
                            search.searchDrawer.showSearchResultById(data[x]._id);
                        }
                    }
                   self.moreDetailRow(val);
                }
            });
        },

        moreDetailRow : function(val){
            var url = "../../viewsearch/"+val+"/"+0+"/"+10;
            $("#moreDetailRow").remove();
            $("#searchResultSpan").append(ich.moreDetailRow({url : url}));
        },
        clearSearchResult : function(){
            $("#frontpageSearch").val("");
            $("#searchResultSpan").find(".resultItemRow").hide();
            $("#moreDetailRow").remove();
            $("#searchTitle").hide();
        },
        hideSearchResult :function() {
            $(this.searchResultRow).hide();
            navbarV.drawer.showBtn()
        },
        showSearchResult: function(){
            $(this.searchResultRow).show();
            navbarV.drawer.hideBtn()
        },
        showSearchResultById : function(_id){
            $("#searchResultSpan").find("#postRowSearch_"+_id).show();
        },
        toggleSearch : function(){
            if($(this.searchResultRow).css("display") == "none"){
                this.showSearchResult();
            }else{
                this.hideSearchResult();
            }
        },
        clearSearchTitle  : function(){
            $("#searchTitle").empty().hide();
        },
        setSearchTitle  : function(txt){
            $("#searchTitle").empty().append(txt).show();
        }        
    }
});

var search = new searchItems();


var searchModel = Backbone.Model.extend({
    initialize : function(){
        new searchView({
            model : this.attributes
        })
    },
});


var searchView = Backbone.View.extend({
    tagName : 'div',

    events : {
        'mouseover ' : "mouseoverPostwrapper",
        'mouseleave ' : 'mouseleavePostwrapper'
    },
    initialize : function(){
        var self = this;
        this.render();
    },

    render : function(){
        var self = this;
        $("#postLoading").hide();
        var postTemplate = ich.searchResults(this.model);
        $("#searchResultSpan").append(postTemplate);
        this.$el = $('#postRowSearch_'+this.model._id);
        $($(this.$el).find('img')[0]).load(function(){
            var h =self.$el.find('img').height();
            var w =self.$el.find('img').width();
            $(self.$el.find('.overlayHolder-search')[0]).width(w)
            $(self.$el.find('.overlayHolder-search')[0]).height(h);  
            $(self.$el.find('#searchResultTitleSpan')[0]).width(w)
            $(self.$el.find('#searchResultTitleSpan')[0]).height(h);              
        });
    },

    mouseoverPostwrapper : function(e){
        $(e.currentTarget).find('.overlayHolder-search').hide();
    },

    mouseleavePostwrapper : function(e){
        $(e.currentTarget).find('.overlayHolder-search').fadeIn(200);
    }
});

drawer = {
    fullyResetAndClose : function(){
        search.searchDrawer.clearSearchResult();
        search.searchDrawer.hideSearchResult();
    },

};
$("body").not("#frontpageSearch, #moreMenu").click(function(e){
    if(!$(e.target).hasClass("dToggle")){
        drawer.fullyResetAndClose();    
    }
});

var navBarNotification = Backbone.View.extend({
    el : "#navNotifWrapper",
    elText : "#notifText",
    events : {
        "click #closeNotifBar" : "closeNotifBar"
    },

    initialize : function(){

    },

    closeNotifBar : function(){
        $(this.el).slideUp(200);
    },

    showNotifBar : function(){
        $(this.el).slideDown(200)
    },

    addNotification : function(txt){
        this.clearNotification();
        $(this.elText).append(txt)
    },
    clearNotification : function(){
        $(this.elText).empty();
    }
});

var navBarNotif = new navBarNotification();

