// JavaScript Document
// js/views/hashbang-view
// Script written by Robins Gupta.

//Residing everything under a global namespace "app"
var app = app || {};

app.Settings = app.Settings || {};

//Now app.Main will serve as top level piece of UI
app.Main = app.Main || {};

//Now creating a views structure for Trending tags list.. 
app.Main.TrendingList = Backbone.View.extend({
	
	
	
	/*
		At initialization binding event to TrendingTagsList collection to render
		and fetching list from local Storage at initiation..
	*/
	initialize: function(){
		
		
		this.listenTo(TrendingTagsList,'add',this.addOne);
		this.listenTo(TrendingTagsList, 'reset', this.resetTag);
		this.listenTo(TrendingTagsList, 'remove', this.resetTag);
		this.listenTo(TrendingTagsList, 'sort', this.render);
		TrendingTagsList.fetch();
	},
	
	el: $("#hashTrendingTagBox"),
	
	addOne: function(tagModel){
		var TrendingTagView = new app.Views.trendingTags({model: tagModel});
		this.$el.append(TrendingTagView.render().el);
	},
	
	resetTag: function(){
		//Attaching all trending tags to main view..
		//Resetting the html field...
		this.$el.html('');
		TrendingTagsList.each(this.addOne,this);

	},
	
	render:function(){
		this.resetTag();
		return this;
	}
	
});


//Now Initializing the Views...
var MainTrendingView = new app.Main.TrendingList;

//Initializing collection...
var TrendingTagCollection = [
			
			{tagId:'12', hashTagName:'#TheGirlWhoDumpedMe', totalPromotions:53},
			{tagId:'23', hashTagName:'#CollegeFrustation', totalPromotions:542},
			{tagId:'521', hashTagName:'#BeautyWithNoBrains', totalPromotions:3427},
			{tagId:'23', hashTagName:'#FailedColleges', totalPromotions:532},
			{tagId:'521', hashTagName:'#CrazyLove', totalPromotions:527},
			{tagId:'12', hashTagName:'#NoSleep', totalPromotions:5342},
			{tagId:'23', hashTagName:'#Bringitback', totalPromotions:52},
			{tagId:'521', hashTagName:'#LoveMyPhone', totalPromotions:3427},
			{tagId:'23', hashTagName:'#FailedColleges', totalPromotions:52342}
		]

TrendingTagsList.add(TrendingTagCollection);




