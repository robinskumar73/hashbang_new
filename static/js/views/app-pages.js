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
		
		if(parentObj.offsetHeight < parentObj.scrollHeight){
			//Return true if overflow occurs
			return true;
		}
		else{
			return false;
		}
		
	},
	
	//Now calculating if the element has horizental overflow content returns boolean....
	OverflowX: function(parentObj){
		
		if(parentObj.offsetWidth < parentObj.scrollWidth){
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
	splitText: function(textString, overflowElementObj, ParentContainerObj){
		var textLength = textString.length;
		var tag = '', escapeWord = '' ;
		var htmlEscapeProcessing = false, startTagFlag = false ,stopTagFlag = false, wordProcessing = false;
		var tagCounter = 0, escCounter = 0, wordCounter = 0;
		var stackArray = new Array();
		$(overflowElementObj).empty();
		$(ParentContainerObj).append(overflowElementObj);
		if(this.OverflowY(ParentContainerObj) === false)
		{
			for( var i=0; i<textLength; i++ )
			{
				if(textString[i] === '<' && (startTagFlag === false && stopTagFlag === false ))
				{
					if(textString[i+1] === '/')
					{
						stopTagFlag = true;
					}
					else
					{
						startTagFlag = true;
					}
					tag = '<';
					tagCounter++;
				}
				else if( startTagFlag  ||  stopTagFlag )
				{
					if(textString[i] === '>')
					{
						tag = tag + '>';
						tagCounter++;
						

						
						if(tag === '<br>' || tag === '</br>')
						{
							//Ignore dont push..
						}
						else if( startTagFlag )
						{
							stackArray.push(tag);
						}
						else if( stopTagFlag )
						{
							while(stackArray.length > 0)
							{
								//Popping out elements from an  Array..
								var tagValue = stackArray.pop();
								if ( tagValue === tag )
								{
									break;	
								}
								
							}//End of while loop..
							
							
							 	
						}
						
						else{ /*Do nothing*/ }
						
						//Resetting all flags..
						tagCounter = 0;
						stopTagFlag = false;
						startTagFlag = false;
						tag = '';	
					}//End of if statement..
					else 
					{
						if(tagCounter>8)
						{
							tagCounter = 0;
							stopTagFlag = false;
							startTagFlag = false;
							tag = '';	
						}
						else
						{
							tag = tag + textString[i];
						}
						
					}
					
				} //else if of (startTagFlag  ||  stopTagFlag) ends..
				else if( textString[i] === '&' && htmlEscapeProcessing === false && !textString[i] === ' ' )
				{
					htmlEscapeProcessing = true;
					escapeWord = '&';
					escCounter++;
					
				}
				else if ( htmlEscapeProcessing )
				{
					escapeWord = escapeWord + textString[i] ;
					escCounter++;
					if( escCounter > 8 || textString[i] === ';' )
					{
						htmlEscapeProcessing = false;
						escCounter = 0;
						escapeWord = '';
					}
					
				
				}
				//Now checking for word processing..
				else 
				{
					
					if(wordProcessing === false)
					{
						
						if ( !(textString[i] === ' ') )
						{
							
							wordProcessing = true;
							wordCounter = 1;
						}
					}
					else if( wordProcessing )
					{
						
						if ( textString[i] === ' ' )
						{
							wordProcessing = false;
							wordCounter = 0;
						}
						else
						{
							wordCounter++;
						}
					}
					else { /*Do nothing */ }
				}
				//Now append the text..
				if( !htmlEscapeProcessing && !wordProcessing && !startTagFlag && !startTagFlag )
				{
					//Now appending text to parent container...
					$(overflowElementObj).html( textString.slice(0,i) );
				}
				//Now checking for overflow....
				if( this.OverflowY(ParentContainerObj))
				{
					
					//console.log("I am here inside last checking for overflow..");
					//Now check if any checking for tags or htmlescape is still in progress...
					if( stopTagFlag || startTagFlag )
					{
						
						//Decreasing its value..
						i = i - tag.length;
						
					}
					else if( htmlEscapeProcessing  )
					{
						
						i = i - escapeWord.length;
					}
					else
					{
						
						if( wordProcessing )
						{
							
							i =  i - wordCounter;
							
						}
					}
					
					//console.log("I am in splitText");
					//Forming the split Text  
					var newText = textString.slice(0,i);
					
					//Now creating the nonOverlapping form of text...
					var newPosition = newText.search(/(\s)\S*$/);
					if( newPosition != -1)
					{
						i = newPosition;
						//Now getting exact NonOverlapped value..
						newText = textString.slice(0,i);
						//console.log("i position "+i);
					}
					var remText = textString.slice(i);
					//console.log(stackArray.length);
					
					//Now checking the stack array value..
					if( stackArray.length )
					{
						//console.log("Inside stack array length");
						while(stackArray.length)
						{
							 //console.log("Inside stack array length loop");
							 var tagElement = stackArray.pop();
							 //console.log("popped tag value "+tagElement);
							 var closeTagElement = 	this.convertCloseTag( tagElement );
							 newText = newText + closeTagElement ;
							 remText = tagElement + remText;
						}
					}
					
					
					
					//Finally putting value..
					//Now appending text to parent container...
					$(overflowElementObj).html( newText );
					
					//Clearing the containers element..
					//$(ParentContainerObj).remove( $( $(ParentContainerObj).children() ).last() );
					//$( overflowElementObj ).empty();
					
					
					return ([newText, remText]);
				}
				
				
			} //For loop ends..
			//if it reaches outside for loop means...no text overflow is found.....
			$(overflowElementObj).html( textString );
			return ([]);
		}
		
	//SplitText function ends..	
	},
	
	convertCloseTag: function(tag){
		return '</' + tag.slice(1);
	}
}
		

