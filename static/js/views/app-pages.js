// JavaScript Document
// js/views/app-pages
// Script written by Robins Gupta.
var app = app || {};

app.Pages = app.Pages || {};

//Now putting all  TrendingTags collection list in a global namespace...
var TrendingTagsList = new app.Collections.trendingTagsList ;

//Creating object for navLinkList Collections...
var NavLinkList = new app.Collections.navLinkList;

//Creating an instance for postedHashTagList Collections..
var PostedHashTagList = new app.Collections.postedHashTagList;

//Creating a Model for storing Stories....
//Now creating a model for Story
//And creating its child dependencies and creating its URL and fetching it using LAZY LOADING..
app.Model.story  = Backbone.Model.extend({
	
	initialize:function(){	
		//Storing Navigation Link Collection...
		this.navLink = NavLinkList;
		this.navLink.parent = this;
		this.navLink.localStorage = new Backbone.LocalStorage("hashbang-"+ this.get('storyId') + "-navLink" );
		
		this.votesFlag = new app.Model.votesFlag();
		this.votesFlag.localStorage = Backbone.LocalStorage("hashbang-"+ this.get('storyId') + "-votesFlag" );
		this.votesFlag.parent = this;
		
		this.hashTagMain = new app.Model.hashTagMain();
		this.votesFlag.localStorage = Backbone.LocalStorage("hashbang-"+ this.get('storyId') + "-hashTagMain" );
		this.hashTagMain.parent = this;
		
		this.postedHashTag = PostedHashTagList;
		this.postedHashTag.localStorage = Backbone.LocalStorage("hashbang-"+ this.get('storyId') + "-postedHashTag" );
		this.postedHashTag.parent = this; 
	},
	
	defaults:{
		storyId:'',
		storyTitle:'',
		storyPosted:'',
		storyContent:''
	}

});

//Now Creating a collection for stories...
//Collections for story list..
app.Collections.storyList = Backbone.Collection.extend({
	
	//Declaring list structure model...
	model: app.Model.story,
	
	//save all story list in one local namespace..
	localStorage: new Backbone.LocalStorage("hashbang-storyList")
});


//Putting all stories in a global namespace...
var Stories = new app.Collections.storyList ;





//Creating pages.....

//creating a object for Pages class
app.Pages = {
	
	//Now calculating if the element has overflow vertical  content returns boolean....
	OverflowY: function(parentObj){
		
		if(parentObj.offsetHeight < parent.scrollHeight){
			//Return true if overflow occurs
			return true;
		}
		else{
			return false;
		}
		
	},
	
	//Now calculating if the element has horizental overflow content returns boolean....
	OverflowX: function(parentObj){
		
		if(parentObj.offsetWidth < parent.scrollWidth){
			return true;
		}
		else{
			return false;
		}
	},
	
	//Now calculating the vertical overflow elements returns array and remove overflow elements if set true..
	calculateYOverflow : function(elementObj, removeOverflowElement){	
		removeOverflowElement = removeOverflowElement || false;
		var invisibleItems = new Array();
		for(var i=0; i<elementObj.childElementCount; i++ ){
			if( elementObj.children[i].offsetTop + elementObj.children[i].offsetHeight > elementObj.offsetTop + elementObj.offsetHeight )	{
				invisibleItems.push( elementObj.children[i] );
				//Remove overflow element if overflow element is set true..
				if ( removeOverflowElement ){
					$(elementObj).remove(elementObj.children[i]);
				}
			}
		}
		//Now return the array..
		return (invisibleItems);
	},
	
	//Now calculating the horizental overflow elements returns array and remove overflow elements if set true..
	calculateXOverflow : function(elementObj, removeOverflowElement){
		removeOverflowElement = removeOverflowElement || false;
		var invisibleItems = new Array();
		for(var i=0; i<elementObj.childElementCount; i++ ){
			if( elementObj.children[i].offsetLeft + elementObj.children[i].offsetWidth > elementObj.offsetLeft + elementObj.offsetWidth )	{
				invisibleItems.push( elementObj.children[i] );
				//Remove overflow element if overflow element is set true..
				if ( removeOverflowElement ){
					$(elementObj).remove(elementObj.children[i]);
				}
			}
		}
		//Now return the array..
		return (invisibleItems);
	},
	
	//Now writing code for splitting a text...
	//First remove that child obj(element) from parent container which you want to break...
	splitText: function(textString, emptyContainerElementObj, ParentContainerObj){
		var textLength = textString.length;
		//Clearing the emptyContainerElementObj 
		$(emptyContainerElementObj).html('');
		
		//First append the empty container element to ParentContainer...
		$( ParentContainerObj ).append( emptyContainerElementObj );
		//Now checking if it stills causes overflow...
		if ( !this.OverflowY(ParentContainerObj) )
		{
			for( var i=0; i<textLength  ; i++)
			{	
				if( !this.OverflowY(ParentContainerObj) )
				{
					$(emptyContainerElementObj).html(textString.slice(0,i));
				}
				else
				{
					$(emptyContainerElementObj).html('');
					ParentContainerObj.remove( emptyContainerElementObj );
					return [ textString.slice(0, i-1), textString.slice(i-1, textLength) ];
				}
			}
		}
		else
		{
			ParentContainerObj.remove( emptyContainerElementObj );
			return false;
		}
		
	}
}
		

