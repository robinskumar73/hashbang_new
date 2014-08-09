// JavaScript Document

/*USER INTERFACE DESIGNS*/


//Loading stories.....
$(document).ready(function(e) {
	var y = view.render().el;
	y = $(y).children();
   app.generate = app.GeneratePages( y );
   init() ;

});





//------------------------------------------------ADDING THE KEYBOARD EVENTS---------------------------------------------------
$(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
		//Write keyboard events for LEft..
		console.log("Turn to PREV Stories..");
		
        break;

        case 39: // right
		e.preventDefault();
		console.log("Turn to NEXT stories..");
		turnNext()
        break;

        default: return; // exit this handler for other keys
    }
    
});


//Function for NEXT STORIES WITH ANIMATION EFFECT...
var turnNext = function(){
	//Function for turning to NEXT PAGE...
	// Set the effect type
    var effect = 'slide';
 
    // Set the options for the effect type chosen
    var options = { direction: 'left' };
 
    // Set the duration (default: 400 milliseconds)
    var duration = 700;
	//$("#storyList").toggle(effect, options, duration);
	//$("#storyList").hide("slide", { direction: "left" }, 1000);
	init();
	//$("#storyList").toggle( "fade",{}, 0);
	
	
	
	
}




var init = function(){
	//emptyColumns();
	page = app.Pages;
	app.generate.resetPage();
	app.generate.createPage();
	
}


var emptyColumns = function(){

	$("#hashColumn1View").empty();
	$("#hashColumn2View").empty();
	$("#hashMainHalfStoryID").empty();
}
