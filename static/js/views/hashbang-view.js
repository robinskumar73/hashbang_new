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
	initialize: function() {
      this.listenTo(this.model, 'change', this.render);
	  
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
	
	render: function(){
		
		//Logging
		console.log("Rendering the vote template.... Current vote is " + this.model.get('totalVotes') + " and Story Id is " + this.model.parent.get('storyId'));
		
		this.$el.append(this.VotesTemplate(this.model.toJSON()));
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
	
	navLinkTemplate: _.template( $("#hashbang-navLink").html() ),
	
	events: {
		//Event for thumb-up
      	"click ol.hashBreadcrumbLink li a" : "handleClick"
    },
	
	//Handle nav link click...
	handleClick: function(e){
		
		e.preventDefault();
		console.log("nav link " + this.model.navTitle + " has been clicked");
	},
	
	render: function(){
		this.$el.append( this.navLinkTemplate( this.model.toJSON() ));	
		return this;
	}
	
});

// Now Creating a view for NavLinkList....
app.Views.navLinkList  = Backbone.View.extend ({
	
	
	tagName: 'div',
	className: 'col-md-10 hashBreadcrumbBox',
	
	initialize: function(){
			this.listenTo(NavLinkList,'add', this.addOne);
			this.listenTo(NavLinkList,'reset', this.resetLink);
			this.listenTo(NavLinkList,'remove', this.resetLink);
			//Now fetching from database...
			NavLinkList.fetch();
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
		NavLinkList.each( this.addOne, this );
	},
	
	render: function(){
		this.resetLink();
		return this;
	}
	
	
});

//Creating a view for postedHashtag..
app.Views.postedHashTag = Backbone.View.extend({
	
	postedHashTagTemplate: _.template( $("#hashbang-postedTag").html() ),
	
	events: {
		//Event for thumb-up
      	"click span.h5.hashMainStoryPostedHashTag" : "handleClick"
    },
	
	//Handling clicked event..
	handleClick: function(e){
			e.preventDefault();
			console.log("posted hashtag has been clicked.. tag name " + this.model.tagName );
	},
	
	render: function(){
		this.$el.append( this.postedHashTagTemplate( this.model.toJSON() ));
		return this;
	}

});

//Creating a view for postedHashtagList..
app.Views.postedHashTagList = Backbone.View.extend({
	
	postedHashTagListTemplate: _.template( $("#hashbang-postedTagList").html() ),
	
	initialize: function(){
		this.listenTo(PostedHashTagList,'add', this.addOne);
		this.listenTo(PostedHashTagList,'reset', this.resetLink);
		this.listenTo(PostedHashTagList,'remove', this.resetLink);
		
		//Now fetching from database...
		PostedHashTagList.fetch();
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
		PostedHashTagList.each( this.addOne, this );
	},
	
	render: function(){
		this.resetLink();
		return this;		
	}
	
	
	
});



//Creating a View for stories.....
app.Views.stories = Backbone.View.extend({



/*

<!-- Template for mainstoryhashtag -->


<!-- Template for hashMainStoryMetadata -->    
<script id="hashbang-hashMainStoryMetadata" type="text/template">
	<div class="col-md-12 hashMainStoryMetadata">
    	<!--<h4 class="col-md-12 glyphicon glyphicon-thumbs-up hashMainVotesThumb"></h4> -->
        <!--AREA FOR NAV LINK-->
        <!-- NAV LINK AREA ENDS-->
        <!--<div class="col-md-2 hashTotalVoteFlag">1000</div> --> 
        <!--<h4 class="col-md-12 glyphicon glyphicon-thumbs-down hashMainVotesThumb"></h4> -->
        <h4 class="col-md-12 text-danger hashMainPromoteText">Click to promote tags</h4>
        <!--POSTED HASHTAG AREA-->        
       	<div class="row">
        	<div class="col-lg-11 hashMainHashTagPostBox" >
    			<div class="input-group">
      				<input type="text" class="form-control hashMainHashTagPost" placeholder="Post #Tag">
      				<span class="input-group-btn hashMainTagPostSubmitButtonGroup">
        				<button class="btn btn-default hashMainTagPostSubmitButton" type="button">Go!</button>
      				</span>
    			</div> <!--input-group div ends -->
  			</div> <!-- col-lg-6 -->
		</div><!-- row -->       
    </div><!--DIV ENDS FOR HASH-MAIN-STORY-METADATA-->
</script>
    
	*/
	
	tagName: 'div',
	
	className: 'col-md-12 hashMainStory',
	
	hashBookMarkBoxTemplate: _.template( $("#hashbang-hashBookMarkBox").html() ),
	
	hashMainStoryHashTagTemplate : _.template( $("#hashbang-hashMainStoryHashTag").html() ),
	
	hashMainStoryMetadataTemplate : _.template( $("#hashbang-hashMainStoryMetadata").html() ),
	
	initialize: function(){
		
		//fetch all the stories child element models and collections necessary for creating stories.....
		this.model.navLink.fetch();
		this.model.votesFlag.fetch();
		this.model.hashTagMain.fetch();
		this.model.postedHashTag.fetch();
		
		
		
	},
	
	render: function(){
		//First clearing out the el..
		this.$el.html('');
		//First appending the bookmarkbox to the template..
		this.$el.append( this.hashBookMarkBoxTemplate( ) );
		//Now adding main story hashTag..
		this.$el.append( this.hashMainStoryHashTagTemplate( this.model.hashTagMain.toJSON() ));
		//Now adding heading to the template..
		this.$el.append(  );
		
	}
	
	
});