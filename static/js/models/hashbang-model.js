// JavaScript Document
// js/models/hashbang-model

//Residing everything under a global namespace "app"

//NOTE:: BOOKMARK MODEL HAS NOT BEEN CREATED...
var app = app || {};

//Creating a container for storing Models....
app.Model = app.Model || {};


//Creating Model for TrendingTags
app.Model.trendingTags = Backbone.Model.extend({
	defaults:{
		tagId:'',
		hashTagName:'',
		totalPromotions:0
	}
});


//Creating a Model for NavLink
app.Model.navLink = Backbone.Model.extend({
	defaults:{
		navId:'',
		navTitle:'',
		active:false
	}
});

//Creating a model for votesFlag
app.Model.votesFlag = Backbone.Model.extend({
	defaults:{
		totalVotes:'0'
	}
});

//Creating a model for HashTagMain that describes a story...
app.Model.hashTagMain = Backbone.Model.extend({
	defaults:{
		tagId:'',
		tagName:'',
		currentPromotions:''
	},
	
});

//Now creating a model for PostedHashTag
app.Model.postedHashTag = Backbone.Model.extend({
	defaults:{
		tagId:'',
		currentPromotions:'',
		tagName:''
	}
});

