var drake = dragula({
    isContainer: function(el){
        return el.classList.contains('draggable-container');
    },
    accepts: function(el, target, source, sibling){
    	return true;
    }
});

var scrollable = true;

// el was lifted from source
drake.on('drag', function(el, source){
   scrollable = false;

	$('.term').each( function(i_term, term) {
		if (checkIfValid(el, term)) {
			$(term).addClass('term-option')
		} else {
			$(term).removeClass('term-option');
		}
	});

});

// Dragging event for el ended with either cancel, remove, or drop
drake.on('dragend', function(el){
  scrollable = true;

  $('.term').removeClass('term-option');

	$('.course').each( function() {
		if (checkIfValid(this, $(this).parent())) {
			$(this).removeClass('course-invalid');
		} else {
			$(this).addClass('course-invalid');
		}
	})
    
});

// el was dropped into target before a sibling element, and originally came from source
drake.on('drop', function(el, target, source, sibling){
    // Update el's selected term and year
    $('.term').removeClass('term-option');
});


// Prevent user scrolling when dragging
var listener = function(e) {
    if (! scrollable) {
        e.preventDefault();
    }
}
document.addEventListener('touchmove', listener, { passive:false });


checkIfValid = function(el, target) {
	// Accept unnasigned
	if ($(target).hasClass('unassigned')){
		return true
	}

	// Check course is available in sem
	availableTerms = $(el).data("available-terms") || [];
	prereq = $(el).data("prereq") || "1";
	targetTerm = $(target).data('term');
	if (!availableTerms.includes(targetTerm)) {
		return false
	}

	// Check prereq is satisfied
	$('.year').each( function(i_year, year) {
		if ($(year).data('year') < $(target).parent().parent().data('year')) {
			// Previous year
			$(year).find('.course').each( function(i_course, course) {
				prereq = prereq.replace($(course).attr('id'),"1")
			});
		} else if ($(year).data('year') == $(target).parent().parent().data('year')) {
			// Current year
			$(year).find('.term').each( function(i_term, term) {
				if ($(term).data('term') < $(target).data('term')) {
					// Previous term
					$(term).find('.course').each( function(i_course, course) {
						prereq = prereq.replace($(course).attr('id'),"1")
					});
				}
			});
		}
	});
	prereq = prereq.replace(/[A-Z]{4}[0-9]{4}/,"0");
	prereq = eval(prereq)
	if (!prereq) {
		return 0
	}
  
	return true
}

addPlan = function(plan) {
	for (let courseType in plan) {
		if (courseType == "completedCourses") {
			for (let course in plan[courseType]) {

			}
		} else if (courseType == "plannedCourses") {
			for (let course in plan[courseType]) {
			}
		} else {
			console.error("joebangles: unexpected course type in plan.", plan);
		}
	}
}


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
			availableTerms : ["Summer Term", "Term 1", "Term 2", "Term 3"],
			chosenTerm : "Term 1"
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
