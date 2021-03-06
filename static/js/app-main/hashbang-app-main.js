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











//-----------------------------------------------------TESTING AREA-------------------------------------------------------------



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

													
													
Modelstory = {
	storyId:'1',
	storyTitle: 'Lorem ipsum dolor sit amet, consectetur',
	storyPosted: 'june-6th-2014',
	storyContent: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis Lorem ipsum dolor sit amet, consectetur<br><br>Lorem ipsum dolor sit amet, mpor incididunt ut labore et dolore magna aliqua. quis Lorem ipsum dolor sit amet, consectetu<br><br>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut eni<br>' 
}


Modelstory1 = {
	storyId:'1',
	storyTitle: 'Lorem ipsum dolor sit amet, consectetur',
	storyPosted: 'june-6th-2014',
	storyContent: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis Lorem ipsum dolor sit amet, consectetur<br><br>Lorem ipsum dolor sit amet, mpor incididunt ut labore et dolore magna aliqua.<br><br> quis Lorem ipsum dolor sit amet, consectetu<br><br>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis Lorem ipsum dolor sit amet, consectetur<br><br>Lorem ipsum dolor sit amet, mpor incididunt ut labore et dolore magna aliqua. quis Lorem ipsum dolor sit amet, consectetu<br><br>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod' 
}


navLink = [ { navId:'1',navTitle:'Jecrc' },{ navId:'2',navTitle:'C.S.' },{ navId:'3',navTitle:'B-1 Batch',active:true } ]
navLink1 = [ { navId:'1',navTitle:'Story2' },{ navId:'2',navTitle:'C.S.' },{ navId:'3',navTitle:'B-1 Batch',active:true } ]

votesFlag = {totalVotes:'5500'}


hashTagMain = { tagId:'124', tagName:'#iLoveCricket', currentPromotions:'234520' }


postedHashTag = [{ tagId:'212', currentPromotions:'34351', tagName:'#TheGirlWhoDumpedMe'},{ tagId:'212', currentPromotions:'34351', tagName:'#LoveMyPhone'},{ tagId:'21242', currentPromotions:'351', tagName:'#Bitches'},{ tagId:'212', currentPromotions:'34351', tagName:'#NoSleep'},{ tagId:'212', currentPromotions:'34351', tagName:'#NoSleep'}, { tagId:'212', currentPromotions:'34351', tagName:'#TheGirlWhoDumpedMe'},{ tagId:'212', currentPromotions:'34351', tagName:'#TheGirlWhoDumpedMe'},{ tagId:'212', currentPromotions:'34351', tagName:'#LoveMyPhone'},{ tagId:'21242', currentPromotions:'351', tagName:'#Bitches'},{ tagId:'212', currentPromotions:'34351', tagName:'#NoSleep'},{ tagId:'212', currentPromotions:'34351', tagName:'#NoSleep'}, { tagId:'212', currentPromotions:'34351', tagName:'#TheGirlWhoDumpedMe'}]


postedHashTag1 = [{ tagId:'212', currentPromotions:'34351', tagName:'#TheGirlWhoDumpedMe'},{ tagId:'212', currentPromotions:'34351', tagName:'#LoveMyPhone'},{ tagId:'21242', currentPromotions:'351', tagName:'#Bitches'},{ tagId:'212', currentPromotions:'34351', tagName:'#NoSleep'},{ tagId:'212', currentPromotions:'34351', tagName:'#NoSleep'}, { tagId:'212', currentPromotions:'34351', tagName:'#TheGirlWhoDumpedMe'}]


story = new app.Model.story(Modelstory, navLink, votesFlag, hashTagMain, postedHashTag );
v = new app.Views.story({model:story});
//el = $(v.render().el).children();
//$("#hashColumn1View").append( el );

Modelstory.storyId = '3';
story_2  = new app.Model.story(Modelstory1, navLink1, votesFlag, hashTagMain, postedHashTag1);
story_3  = new app.Model.story(Modelstory, navLink, votesFlag, hashTagMain, postedHashTag );
story_4  = new app.Model.story(Modelstory1, navLink1, votesFlag, hashTagMain, postedHashTag1);
story_5  = new app.Model.story(Modelstory, navLink, votesFlag, hashTagMain, postedHashTag );

Stories.add(story);
Stories.add(story_2);
Stories.add(story_3);
Stories.add(story_4);
Stories.add(story_5);


//Adding stories views...
view = new app.Views.storyList({collection: Stories});












