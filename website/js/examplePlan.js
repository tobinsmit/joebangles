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

  // Update el's selected term and year
  updateCourseData(el);
  reprintData();
    
});

// el was dropped into target before a sibling element, and originally came from source
drake.on('drop', function(el, target, source, sibling){

});


// Prevent user scrolling when dragging
var listener = function(e) {
    if (! scrollable) {
        e.preventDefault();
    }
}
document.addEventListener('touchmove', listener, { passive:false });

readDragDrop = function () {
  $('.course').each( function() {
    updateCourseData(this);
  });
}
updateCourseData = function(el) {
	let courseid = $(el).attr('id');
	let badcourseid = "'" + courseid + "'";
	console.log("updateCourseData: " + courseid);
  if ($(el).parent().hasClass('term')) {
  	// In term
    userData.courses[badcourseid].state = 'planned';
    userData.courses[badcourseid].chosenTerm = $(el).parent().data('term');
    userData.courses[badcourseid].chosenYear = $(el).parent().parent().parent().data('year');
  } else if ($(el).parent().attr('id') === 'completed') {
  	// In completed
    userData.courses[badcourseid].state = 'completed';
    userData.courses[badcourseid].chosenTerm = null;
    userData.courses[badcourseid].chosenYear = null;
  } else if ($(el).parent().attr('id') === 'unassigned') {
  	// In unassigned
    userData.courses[badcourseid].state = 'planned';      
    userData.courses[badcourseid].chosenTerm = null;
    userData.courses[badcourseid].chosenYear = null;
  } else {
    console.error("DropDrop readDragDrop: Unexpected location for course", el);
  }
}
reprintData = function () {
	$('#data').text(JSON.stringify(userData, null, 2));
}


checkIfValid = function(el, target) {
	// Accept unassigned
	if ($(target).hasClass('notInvalid')){
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
	$('#completed .course').each( function(i_course, course) {
		prereq = prereq.replace($(course).attr('id'),"1");
	});
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
	prereq = prereq.replace(/[A-Z]{4}[0-9]{4}/g,"0");
	prereq = eval(prereq)
	if (!prereq) {
		return 0
	}
  
	return true
}

clearDragDrop = function() {
	$('.course').remove();
}

loadDragDropPlanArr = function(planArr) {
	clearDragDrop();
	console.log("loadDragDropPlanArr", data);
	for (let i_course in planArr) {
		addCourse(planArr[i_course], '#completed');
	}
}

loadDragDropSplitObj = function(data) {
	clearDragDrop();
	console.log("loadDragDropSplitObj", data);
	for (let courseid in data.completedCourses) {
		data.completedCourses[courseid].courseid = courseid.replace(/'/g,'');
		addCourse(data.completedCourses[courseid], '#completed');
	}
	for (let courseid in data.plannedCourses) {
		data.plannedCourses[courseid].courseid = courseid.replace(/'/g,'');
		addCourse(data.plannedCourses[courseid], '#unassigned');
	}
}

loadDragDropWithState = function(data) {
	clearDragDrop();
	console.log("loadDragDropWithState", data);
	for (let courseid in data) {
		data[courseid].courseid = courseid.replace(/'/g,'');

		if (data[courseid].state === "completed") {
			addCourse(data[courseid], '#completed');
		} else if (data[courseid].state === "planned") {
			if (data[courseid].chosenTerm && data[courseid].chosenYear) {
				addCourse(data[courseid], '#year' + data[courseid].chosenYear + 'term' + data[courseid].chosenTerm);
			} else {
				addCourse(data[courseid], '#unassigned');
			}
		} else {
			// Don't add
		}
	}
}

addCourse = function(course, location) {

	html = 
			'<div id="' + course.courseid + '" class="draggable course" data-toggle="tooltip" data-html="true"'
			+(course.availableTerms ? ' data-available-terms="[' + course.availableTerms + ']"' : '')
			+(course.prereq ? '" data-prereq="' + course.prereq + '"' : '')
			+' data-original-title="'

			// Dont show none fields
			// +(course.availableTerms ? 'Terms: '+ (course.availableTerms + '').replace(/( )?Term( )?/g, '') : '')
			// +(course.prereq && course.availableTerms ? '<br>' : '')
			// +(course.prereq ? 'Prereq: '+ (course.prereq + '').replace(/\+/g, ' or ').replace(/\*/, ' and ') : '')

			// Show none fields
			+'Terms: ' + (course.availableTerms ? course.availableTerms : 'none')
			+'<br>'
			+'Prereq: ' + (course.prereq ? (course.prereq + '').replace(/\+/g, ' or ').replace(/\*/g, ' and ') : 'none')

			+'">'+ course.courseid +'</div>';
	
	$(location).append(html);
}

examplePlanArr = [
	{
	  courseid : "ENGG1000",
	  availableTerms : [1,2,3],
		longname : "Engineering Design",
		completed : true
	},
	{
	  courseid : "MATH1131",
	  availableTerms : [1,2,3],
		longname : "Mathematics 1A",
		completed : true
	},
	{
	  courseid : "MATH1231",
	  availableTerms : [1,2,3],
		longname : "Mathematics 1B",
		prereq : "MATH1131 + MATH1141",
		completed : true
	},
	{
	  courseid : "PHYS1121",
		longname : "Physics 1A",
		availableTerms : ["Summer", "1", "2", "3"],
		completed : true
	},
	{
	  courseid : "MMAN2100",
		longname : "Engineering Design 2",
		availableTerms : [3],
		// prereq : "ENGG1000",
		completed : true
	},
	{
	  courseid : "MMAN2300",
		longname : "Engineering Mechanics 2",
		availableTerms : ["2"],
		prereq : "(CVEN1300 + MINE1300 + MMAN1300) * MATH2019 + MATH2018 + MATH2111 * MATH2221 + MATH2011 * MATH2121 + MATH2069 * MATH2121"
	},
	{
	  courseid : "ELEC1111",
		longname : "Electrical and Telecommunications Engineering",
		availableTerms : [1,2]
	},
	{
	  courseid : "MATH2019",
		longname : "Engineering Mathematics 2E",
		availableTerms : ["1", "3"],
		prereq : "MATH1231 + MATH1241 + MATH1251"
	},
	{
	  courseid : "MMAN2130",
		longname : "Design and Manufacturing",
		availableTerms : ["2", "3"]
	},
	{
	  courseid : "MMAN1300",
		longname : "Engineering Mechanics",
		availableTerms : ["Summer", "2", "3"], // Made up
		prereq : "(MATH1131 + MATH1141) * (PHYS1121 + PHYS1131 + PHYS1141)"
	},
	{
	  courseid : "MMAN2400",
		longname : "Mechanics of Solids 1",
		availableTerms : ["1", "2"], // Made up
		prereq : "(MATH1231 + MATH1241) * (MMAN1300 + CVEN1300 + MINE1300)"
	}
]

// loadPlanArr(examplePlanArr)


examplePlanObj = {
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
