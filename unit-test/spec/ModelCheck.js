//Javascript Document
//spec/ModelCheck.js
//Unit-Test written by Robins Gupta

//First creating dummny models...
var trendingTags = new app.Model.trendingTags( );
var trending = { tagId:'1234', hashTagName:'#dummyHashTag', totalPromotions:12500 }

var navLink = new app.Model.navLink();
var nav = {
	navId:'13142',
	navTitle:'JECRC',
	active:true
}


var votesFlag = new app.Model.votesFlag();
var votes = {
	totalVotes:'12345'

}

var hashTagMain = new app.Model.hashTagMain();
var hashTag = {
	tagId:'1314',
	tagName:'#TestingSite',
	currentPromotions:'35321'

}


var postedHashTag = new app.Model.postedHashTag();
var posted = hashTag;


//Describing Model...
describe("Checking Global values definitions...", function(){
	it("Checking app ", function(){
		expect(app).toBeDefined();
	});
	it("Checking app.Model", function(){
		expect(app.Model).toBeDefined();
	});
	it("Checking app.Collections", function(){
		expect(app.Collections).toBeDefined();
	});
	it("Checking app.Pages", function(){
		expect(app.Pages).toBeDefined();
	});
	
	it("Checking app.Views", function(){
		expect(app.Views).toBeDefined();
	});
	it("Checking app.Main and app.settings", function(){
		expect(app.Main).toBeDefined();
		expect(app.Settings).toBeDefined();
	});
	
});

describe("Checking Models default values", function(){
	var tag ={ tagId:'', hashTagName:'', totalPromotions:0 }
	it("Checking for Trending Tags Default Value", function(){
		expect(trendingTags.toJSON()).toEqual(tag);
	});

	var navDefault={ navId:'', navTitle:'',active:false }
	it("Checking for navLink Default value..", function(){
		expect( navLink.toJSON()).toEqual(navDefault);
	});

	var votesDefault = { totalVotes:'0' }
	it("Checking for default value of totalVotes", function(){
		expect( votesFlag.toJSON()).toEqual(votesDefault);
	});

	var hashtagDefault = {
		tagId:'',
		tagName:'',
		currentPromotions:''
	}
	
	it( "Checking for default value of hashTagMain", function(){ 
		expect(hashTagMain.toJSON()).toEqual(hashtagDefault);
	});	
	
	it("Checking for default value of PostedHashtag", function(){
		expect(postedHashTag.toJSON()).toEqual(hashtagDefault);
	});
});

//Now Checking for Model Add capability...
describe("Checking for Model add capability ", function(){

	it("Trending Tags", function(){
		trendingTags.set(trending);
		expect(trendingTags.toJSON()).toEqual(trending);
	});
	it("navLink", function(){
		navLink.set(nav);
		expect(navLink.toJSON()).toEqual(nav);
	});
	it("votesFlag", function(){ 
		votesFlag.set(votes);
		expect(votesFlag.toJSON()).toEqual(votes);
	});
	it("hashTagMain", function(){ 
		hashTagMain.set(hashTag);
		expect(hashTagMain.toJSON()).toEqual(hashTag);
	});
	
	it("PostedHashTag", function(){
		postedHashTag.set( hashTag );
		expect(postedHashTag.toJSON()).toEqual(hashTag);
	});

 });































