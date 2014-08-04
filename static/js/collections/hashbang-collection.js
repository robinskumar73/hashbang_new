// JavaScript Document
// js/collections/hashbang-collections
// Script written by Robins Gupta.

//Residing everything under a global namespace "app"
var app = app || {};

//Creating a container for storing Collections....
app.Collections = app.Collections || {};

//Collections for trending tags list..
app.Collections.trendingTagsList = Backbone.Collection.extend({
	//Declaring the list structure model...
	model: app.Model.trendingTags,
	
	//Save all trending tags list in one namespace..
	localStorage: new Backbone.LocalStorage("hashbang-trendingTagsList"),
	
	//Sorting the collection in decreasing order of promotions..
	comparator: function(trendingModel) {
		return -trendingModel.get("totalPromotions");
	}
	
});

//Collection for navLinkList..
app.Collections.navLinkList = Backbone.Collection.extend({
	
	model: app.Model.navLink,
	
});

//Collection for posted hash tag...
app.Collections.postedHashTagList = Backbone.Collection.extend({
	

	
	model: app.Model.postedHashTag,
	
	
});


