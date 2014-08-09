// JavaScript Document
// js/views/app-pages
// Script written by Robins Gupta.
//Designed
var app = app || {};

app.Pages = app.Pages || {};



//Now putting all  TrendingTags collection list in a global namespace...
var TrendingTagsList = new app.Collections.trendingTagsList() ;


//Creating a Model for storing Stories....
//Now creating a model for Story
//And creating its child dependencies and creating its URL and fetching it using LAZY LOADING..
app.Model.story  = Backbone.Model.extend({
	
	initialize:function(modelStory, navList, votesFlag, hashTagMain, postedHashTag){	
		//Storing Navigation Link Collection...
		this.navLink = new app.Collections.navLinkList(navList);
		this.navLink.parent = this;
		this.navLink.localStorage = new Backbone.LocalStorage("hashbang-"+ this.id_() + "-navLink" );
		
		this.votesFlag = new app.Model.votesFlag(votesFlag);
		this.votesFlag.localStorage = new Backbone.LocalStorage("hashbang-"+ this.id_() + "-votesFlag" );
		this.votesFlag.parent = this;
		
		this.hashTagMain = new app.Model.hashTagMain(hashTagMain);
		this.hashTagMain.localStorage = new Backbone.LocalStorage("hashbang-"+ this.id_() + "-hashTagMain" );
		this.hashTagMain.parent = this;
		
		this.postedHashTag = new app.Collections.postedHashTagList(postedHashTag);
		this.postedHashTag.localStorage = new Backbone.LocalStorage("hashbang-"+ this.id_() + "-postedHashTag" );
		this.postedHashTag.parent = this; 
	},
	
	defaults:{
		storyId:'',
		storyTitle:'',
		storyPosted:'',
		storyContent:''
	},
	
	id_: function(){ return this.get('storyId');}

});

//Now Creating a collection for stories...
//Collections for story list..
app.Collections.storyList = Backbone.Collection.extend({
	
	//initializing the story list collection..
	initialize: function(){
		this.listenTo(this,'add', this.addOne);
		
	},
	
	addOne: function(){
		console.log("Adding a collection");
	},	
	
	//Declaring list structure model...
	model: app.Model.story,
	
	//save all story list in one local namespace..
	localStorage: new Backbone.LocalStorage("hashbang-storyList")
	
});


//Putting all stories in a global namespace...
var Stories = new app.Collections.storyList();





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
	//Note: Dont use removeOverflowElmenet it does not work if all elementObj are causing overflow and its value is true
	calculateYOverflow : function(elementObj, removeOverflowElement){	
		removeOverflowElement = removeOverflowElement || false;
		
		var invisibleItems = [];
		var visibleItems = [];
		var childLength = elementObj.childElementCount;
		for(var i=0 ; i < childLength ; i++ ){

			if( elementObj.children[i].offsetTop + elementObj.children[i].offsetHeight > elementObj.offsetTop + elementObj.offsetHeight )	{
					invisibleItems.push( elementObj.children[i] );
					//Remove overflow element if overflow element is set true..
					if ( removeOverflowElement ){
						//Don't remove otherwise all the events will be also removed...
						$( elementObj.children[i] ).detach( );
					}
				}
				
				else{
					visibleItems.push( elementObj.children[i] );
				}
			}
			
			//Now return the array..
			return ({ visibleItems: visibleItems , invisibleItems: invisibleItems });
	},
	
	//Now calculating the horizental overflow elements returns array and remove overflow elements if set true..
	calculateXOverflow : function(elementObj, removeOverflowElement){
		removeOverflowElement = removeOverflowElement || false;
		var invisibleItems = [];
		var visibleItems = [];
		for(var i=0; i<elementObj.childElementCount; i++ ){
			if( elementObj.children[i].offsetLeft + elementObj.children[i].offsetWidth > elementObj.offsetLeft + elementObj.offsetWidth )	{
				invisibleItems.push( elementObj.children[i] );
				//Remove overflow element if overflow element is set true..
				if ( removeOverflowElement ){
					//Don't remove otherwise all the events will be also removed...
					$( elementObj.children[i]  ).detach( );
				}
			}
			else{
					visibleItems.push( elementObj.children[i] );
				}
		}
		//Now return the array....
		return ({ visibleItems: visibleItems , invisibleItems: invisibleItems });
	},
	
	//Now writing code for splitting a text...
	//First remove that child obj(element) from parent container which you want to break...
	splitText: function(textString, overflowElementObj, overflowElementContainerObj, ParentContainerObj){
		var textLength = textString.length;
		var tag = '', escapeWord = '' ;
		var htmlEscapeProcessing = false, startTagFlag = false ,stopTagFlag = false, wordProcessing = false;
		var tagCounter = 0, escCounter = 0, wordCounter = 0;
		var stackArray = [];
		$(overflowElementObj).empty();
		$(overflowElementContainerObj).append(overflowElementObj);
		
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
						if(tagCounter>200)
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
				else if( textString[i] === '&' && htmlEscapeProcessing === false && textString[i] !== ' ' )
				{
					htmlEscapeProcessing = true;
					escapeWord = '&';
					escCounter++;
					
				}
				else if ( htmlEscapeProcessing )
				{
					escapeWord = escapeWord + textString[i] ;
					escCounter++;
					if( escCounter > 50 || textString[i] === ';' )
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
						
						if ( textString[i] !== ' '  )
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
					
					
					console.log("I am here inside last checking for overflow..");
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
							 //Removing the class and other attributes..
							 var clearAttr = /^<\s*[a-zA-z0-9]/;
							 var tag_ =  clearAttr.exec(tagElement);
							 var closeTagElement;
							 if(tag_ !==  null){
								 tag_ = tag_[0] + ">";
							  	 closeTagElement = this.convertCloseTag( tag_ );
							 }
							 else{
							 	closeTagElement = this.convertCloseTag( tagElement );
							 }
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
					
				
					
					//Returning an object
					return {visibleText :  newText , remText : remText};
				}
				
				//else return zero value...
				
			} //For loop ends..
			
		}//If condition for checking main Y overflow ends here...
		//if it reaches outside for loop means...no text overflow is found.....
		$(overflowElementObj).html( textString );
		//Returning an object
		return {visibleText :  [] , remText : textString
		
		};
		
	//SplitText function ends..	
	},
	
	convertCloseTag: function(tag){
		return '</' + tag.slice(1);
	}
};
		




//------------------------------------------- CODE FOR GENERATING PAGES ---------------------------------------------
//Defigning the constructor function for class Generate Pages...
app.GeneratePages = function( stories_list_element  ){

	//Define Private Global variables here....	
	var NEXT = Array();
	var PREV = Array();
	var PAGE = 0;
	var OFFSET = -1;
	var pageOp = app.Pages;
	var NextWasEmpty = true;
	
	
	//Now return the object..
	return {
		//Set up the counter...
		analyseElementInProgress: false,
			
		//Getting the column object...
		//returns the column element object..
		getColumn: function(){
			
			if( this.getPage() === 1 )
				//returns the id name of the Column..
				return document.getElementById("hashColumn1View");
			else if( this.getPage() === 2 )
				return document.getElementById("hashColumn2View");
			else if ( this.getPage() === 3 )
				//return document.getElementById("hashHalfColumnView");
				return document.getElementById("hashMainHalfStoryID");
			else { /*Do nothing just return */ return null; }
			
		},
		
		getTempColumn: function(){
			return document.getElementById('hashCheckColumn');
			
		},
			
		//Definging the methode for pop  NEXT
		popNext: function(){
			return NEXT.pop();
		},
		
		//Definging the push method for NEXT...
		pushNEXT: function(value){
			return NEXT.push(value);
		},
		
		shiftNEXT: function( ){
			return NEXT.shift();	
		},
		
		unshiftNEXT: function( value ){
			return NEXT.unshift( value );	
		},
		
		lengthNEXT: function(){
			return NEXT.length;	
		},
		
		lengthPREV: function(){
			return PREV.length;	
		},
		
		clearNEXT: function(){
			NEXT = [];
		},
		
		clearPREV: function(){
			PREV = [];
		},
		
		popPREV: function(){
			return PREV.pop();	
		},
		
		pushPREV: function( value ){
			return PREV.push(value);
		},
		
		shiftPREV: function( ){
			return PREV.shift();	
		},
		
		unshiftPREV: function( value ){
			return PREV.unshift( value );	
		},
		
		//Get current page number..
		getPage: function(){
			return PAGE;
		},
		
		incrementPage: function(){
			PAGE = PAGE + 1;
		},
		
		resetPage: function(){
			PAGE = 0;	
		},
		
		getOffset: function(){
			return OFFSET;	
		},
		
		incrementOffset: function(){
			OFFSET = OFFSET + 1;	
		},
	


		//Recursive function for creating PAGE with pixel more than 720px..
		//Now defining some methods....for  creating page...
		createPage: function( changePage   ){
			//Definging the default value of changePage..
			if( arguments.length == 1 ){
				changePage = arguments[1];	
			}
			else{
				changePage = true;	
			}
			//Logging 
			if(changePage){
				console.log("I am inside createPage  and I am changing the page..");
			}
			else{
				console.log("I am inside createPage and I am not changing the page.. ");
			}
			
			if (changePage){
				this.flushNext( true );
			}
			else{
				this.flushNext( false );	
			}

			

			//Variable for storing the story content...
			var story;
			//Increment OFFSET for STORIES LIST....
			if(this.getOffset() === -1){
				if(stories_list_element.length){
					this.incrementOffset();
					story = stories_list_element[ this.getOffset() ];
				}
			}
			else{
				if( this.getOffset() <  stories_list_element.length && this.getPage() !==0 && this.getPage()<4 )
				{
					this.incrementOffset();
					story = stories_list_element[ this.getOffset() ];
					console.log("story elememnt"+ $(story).children().length);
				}
				else{
					console.log("Stories Element List limit reached...exiting.. ");
					return;
				}
			}
			
			console.log("Current Page no. " + this.getPage());
			console.log("Stories list element length " + stories_list_element.length);	
			console.log(" Stories list current offset point " + this.getOffset());
			console.log(" Column name:  " + $(this.getColumn()).attr("class") );
			//Removing the <div> content from the elements..
			story = $(story).children() ;
			//console.log( $(story) );
			//Now Insert this story to new column..
			this.Insert( this.getColumn(), story );
			
		}, //End of createPage method..
		
		
		
		
		//Function for flushing the next page or changing the page is true..
		flushNext: function( changePage  )
		{
			
			console.log("I am inside flush Next");
			
			
			if (changePage){
				this.incrementPage();
			}
			console.log("Current Page no. " + this.getPage());
			
			
			if( this.getPage() >  3 ){
				//resetting page.. and then returning
				this.resetPage();
				console.log("All pages got processed ..NOW existing from flushNext");
				//All pages are filled in this case just return..
				return null;
			}
			
			if ( this.lengthNEXT() ){
				//insert NEXT elements first...
				while (this.lengthNEXT() ){

					console.log(" Now flushing the NEXT stack element data..." );
					if(this.getColumn() === null || this.getPage() === 0 || this.getPage() > 3)
					{
						console.log("Breaking loop...");
						//In this case all pages got processed ....just return...
						return null;
						
					}
					else
					{ 
						//Change NEXT value status...
						NextWasEmpty = false;
						
						//Insert this element first..
						this.Insert( this.getColumn(), this.shiftNEXT() );
					}
				}
				//Clearing the NEXT ARRAY...
				console.log("Next array got fully processed...now clearing the NEXT stack..");
				this.clearNEXT();
				//Clearing the PREV ARRAY...
				this.clearPREV();
			}
			else{
				//Just clear the PREV ARRAY...
				this.clearPREV();
			}
			
			//Change NEXT value status...
			NextWasEmpty = true;
			console.log("Returning from flush page..NEXT EMPTY Picking Up a NEW STORY..");
		},
		
		
	

		//Method for inserting Element to its respective column...
		//Here ColumnElement must be an object element derived from Document.getElementById or Something like that and not a $ obj
		//Element may be any Jquery element object...
		Insert: function(ColumnElement, Element){
			
			console.log("Inside Insert function..");
			if(this.getPage() === 3)
			{
				ColumnElement = document.getElementById("hashMainHalfStoryID");
			}
			//Picking the elements and appending it to Column...
			//First converting it to an Jquery object..
			Element = $(Element);
			//Now appending it to parent column..
			$(ColumnElement).append(Element);
			console.log($(ColumnElement).children() );
			//Logging
			console.log("Inside Insert function checking for OverflowY " +  pageOp.OverflowY( ColumnElement ) );
			
			//Testing
			//if(this.getPage() < 3){
			
			if( pageOp.OverflowY( ColumnElement ) ){
			 	//Logging 
				console.log("calculateYOverflow in Insert func ");
				//Now calculating the OverFlow occuring in the page and also detaching the content causing overflow..
				var items = pageOp.calculateYOverflow( ColumnElement );
				console.log(items);
				console.log("length of invisibleItems length " +  items.invisibleItems.length );
				console.log("After calculateYOverflow length of visibleItems  "+ items.visibleItems.length );
				var i;		
				if( items.visibleItems.length ){
					//Now pushing the visible items in PREV....
					for( i=0; i< items.visibleItems.length; i++  ){
						this.pushPREV( items.visibleItems[i]  );
					}

				}

			
				
				//Now analysing the invisible items...
				//Call analyse Elements..
				//Now detaching the invisible elements...
				//also push all invisible items to NEXT ARRAY...
				for(i = 0; i < items.invisibleItems.length; i++  ){
					
					console.log("detaching the invisibleItems and pushing to NEXT ARRAY..");
					if( NextWasEmpty){
						console.log("NEXT WAS EMPTY BEFORE");
						this.pushNEXT( $(items.invisibleItems[i]).detach() );
					}
					else{
						console.log("NEXT WAS NOT EMPTY BEFORE");
						this.unshiftNEXT( $(items.invisibleItems[i]).detach() );
					}
					console.log($(items.invisibleItems[i]));
					
					
				}
				
				
				//$("#hashColumn1View").append( items.invisibleItems  );
				console.log("at line 716");
				return this.analyseElements(  );
				
			}
			
			else{
				//More space is availaible ...
				//Add more elements to it without changing the page.....
				console.log("Adding more story to the same page..");
				return this.createPage( false );
				
			}
			
			//}//End of testing
			
			
		}, //End of INSERT...
		
		
		
	


		//analyse the type of element and perform operation according to it...
		//Recursive function..
		analyseElements: function(  ){
			console.log("Inside analyseElements...");
			
			//set up a counter..
			//this.analyseElementInProgress = true;
			
			//Defiging patterns for regular expressions...
			var hashMainStory = /hashMainStory/;
			//Regex tester for HashMainStoryMetadata
			var hashMainStoryMetadata =  /hashMainStoryMetadata/;
			var element;	
			if( this.lengthNEXT() ){
				console.log("shifting the items  from NEXT STACK.. length NEXT = " + this.lengthNEXT()  );
				element = this.shiftNEXT();
			}
			else{
				console.log("Items finished ... now returning from analyseElements");
				
				//Set up the counter...
				//this.analyseElementInProgress = false;			
				return null;	
			}
			//Now getting its attribute...
			var class_ = $( element ).attr("class");
			//Now testing for class..
			if ( hashMainStoryMetadata.test( class_ ) ){
				//Call method for doing operations related to hashMainStoryMetadata to this element	
				console.log("Processing for hashMainStoryMetadata... ");
				this.DoHashMainStoryMetadata( element );
			}
			else if( hashMainStory.test(class_) ){
				//Call method for doing operations related to hashMainStory to this element..
				console.log("Processing for hashMainStory..... ");
				this.DoHashMainStory( element );
			}
			else{
				//Do nothing here...
			}
			
			if(this.getPage() < 3 && this.getPage() !== 0){
				//return with recursive call to itself....
				console.log("HEY");
				return this.analyseElements(  ) ; 
			}
			else{
				console.log("Finishing...");	
				return null;
			}
		}, // End of analyseElements method..
		
		
		
		//Performs operations related to HashMainStory class ....
		DoHashMainStory: function( element ){
			console.log("Inside DoHashMainStory function...");	
			//clone this element and empty it content...	
			var parent = $(element).clone(true);
			//Empty the parent element ...
			parent.empty();
			
			//Now appending the Story Element to Column...
			$(this.getColumn()).append(element);
			//Now finding the class ".hashMainStoryParagraph"
			var para = $(element).find( ".hashMainStoryParagraph" );
			
			if( para.length )
			{
				//Now detaching the paragraph from element and catching the respective element.....
				para = $(para).detach();
				//Now check if overflow still occurs...
				//Logging
				console.log("Inside do hashMainStory.. paragraph detached ..Now checking for OverflowY ");
				if( pageOp.OverflowY(this.getColumn()) ){
					//Now reattach and return...
					console.log("Overflow still occurs ...existing to changePage");
					$(element).append(para);
					//Now detaching the element from column ...
					return this.changePage( element );	
				}
				
				//Now  split the paragraph...
				//Getting the paragraph text..
				var paraText = $(para).html();
				

				var textObj = pageOp.splitText(paraText, para, element, this.getColumn() );				
				console.log("splitting the paragraph. Verified upto this code... \n" );
				
				
				if(textObj.visibleText.length){
					//Push the visible elements to PREV stack...
					this.pushPREV( element );
				}
				else{	
					console.log("returning to change page as all text of para causing overflow.: Verified upto this code..");
					//Now reattach paragraph element and return...
					$(element).append(para);
					return this.changePage( element );	
				}
				
				//Getting the remaining text...
				var remText = textObj.remText ;
				//cloning the paragraph element...
				var clonedPara = $(para).clone(true);
				$(clonedPara).empty();
				//Appending the remaining text value to the value...
				$(clonedPara).append(remText);
				//Appending it to parent..
				$(parent).append(clonedPara);
				
				console.log("Unshifting the elements..");
				console.log(textObj.remText);
				//Put/unshift parent in NEXT Array...
				this.unshiftNEXT(parent);
				console.log("returning to next page...after splitting paragraph text normally. : REM TEXT: ");
				//Now return and  turn to next page..
				return this.flushNext( true );
				
			}//End of if checking para -> "length>0"
			else
			{
				
				//Change page and detach element
				return this.changePage( element );	
			}

			
		}, //End of DoHashMainStory method.....
		
		//Method for changing page and detaching elements from parent element obj its..
		//Also pushes invisible element to NEXT stack
		changePage: function( detachElementObj ){
			//Now detaching the element from column ...
			detachElementObj = $(detachElementObj).detach();
			//Pushing/Unshifting  the element to NEXT stack array at position top of the stack...
			this.unshiftNEXT(detachElementObj);
			//Indirect Recursive Call to  flush NEXT...
			return this.flushNext( true );
		},
	


		DoHashMainStoryMetadata: function( element ){	
		
		
			console.log("Inside DoHashMainStoryMetadata.. element: " + element);
			//clone this element and empty it content...	
			var parent = $(element).clone(true);
			//Empty the parent element ...
			$(parent).empty();	
			//Now detaching the elements...
			var child  = $(element).children();
			child = $(child).detach();
			//var child = $(child).children();
				
			console.log(this.getColumn());
			//Now appending the story to HashMainStoryMetdata....
			$( this.getColumn() ).append( element );
			
			//Check if overflow still occurs...
			//Logging
			console.log("Inside DoHashMainStoryMetadata...checking for OverflowY ");
			
			if( pageOp.OverflowY(this.getColumn()) )
			{
				console.log( "returning from hashMainStoryMetadata as no space is avail" );	
				//return to next page..
				return this.changePageMetdata( element, child );
			
			}
			
			//Identifier for checking data-type
			//Defiging patterns for regular expressions...
			var tagData  = /tag-data/ ;
			//Regex tester for element of class nav-data
			var navData =  /nav-data/;

			
			
			if( child.length )
			{
				console.log("child length = "+ child.length);
				var Len = child.length;
				
			   for( var i = 0; i<Len; i++)
			   {
				//Pop a child..
				var temp = child[i];
			        
				//Now checking for child...
				//Now getting its attribute...
				var class_ = $( temp ).attr("class");
				if( navData.test( class_  )  )
				{
							
					//Now append the first children 
					$( element ).append( temp );
				
					//again check for overflow...
					//Logging
					console.log("Inside DoHashMainStoryMetadata checking for child.length ...checking for OverflowY ");
					if( pageOp.OverflowY(this.getColumn()) )
					{		
						//return to next page..
						return this.changePageMetdata( element, child );
					}
				
				}
				
				//Working with tag data element..
				if( tagData.test( class_ )  )
				{
					console.log("Inside TAGDATA TEST METADATA..");
					console.log("length of NEXT = "+ this.lengthNEXT());
					
					//Now append the second child element...
					$( element ).append( temp );
					
					//if overflow occurs...
					//Logging
					console.log("Inside DoHashMainStoryMetadata appending the second child...checking for OverflowY ");
					
					if( pageOp.OverflowY( this.getColumn() ) )
					{
						
						//Now detaching the hashtag element...
						var hashtag = $(temp).children()[1];			
						//Split the childrens of temp element so that overflow doesnot appears...	
						//Detach its child from parent element...
						//Check for overflow...		
						hashtag = $(hashtag).detach();
						console.log(hashtag);
						//Now detaching the postbox...
						var postBox = $(temp).find('div.row');
						//Now detaching postbox if present...
						if(postBox)
						{
							//Detach the postbox element...
							postBox = $(postBox).detach();	
							
						}
						
						//Now check for overflow ...if it still occurs then change the page...
						if( pageOp.OverflowY( this.getColumn() ) )
						{
							console.log("changing page...");
							//re-attach the child to hashtag element....
							$(temp).append(hashtag);
							
							if(postBox){
								//append the postbox..
								$(temp).append(postBox);
							}
							//detaching the temp element..
							temp = $(temp).detach();
							//appending to parent...
							$(parent).append(temp);
							console.log("After CHANGING PAGE..");
							
							//---CHANGED TO UNSHIFT --Push to NEXT
							this.pushNEXT(parent);
							//Now change the page...
							//change page  by calling it recusive....
							console.log("Now flushing NEXT by changing the page and returning from hashStoryMetadata");
							return this.flushNext( true );
						}
						console.log("I am splitting the text...");
						//Now split it..
						var textValue  = pageOp.splitText( $(hashtag).html(), hashtag, element, this.getColumn() );
						
						
						console.log(textValue);
						
						//check if overflow still occurs...
						if( pageOp.OverflowY(this.getColumn()) )
						{
							console.log("Still overflow is occuring after splitting hashtags ... returning..");
							//detach the temp element...
							temp = $(temp).detach();
							
							//appending hashtag 				
							$(temp).append(hashtag);
							
							if(postBox){
								//append the postbox..
								$(temp).append(postBox);
							}
							
							//---CHANGED TO UNSHIFT --Push to NEXT
							this.pushNEXT(temp);
							
							
							//change page  by calling it recusive....
							return this.flushNext(true);
						}
					
					
						//visibleText :  newText , remText : remText
						if( textValue.visibleText.length )
						{
							console.log("pushing the visible elements to PUSH stack");
							//Now push the visible info along with element to PREV element..
							this.pushPREV( element );
						}
					
						//Now appending the rem items to its child...
						var tmp = $(temp).clone(true);
						//Empty the tmp containers...
						$(tmp).empty();
						$(parent).append( tmp );
						//Now adding the hashtag class div..
						var tmp1 =  $(hashtag).clone(true);
						$(tmp1).empty();
						//append to temp.....
						$(tmp).append(tmp1);
						$(tmp1).append( textValue.remText );
						//Pushing the remaining text to NEXT stack...
						//Now appending postbox to parent..
						if(postBox){
							//append the postbox..
							$(tmp).append(postBox);
						}
						
						//---CHANGED TO UNSHIFT --Push to NEXT
						this.pushNEXT(parent);
						
						
						console.log(" Returning from hashMainStoryMetadata");
						
						//change page  by calling it recusive....
						return this.flushNext( true );
					
					}//checking overflow...
					else
					{
						//Clears the PREV stack...
						this.clearPREV();
						//Now call create page without changing the page...
						return this.createPage(false);
					
					}
			
				}//End of if condition for checking of tagData

				
			    }//End of for loop...
				
			}
			
			
		},//End of DoHashMainStoryMetadata method....
		
		
		changePageMetdata: function( detachElement, childElements ){
			
			//detach the element from metadata
			//Reattach all childrens and push to next array 
			var element = $(detachElement).detach();
			$(element).append(childElements);
			//Now push to NEXT array...
			this.unshiftNEXT(element);	
			//change page  by calling it recusive....
			return this.flushNext( true );
		},
		
		
	}; //End of return object
	
	
}; // End of app.GeneratePages
