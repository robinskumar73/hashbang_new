// JavaScript Document
// js/views/hashbang-view
// Script written by Robins Gupta.

//Residing everything under a global namespace "app"
var app = app || {};

//Creating an object for Views....
app.Views = app.Views || {};

//Now creating a views structure for VOTES FLAG 
app.Views.votesFlag = Backbone.View.extend({
	
	VotesTemplate: _.template($("#hashbang-votesFlag").html()),
	
	
	events: {
	  //Event for thumb-up
      "click h4.glyphicon-thumbs-up.hashMainVotesThumb"   : "handleVoteUp",
      "click h4.glyphicon-thumbs-down.hashMainVotesThumb"  : "handleVoteDown"
    },
	
	//Now listen to change...
	initialize: function( ) {
	  this.listenTo(this.model, 'change', this.changeValue);
    },
	
	
	//Events code for votes UP
	handleVoteUp: function(){
		//Saving the new changed model....
		
		var UpVotes = parseInt(this.model.get('totalVotes'))+1;
		//Now converting it to integer..
		this.model.save({'totalVotes':UpVotes});
		
		
	},
	
	//handling events for downvote..
	handleVoteDown: function(){
		var DownVote = parseInt(this.model.get('totalVotes'))-1;
		//Now saving this new vote..
		this.model.save({'totalVotes':DownVote});
		
		
	},
	
	changeValue: function(){
		//Only updating the html content containing..votes value..
		$($(this.$el).children()[2]).html( this.model.get('totalVotes') );
		
	},
	
	render: function(){
		
		this.$el.html('');
		//Logging
		console.log("Rendering the vote template....");
		
		this.$el.append( this.VotesTemplate(this.model.toJSON()));
		return this;
	}
	
}); 


//Creating a view for trendingTags
app.Views.trendingTags = Backbone.View.extend({
	
	TrendingTemplate: _.template( $("#hashbang-trendingTag").html() ),
	
	render: function(){
		
		this.$el.append(this.TrendingTemplate(this.model.toJSON() ));
		return this;
	},
	
	events: {
	  //Event for tag click
      'click li.hashListItemTrending' :'handleTagClick',
    },
	
	handleTagClick : function(e){
		//Preventing default action....
		e.preventDefault();
		console.log("Trending tag has been clicked...Tag Name is " + this.model.get('hashTagName') );
	},
		
});

//Creating a view for NavLink..
app.Views.navLink = Backbone.View.extend({
	
	tagName:'li',
	
	navLinkTemplate: _.template( $("#hashbang-navLink").html() ),
	
	events: {
		//Event for thumb-up
      	"click ol.hashBreadcrumbLink li a" : "handleClick"
    },
	
	//Handle nav link click...
	handleClick: function(e){
		
		e.preventDefault();
		console.log("nav link " + this.model.get('navTitle') + " has been clicked");
	},
	
	render: function(){
		if(this.model.get('active'))
		{
			$(this.$el).addClass('active');
		}
		$(this.$el).append( this.navLinkTemplate( this.model.toJSON() ));	
		return this;
	}
	
});

// Now Creating a view for NavLinkList....
app.Views.navLinkList  = Backbone.View.extend ({
	
	
	tagName: 'div',
	className: 'col-md-10 hashBreadcrumbBox',
	
	initialize: function(){
			this.listenTo(this.collection,'add', this.addOne);
			this.listenTo(this.collection,'reset', this.resetLink);
			this.listenTo(this.collection,'remove', this.resetLink);
			
			this.orderedList = $("<ol class='col-md-12 breadcrumb hashBreadcrumbLink' />");
			this.$el.append(this.orderedList);
	},
	
	addOne: function( navLinkmodel ){
		var navLink = new  app.Views.navLink( { model: navLinkmodel } );
		this.orderedList.append(navLink.render().el );
	},
	
	//Adding all data once again and also during initialization...
	resetLink : function(){
		this.orderedList.html('');
		this.collection.each( this.addOne, this );
	},
	
	render: function(){
		this.resetLink();
		return this;
	}
	
	
});

//Creating a view for postedHashtag..
app.Views.postedHashTag = Backbone.View.extend({
	
	//Defining an arbitrary tag to support inline
	tagName:'span',
	
	postedHashTagTemplate: _.template( $("#hashbang-postedTag").html() ),
	
	events: {
		//Event for thumb-up
      	"click span.h5.hashMainStoryPostedHashTag" : "handleClick"
    },
	
	//Handling clicked event..
	handleClick: function(e){
			e.preventDefault();
			console.log("posted hashtag has been clicked.. tag name " + this.model.get('tagName') );
	},
	
	render: function(){
		this.$el.append(this.postedHashTagTemplate( this.model.toJSON() ));
		return this;
	}

});

//Creating a view for postedHashtagList..
app.Views.postedHashTagList = Backbone.View.extend({
	
	tagName: 'div',
	
	className: 'col-md-12 hashMainStoryMetadataHashtag',
	
	initialize: function( ){
		this.listenTo(this.collection,'add', this.addOne);
		this.listenTo(this.collection,'reset', this.resetLink);
		this.listenTo(this.collection,'remove', this.resetLink);
		
		
	},
	
	//Add one model...
	addOne: function( postedHashTagModel ){
		var hashTagView = new app.Views.postedHashTag( { model:postedHashTagModel } );
		this.$el.append(hashTagView.render().el);
	},
	
	//All all elements plus...add elements during initialization...
	resetLink: function(){
		//Clearing the el element object for initializing...
		this.$el.html('');
		this.collection.each( this.addOne, this );
	},
	
	render: function(){
		this.resetLink();
		return this;		
	}
		
});



//Creating a View for Main Story.....
app.Views.MainStory = Backbone.View.extend({
	
	tagName: 'div',
	
	className: 'col-md-12 hashMainStory',
	
	hashBookMarkBoxTemplate: _.template( $("#hashbang-hashBookMarkBox").html() ),
	
	hashMainStoryHashTagTemplate : _.template( $("#hashbang-hashMainStoryHashTag").html() ),
	
	initialize: function(){
		
		this.model.hashTagMain.fetch();
		//Creating heading tag for story..
		this.storyHeading = $("<h3 class='col-md-12  hashStoryMainHeading' />");
		//Creating story paragraph..
		this.storyContent = $("<p class='col-md-12 hashMainStoryParagraph' />");
		
	},
	
	
	events: {
		//Event for thumb-up
      	"click span.glyphicon.glyphicon-bookmark.shadow.h5.hashBookMarkBox" : "handleBookmarkClick",
		"click span.glyphicon.glyphicon-star.shadow.h5.hashBookMarkBox" : "handleFavourateButtonClick",
		"click span.glyphicon.glyphicon-fullscreen.shadow.h5.hashBookMarkBox" : "handleFullScreenClick"
    },
	
	handleBookmarkClick: function(e){
		console.log("Bookmark button has been clicked..");
	},
	
	handleFavourateButtonClick: function(e){
		console.log("Favourate button has been clicked..");	
	},
	
	handleFullScreenClick: function(e){
		console.log("handle full screen button click..")
	},
	
	render: function(){
		//First clearing out the el..
		this.$el.html('');
		//First appending the bookmarkbox to the template..
		this.$el.append( this.hashBookMarkBoxTemplate( ) );
		//Now adding main story hashTag..
		this.$el.append( this.hashMainStoryHashTagTemplate( this.model.hashTagMain.toJSON() ));
		//Now adding heading to the template..
		this.$el.append( this.storyHeading.html( this.model.get('storyTitle') ));
		//Now adding the story content paragraph..
		this.$el.append( this.storyContent.html( this.model.get('storyContent') ));
		return this;
	}
	
	
});

//Creating a view for story metadata..
app.Views.MainStoryMetadata = Backbone.View.extend({	

	hashMainStoryMetadataTemplate : _.template( $("#hashbang-hashMainStoryMetadata").html() ),

	//Defigning tag for metadata template..
	tagName: 'div',
	
	className: 'col-md-12 hashMainStoryMetadata',
	
	initialize: function(){
		//Creating object for views...
		this.votesFlagView = new app.Views.votesFlag({ model: this.model.votesFlag });
		//Initializing the collection view for navLinkList..
		this.navLinkView = new app.Views.navLinkList({ collection : this.model.navLink });
		//Initializing the collection view for postedHashTag..
		this.postedHashTagView = new app.Views.postedHashTagList( {collection: this.model.postedHashTag });
		this.containerDiv = $("<div/>");
		//Adding jquery object to template..
		this.metadataTemplate = $( this.hashMainStoryMetadataTemplate() );
		//Now appending this metadataTemplate to container Div
		this.containerDiv.append(this.metadataTemplate);
		
		//fetching all the metadata child element models and collections necessary for creating stories' metadata.....
		//this.model.navLink.fetch();
		//this.model.votesFlag.fetch();
		//this.model.postedHashTag.fetch();
	},
	
	render: function(){
		//First clearing the el
		this.$el.html('');
		//First appending the VotesFlag ..
		this.$el.append( this.votesFlagView.render().el );
		//Now appending the NavLink... just after the thumbs up html line..
		$(this.navLinkView.render().el).insertBefore( $($(this.$el).children()[0]).children()[1] );
		//Now inserting posteHashTagView...
		$(this.postedHashTagView.render().el).insertBefore(this.containerDiv.children()[1]);
		//Now finally appending the template...
		$(this.$el).append( this.containerDiv );
		return this;
	}
	
	
});

//Now finally creating story view..
app.Views.story = Backbone.View.extend({
	
	initialize: function(){
		this.MainStory = new app.Views.MainStory( { model : this.model } ),
		this.MainStoryMetadata = new app.Views.MainStoryMetadata({ model : this.model }) 
	},
	
	render: function(){
		this.$el.append( this.MainStory.render().el );
		this.$el.append( this.MainStoryMetadata.render().el ); 
		return this;
	}
	
});


