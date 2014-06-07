// JavaScript Document
// js/views/app-pages
// Script written by Robins Gupta.
var app = app || {};

app.Pages = app.Pages || {};

//Now putting all  TrendingTags collection list in a global namespace...
var TrendingTagsList = new app.Collections.trendingTagsList ;


//Creating a Model for storing Stories....
//Now creating a model for Story
//And creating its child dependencies and creating its URL and fetching it using LAZY LOADING..
app.Model.story  = Backbone.Model.extend({
	
	initialize:function(modelStory, navList, votesFlag, hashTagMain, postedHashTag){	
		//Storing Navigation Link Collection...
		this.navLink = new app.Collections.navLinkList(navList);
		this.navLink.parent = this;
		this.navLink.localStorage = new Backbone.LocalStorage("hashbang-"+ this.id() + "-navLink" );
		
		this.votesFlag = new app.Model.votesFlag(votesFlag);
		this.votesFlag.localStorage = new Backbone.LocalStorage("hashbang-"+ this.id() + "-votesFlag" );
		this.votesFlag.parent = this;
		
		this.hashTagMain = new app.Model.hashTagMain(hashTagMain);
		this.hashTagMain.localStorage = new Backbone.LocalStorage("hashbang-"+ this.id() + "-hashTagMain" );
		this.hashTagMain.parent = this;
		
		this.postedHashTag = new app.Collections.postedHashTagList(postedHashTag);
		this.postedHashTag.localStorage = new Backbone.LocalStorage("hashbang-"+ this.id() + "-postedHashTag" );
		this.postedHashTag.parent = this; 
	},
	
	defaults:{
		storyId:'',
		storyTitle:'',
		storyPosted:'',
		storyContent:''
	},
	
	id: function(){ return this.get('storyId')}

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
		
		//Varible needed for defigning tags...
		var tag='';
		var startTagInProgress = false;
		var closeTagInProgress = false;
		var tagCounter = 0;
		
		//First append the empty container element to ParentContainer...
		$( ParentContainerObj ).append( emptyContainerElementObj );
		//Now checking if it stills causes overflow...
		if ( !this.OverflowY(ParentContainerObj) )
		{
			for( var i=0; i<textLength  ; i++)
			{	
			
				if( textString[i] === '<' && !startTagInProgress && !closeTagInProgress )
				{
					if( textString[i+1] === '/')
					{
						closeTagInProgress = true;	
					}
					else
					{
						startTagInProgress = true;
					}
					//start collecting that tag ..
					tag = '<';
					
					//Increment the tag counter..
					tagCounter = 1;
				}
				
				if(startTagInProgress || closeTagInProgress )
				{
					//Collect that tag...
					tag = tag + textString[i];
					
					//Ignore the tag if counter crosses 7
					if(tagCounter > 8)
					{
						startTagInProgress = false;
						closeTagInProgress = false;
						tag = '';
						tagCounter=0;
					}
					
					//Increment the tag counter..
					tagCounter = tagCounter + 1;
				}
				
				if ( textString[i] === '>' && (startTagInProgress || closeTagInProgress ) )
				{
					tag = tag + '>';
					//Stop the action of both tags..
					startTagInProgress = false;
					closeTagInProgress = false;
					tagCounter=0;
					
				}
				
				
				
				
				
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
		

