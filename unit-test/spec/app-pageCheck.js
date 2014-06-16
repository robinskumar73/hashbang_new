//Initializing collection...
//Creating a global var test
var test = test || {}; 
test.TrendingTagCollectionTest = [

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




test.ModelstoryTest = {
        storyId:'1',
        storyTitle: 'Lorem ipsum dolor sit amet, consectetur',
        storyPosted: 'june-6th-2014',
        storyContent: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis Lorem ipsum dolor sit amet, consectetur<br><br>Lorem ipsum dolor sit amet, mpor incididunt ut labore et dolore magna aliqua. quis Lorem ipsum dolor sit amet, consectetu<br><br>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut eni<br>'
}

test.navLinkTest = [ { navId:'1',navTitle:'Jecrc',active:false },{ navId:'2',navTitle:'C.S.', active:false },{ navId:'3',navTitle:'B-1 Batch',active:true } ]

test.votesFlagTest = {totalVotes:'5500'}

test.hashTagMainTest = { tagId:'124', tagName:'#iLoveCricket', currentPromotions:'234520' }

test.postedHashTagTest = [ { tagId:'212', currentPromotions:'34351', tagName:'#DuniyaKaChutiyapa'},{ tagId:'21242', currentPromotions:'351', tagName:'#Bitches'},{ tagId:'212', currentPromotions:'34351', tagName:'#NoSleep'},{ tagId:'212', currentPromotions:'34351', tagName:'#TheGirlWhoDumpedMe'},{ tagId:'212', currentPromotions:'34351', tagName:'#LoveMyPhone'},{ tagId:'21242', currentPromotions:'351', tagName:'#Bitches'},{ tagId:'212', currentPromotions:'34351', tagName:'#NoSleep'}  ]


//Writing Suites and Specs......
describe("Testing Model Story..", function(){
	
	//Calling Story Model...
	var StoryModelTest = new app.Model.story(test.ModelstoryTest, test.navLinkTest, test.votesFlagTest, test.hashTagMainTest, test.postedHashTagTest ); 
	it("Checking its constructor function arguments...", function(){
	expect(StoryModelTest.navLink.toJSON()).toEqual(test.navLinkTest);
	expect(StoryModelTest.toJSON()).toEqual(test.ModelstoryTest);
	expect(StoryModelTest.votesFlag.toJSON()).toEqual(test.votesFlagTest);
	expect(StoryModelTest.hashTagMain.toJSON()).toEqual(test.hashTagMainTest);
	expect(StoryModelTest.postedHashTag.toJSON()).toEqual(test.postedHashTagTest);

	});

	it("Checking  Story  child models and collections its  parent property ", function(){
	
	expect(StoryModelTest.navLink.parent).toEqual(StoryModelTest);
	expect(StoryModelTest.votesFlag.parent).toEqual(StoryModelTest);

	expect(StoryModelTest.hashTagMain.parent).toEqual(StoryModelTest);
	expect(StoryModelTest.postedHashTag.parent).toEqual(StoryModelTest);
	});
	
	it("Checking story local storage property..", function(){
		expect(StoryModelTest.navLink.localStorage.name).toBe("hashbang-"+StoryModelTest.id()+"-navLink");	
	expect(StoryModelTest.votesFlag.localStorage.name).toBe("hashbang-"+StoryModelTest.id()+"-votesFlag");
        expect(StoryModelTest.hashTagMain.localStorage.name).toBe("hashbang-"+StoryModelTest.id()+"-hashTagMain");
	expect(StoryModelTest.postedHashTag.localStorage.name).toBe("hashbang-"+StoryModelTest.id()+"-postedHashTag");
	
	});
});



describe("Story Collection Structure unit-testing", function(){
	it("Checking story list instance..",function(){
		expect(Stories instanceof app.Collections.storyList).toBe(true);
	});
	it("Checking localStorage value..",function(){
		expect(Stories.localStorage).toBeDefined();
		expect(Stories.localStorage.name).toBe("hashbang-storyList");
	}); 
	it("Checking collection model property..", function(){
		expect(Stories.model).toBe(app.Model.story);
	});
});


//Testting for Pages class..
describe("Testing Create Page Function..", function(){
	//Creating variable for testing...
	//First opening a new window for testing...
	
	var parent = $("<div id='parent' style='height:250px;width:200px;border:solid;'>");
	
	
	var child1 =  $("<p style='height:100px;width:190px;border:solid;'>Hey i am non overflow element</p>");
	var child2 = $("<p style='height:400px;width:200px;border:solid;'>HEy i am overflow</p>");
	var childHorizentalOverflow = $("<p style='height:100px;width:300px;border:solid;'>This is Horizental Overflow</p>");
	var text = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis Lorem ipsum dolor sit amet, consectetur<br><br>Lorem ipsum dolor sit amet, mpor incididunt ut labore et dolore magna aliqua. quis Lorem ipsum dolor sit amet";	
	
		it("Testing for Overflow", function(){
		
			var myWindow = window.open("", "Testing Window", "width=500, height=600");
			$(myWindow.document.body).append(parent);	
			var parent1 = myWindow.document.getElementById("parent");
			
			expect(app.Pages).toBeDefined();
			$(parent).append(child1);
			expect( app.Pages.OverflowY( parent1 ) ).toBe(false);
			$(parent).append(child2);
			$(parent).append(childHorizentalOverflow);
			expect( app.Pages.OverflowY( parent1 ) ).toBe(true);
			$(parent1).empty();
			$(parent).empty();
			$(parent1).append(childHorizentalOverflow);
			
			expect( app.Pages.OverflowX( parent1 ) ).toBe(true) ;
			childHorizentalOverflow.css("width",'100px');
			expect( app.Pages.OverflowX( parent1 ) ).toBe(false) ;
			$(parent1).empty();
			myWindow.close();
			
 			
		});
		
		it("Testing for Calculating Overflow..",function(){
			var myWindow = window.open("", "Testing Window", "width=500, height=600");
			$(myWindow.document.body).append(parent);	
			var parent1 = myWindow.document.getElementById("parent");
			$(parent).append(child1);
			$(parent).append(child2);
			var invisibleItems = app.Pages.calculateYOverflow(parent1);
			//console.log(test.invisibleItems[0]);
			expect($(invisibleItems[0]).html()).toBe($(child2).html());
			$(parent1).empty();
			childHorizentalOverflow.css("width",'500px');
			$(parent1).append(childHorizentalOverflow,true);
			invisibleItems = app.Pages.calculateXOverflow(parent1);
			expect($(invisibleItems[0]).html()).toBe( $(childHorizentalOverflow).html() );
			$(parent1).empty();
			myWindow.close();
		});
		
		
		var  text =	"sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbmzxzxxxxxxxxxxxaszabcdssss s sfsfasfsalkn jdasfjksjfk kskalfdsk" ;

		var text2 = "<span>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do <b>eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis Lorem ipsum dolor sit amet, consectetur<br></b></span><br><span>Lorem <b>ipsum dolor sit amet, cor  &lt;script&gt;adipisicing elit <br> &amp;, sed do </b> eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis Lorem ipsum dolor sit amet, consectetur<br></span><br><span><b>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis Lorem ipsum dolor sit amet, consectetur<br></span><br><span>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,</b> quis Lorem ipsum dolor sit amet, consectetur</span><br>";

		var child = $('<p>');

		var parent = $('<div style="width:200px;height:200px;word-wrap:break-word;border:solid;" id="parent" >');

		
		
		it("Split Test function checking..", function(){
			//Note: The split check still has fault for checking very large text.... and it shows vertical overflow ...test it by trying "text" variable..
			//Testing split text......
			var myWindow = window.open("", "Testing Window", "width=500, height=600");
			$(myWindow.document.body).append(parent);
			var parent1 = myWindow.document.getElementById("parent");
			var page = app.Pages;
			//First appending the text then checking its overflow..
			$(parent1).append(child);
			child.append(text2);
			
			//Now checking overflow...
			expect( page.OverflowY( parent1 )).toBe(true);
			//Now empty child and parent..
			child.empty();
			$(parent1).empty();
			page.splitText( text2, child, parent1 );
			expect( page.OverflowY( parent1 )).toBe(false);
			
			child.empty();
			$(parent1).empty();
			//Checking for tag..
			var text3 = "<span>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do <b>eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis Lorem ipsum dolor sit msdj jsndj jsfjkf sjadj hsbdh js hasdhg hasdyg hadgg hsdhgsahy shdgayo robins skfjks jsdhuj usduak robi";
			var newText = page.splitText( text3, child, parent1 );
			if(newText.length)
			{
				expect(newText[0].slice(newText[0].length-7)).toBe('</span>');
			}
		})
		


});


	

































