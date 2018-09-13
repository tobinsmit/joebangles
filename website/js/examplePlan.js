var drake = dragula({
    isContainer: function(el){
        return el.classList.contains('draggable-container');
    },
    accepts: function(el, target, source, sibling){

    	if(!target.hasChildNodes()){

    		if($(el).attr('id') == 'draggable1'){
    			return target.classList.contains('group1');
    		} else if($(el).attr('id') == 'draggable2'){
    			return target.classList.contains('group2');
    		} else {
    			return false
    		}
    		
    	}
    // Any logic can go here that decides what element 'el' can be dropped into what target 'target'.
    // Documentation: https://github.com/bevacqua/dragula
    }
});

var scrollable = true;

// This function is triggered when an element 'el' from source 'source' is dragged
drake.on('drag', function(el, source){
	if($(el).attr('id') == 'draggable1'){
		$('.group1').css("background-color","blue");
    } else if($(el).attr('id') == 'draggable2'){
    	$('.group2').css("background-color","blue");
    } 

    scrollable = false;
});

// This function is triggered when an element 'el' is dropped
drake.on('dragend', function(el){
	$('.draggable-container').css("background-color","white");
    
    scrollable = true;
});


// Prevent user scrolling when dragging
var listener = function(e) {
    if (! scrollable) {
        e.preventDefault();
    }
}
document.addEventListener('touchmove', listener, { passive:false });



examplePlan = {
	completedCourses : {
		"ENGG1000" : {
			longname : "Engineering Design"
		},
		"MATH1131" : {
			longname : "Mathematics 1A"
		},
		"MATH1231" : {
			longname : "Mathematics 1B",
			prereq : "MATH1131 + MATH1141"
		}
	},
	plannedCourses : {
		"PHYS1121" : {
			longname : "Physics 1A",
			availableTerms : ["Summer Term", "Term 1", "Term 2", "Term 3"]
			chosenTerm : ["Term 1"]
		},
		"MMAN2100" : {
			longname : "Engineering Design 2",
			availableTerms : ["Term 3"],
			prereq : "ENGG1000"
		},
		"MMAN2300" : {
			longname : "Engineering Mechanics 2",
			availableTerms : ["Term 2"],
			prereq : "(CVEN1300 + MINE1300 + MMAN1300) * MATH2019 + MATH2018 + MATH2111 * MATH2221 + MATH2011 * MATH2121 + MATH2069 * MATH2121"
		},
		"ELEC1111" : {
			longname : "Electrical and Telecommunications Engineering",
			terms : ["Term 1", "Term 3"]
		},
		"MATH2019" : {
			longname : "Engineering Mathematics 2E",
			terms : ["Term 1", "Term 3"],
			prereq : "MATH1231 + MATH1241 + MATH1251"
		},
		"MMAN2130" : {
			longname : "Design and Manufacturing",
			terms : ["Term 2", "Term 3"]
		},
		"MMAN1300" : {
			longname : "Engineering Mechanics",
			availableTerms : ["Summer Term", "Term 2", "Term 3"], // Made up
			prereq : "(MATH1131 + MATH1141) * (PHYS1121 + PHYS1131 + PHYS1141)"
		},
		"MMAN2400" : {
			longname : "Mechanics of Solids 1",
			terms : ["Term 1", "Term 2"], // Made up
			prereq : "(MATH1231 + MATH1241) * (MMAN1300 + CVEN1300 + MINE1300)"
		}

	}
}
