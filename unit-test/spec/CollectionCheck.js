// JavaScript Document..

describe("Testing Collections Entries...", function(){
	var trending_list =  new app.Collections.trendingTagsList;
	var trending2 = { tagId:'132', hashTagName:'#dummyHashTag',totalPromotions:18000 }

	trending_list.add([trending, trending2]);	
	it("Testing Trending Tag List localStore  ", function(){
		expect(trending_list.localStorage).toBeDefined(); 
		expect(trending_list.localStorage.name).toBe("hashbang-trendingTagsList");	
		expect( trending_list.toJSON()[0].totalPromotions).toBe(18000);	
	});

});
