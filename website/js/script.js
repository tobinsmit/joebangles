// Initialize Firebase
firebase.initializeApp({
	apiKey: "AIzaSyCm120EmJYkXDaNv7Rttk7HU0ZT9RmeaRU",
	authDomain: "joebangles-unsw.firebaseapp.com",
	databaseURL: "https://joebangles-unsw.firebaseio.com",
	projectId: "joebangles-unsw",
	storageBucket: "",
	messagingSenderId: "729319341102"
});
var db = firebase.firestore();

var userData = {courses:{}, specs:[]};

// Dismiss warning
db.settings({ timestampsInSnapshots: true });

// Typeahead
var $input = $(".typeahead");
$input.typeahead({
  autoSelect: true,
  showCategoryHeader: true,
  // highlighter: true,
  minLength: 0,
  showHintOnFocus: true,
  fitToElement: true
});
db.doc("other/commonInfo").onSnapshot(doc => {
	if (doc.exists) {
		console.log("Course list doc found");
		$input.data('typeahead').source = doc.data().courseList;
	} else {
		console.log("Course list doc NOT found");
	}
})

db.doc("other/commonInfo").onSnapshot(doc => {
	if (doc.exists) {
		console.log("Course list doc found");
		input.data('typeahead').source = doc.data().courseList;
	} else {
		console.log("Course list doc NOT found");
	}
});

/*
 * Adding functions
 */

// addSpec Click
$('#addSpec').on('click', function() {
	
	loadSpec(document.getElementById("specialisationTF").value.toUpperCase());

});

// Load a spec, whether it is new, existing, from UI, from JSON etc
function loadSpec(specID){

	$('#specDisplayTitle').html('Loading...');

	// If new spec
	if(userData.specs.indexOf(specID) == -1){

		userData.specs.push(specID);

		// Empty text field
		$('#specialisationTF').val("");
		$('#specialisationTF').attr("placeholder", "");

		// Add a row to the 'Specialisations Added' Table
		$('#specialisationsTable').append(
		'<tr><td><span onclick="loadSpec(&#39'+specID+'&#39)" class="internal-link">'+specID+'</span></td>'+
		'<td><span class="fa fa-times" style="cursor:pointer" onclick="removeSpec(&#39'+specID+'&#39)"></span></td></tr>');

		fillSpecDisplay(specID);

	} 

	// If existing spec
	else {

		fillSpecDisplay(specID);

	}

}

// addCourse Click
$('#addCourse').on('click', function() {
	
	courseid = $('#courseAddInput').val().substring(0,8);
	courselongname = $('#courseAddInput').val().substring(11);

	if(courseList.indexOf(courseid) == -1 && courseid != ""){

		$('#coursesTable').append(
			'<tr>'+
				'<td><span onclick="removeCourse(&#39'+courseid+'&#39)" class="fa fa-times" style="cursor:pointer"></span></td>'+
				'<td><input type="checkbox" id="'+courseid+'" class="'+courseid+'"></td>'+
				'<td>'+courseid+'</td>'+
				'<td class="degreeCourses-nameTF">'+courselongname+'</td>'+
				'<td>'+
					'<div class="btn-group-toggle btn-group" data-toggle="buttons" role="group">'+
						'<button id="'+courseid+'_1" type="button" class="btn btn-outline-secondary term-btn">1</button>'+
						'<button id="'+courseid+'_2" type="button" class="btn btn-outline-secondary term-btn">2</button>'+
						'<button id="'+courseid+'_3" type="button" class="btn btn-outline-secondary term-btn">3</button>'+
						'<button id="'+courseid+'_4" type="button" class="btn btn-outline-secondary term-btn">Sum.</button>'+
					'</div>'+
				'</td>'+
			'</tr>'
		);

		setTerms(courseid);

		// Add this spec to the list of specs added
		courseList.push(courseid);

		// Empty text field
		$('#courseAddInput').val("");

	}
	
});

// Loads (but does NOT display) a given courseID
function loadCourse(courseID, callSetTerms){

	db.doc("courses/" + courseID).onSnapshot(doc => {
		if (doc.exists) {

			userData.courses["'"+courseID+"'"] = 	{

												longname : doc.data().longname,
												availableTerms : null,
												chosenTerm : null,
												chosenYear : null,
												prereq : null,
												state : "planned",

													};

			if(typeof doc.data().terms[0] !== 'undefined'){

				userData.courses["'"+courseID+"'"].availableTerms = doc.data().terms[0].terms;
			}

			if(typeof doc.data().prereqs[0] !== 'undefined'){

				userData.courses["'"+courseID+"'"].prereq = doc.data().prereqs[0].exp;
			}

			if(callSetTerms){
				setTerms(courseID);
			}

		} else {

			scrapeCourse(courseID);

		}
	});

}

/*
 * Setting functions
 */

// Sets the offering terms for a given courseID
function setTerms(courseID){

	var terms = [];

	for(i in userData.courses["'"+courseID+"'"].availableTerms){
				
		term = userData.courses["'"+courseID+"'"].availableTerms[i];

		if(term == "Term 1"){
			terms.push(1);
		} else if(term == "Term 2"){
			terms.push(2);
		} else if(term == "Term 3"){
			terms.push(3);
		} else if(term == "Summer Term"){
			terms.push(4);
		}

	}

	for(j in terms){
		$('#'+courseID+'_'+terms[j]).addClass('active');
	}

}

// Course CHECKBOX select/deselect
$(document).on('change', ':checkbox', function() {

	var courseID = $(this).attr('id');

    if(this.checked) {
      
    	userData.courses["'"+courseID+"'"].status = "completed";

    } else {
    	
    	userData.courses["'"+courseID+"'"].status = "planned";

    }
});

// Course RADIO select/deselect
$(document).on('click', ':radio', function() {

	var courseID = $(this).attr('id');

	for (var el of $('input[name="'+$(this).attr('name')+'"]')) {

		userData.courses["'"+$(el).attr('id')+"'"].status = "ignored";

	}

	if(this.checked) {
      
    	userData.courses["'"+courseID+"'"].status = "completed";

    } else {
    	
    	userData.courses["'"+courseID+"'"].status = "planned";

    }

	console.log(userData);

});

// When the terms are changed
$(document).on('click', '.term-btn', function(){

	var courseID = $(this).attr('id').substring(0,8);
	var term;

	if( $(this).attr('id').substring(9) == 1){
		term = "Term 1";
	} else if( $(this).attr('id').substring(9) == 2){
		term = "Term 2";
	} else if( $(this).attr('id').substring(9) == 3){
		term = "Term 3";
	} else if( $(this).attr('id').substring(9) == 4){
		term = "Summer Term";
	}

	if(userData.courses["'"+courseID+"'"].availableTerms.indexOf(term) == -1){
		userData.courses["'"+courseID+"'"].availableTerms.push(term);
	} else {
		userData.courses["'"+courseID+"'"].availableTerms
	}

});

/*
 * Removing functions
 */

// Removes the spec at index 'index' from the specList array
function removeSpec(specID) {

	var table = document.getElementById('specialisationsTable');

	// Remove element from table
	table.childNodes[0].removeChild(table.childNodes[0].childNodes[userData.specs.indexOf(specID)+1])

	// Remove spec from specList
	userData.specs.splice(userData.specs.indexOf(specID), 1);

	// Change whats displayed in the degreeCourses div
	if(userData.specs.length != 0){
		fillSpecDisplay(userData.specs[0]);
	} else {
		$('#specDisplayTitle').html("Add a Specialisation");
		$('#specDisplay').html("");
	}

}

// Removes the course at index 'index' from the courseList array
function removeCourse(courseID) {

	var table = document.getElementById('coursesTable');

	// Remove element from table
	table.childNodes[1].removeChild(table.childNodes[1].childNodes[courseList.indexOf(courseID)+2])

	// Remove spec from specList
	courseList.splice(courseList.indexOf(courseID), 1);
}

/*
 * Fill Spec Display
 */

// Fill the div #specDisplay with course levels, levels, compulsory subs (checkbox) and option sets (radio)
function fillSpecDisplay(specID) {

	db.doc("degrees/" + specID).onSnapshot(doc => {
		if (doc.exists) {

			// Set Title
			$('#specDisplayTitle').html(doc.data().longname);

			// Reset div
			$('#specDisplay').html("");

			courseLevels = doc.data().courseLevels;

			// For each level
			for (i_level in courseLevels) {

				levelObj = courseLevels[i_level];
				levelid = levelObj.levelid;

				el_card = document.createElement('div');
				el_card.className = 'card';

				el_cardHeader = document.createElement('div');
				el_cardHeader.className = 'card-header';

				el_button = document.createElement('button');
				el_button.innerHTML = levelid;
				el_button.className = 'btn btn-link';
				el_button.setAttribute('type', 'button');
				el_button.setAttribute('data-toggle', 'collapse');
				el_button.setAttribute('data-target', '#collapse_'+i_level);
				el_cardHeader.appendChild(el_button);

				el_cardBody = document.createElement('div');
				el_cardBody.className = 'card-body collapse';
				el_cardBody.setAttribute('id', 'collapse_'+i_level);
				el_cardBody.setAttribute('data-parent', '#specDisplay');

				el_table = document.createElement('table');
				el_table.className = 'degreeCoursesTable';

				el_row = document.createElement('tr');
				el_row.innerHTML = 
					'<table class="degreeCoursesTable"><tr>'+
		 				'<td style="width:20px;"></td>'+
         		   		'<td style="width:100px;"><b>Course</b></td>'+
         		   		'<td><b>Name</b></td>'+
           			 	'<td style="width:165px;"><b>2019 Terms</b></td>'+
					'</tr>';
				el_table.appendChild(el_row);

				// For each compulsory course
				for (courseid in levelObj.compulsory) {
					courseObj = levelObj.compulsory[courseid];

					var checkbox = '<td><input id="'+courseid+'" type="checkbox"></td>'

					if (typeof userData.courses["'"+courseid+"'"] === 'undefined'){
						loadCourse(courseid, true);
					} else {
						if (userData.courses["'"+courseid+"'"].status == "completed"){
							checkbox = '<td><input checked id="'+courseid+'" type="checkbox"></td>'
						}
					}

					el_row = document.createElement('tr');
					el_row.innerHTML =
						checkbox+
						'<td>'+courseid+'</td>'+
						'<td class="degreeCourses-nameTF">'+courseObj.longname+'</td>'+
						'<td>'+
							'<div class="btn-group-toggle btn-group" data-toggle="buttons" role="group">'+
								'<button id="'+courseid+'_1" type="button" class="btn btn-outline-secondary term-btn">1</button>'+
								'<button id="'+courseid+'_2" type="button" class="btn btn-outline-secondary term-btn">2</button>'+
								'<button id="'+courseid+'_3" type="button" class="btn btn-outline-secondary term-btn">3</button>'+
								'<button id="'+courseid+'_4" type="button" class="btn btn-outline-secondary term-btn">Sum.</button>'+
							'</div>'+
						'</td>';
					el_table.appendChild(el_row);

					if (typeof userData.courses["'"+courseid+"'"] !== 'undefined'){
						setTerms(courseid);
					}

				}

				// For each set of options
				for (i_optionSet in levelObj.optionSets) {
					optionSet = levelObj.optionSets[i_optionSet]

					el_row = document.createElement('tr');
					el_row.innerHTML =
						'<td></td>'+
						'<td></td>'+
						'<td style="padding-top:15px;"><b style="color:#666;">Choose one of the following:</b></td>';
					el_table.appendChild(el_row);

    				// For each course in each set of options
    				for (courseid in optionSet) {
    					courseObj = optionSet[courseid];

    					var radio = '<td><input name="'+levelid + " " + i_optionSet+'" type="radio" id="'+courseid+'"></td>';

    					if (typeof userData.courses["'"+courseid+"'"] === 'undefined'){
							loadCourse(courseid, true);
						} else {
							if (userData.courses["'"+courseid+"'"].status == "completed"){
								radio = '<td><input checked name="'+levelid + " " + i_optionSet+'" type="radio" id="'+courseid+'"></td>';
							}
						}

    					el_row = document.createElement('tr');
						el_row.innerHTML =
							radio+
							'<td>'+courseid+'</td>'+
							'<td class="degreeCourses-nameTF">'+courseObj.longname+'</td>'+
							'<td>'+
								'<div class="btn-group-toggle btn-group" data-toggle="buttons" role="group">'+
									'<button id="'+courseid+'_1" type="button" class="btn btn-outline-secondary term-btn">1</button>'+
									'<button id="'+courseid+'_2" type="button" class="btn btn-outline-secondary term-btn">2</button>'+
									'<button id="'+courseid+'_3" type="button" class="btn btn-outline-secondary term-btn">3</button>'+
									'<button id="'+courseid+'_4" type="button" class="btn btn-outline-secondary term-btn">Sum.</button>'+
								'</div>'+
							'</td>';
						el_table.appendChild(el_row);

						if (typeof userData.courses["'"+courseid+"'"] !== 'undefined'){
							setTerms(courseid);
						}

    				}
				}
				el_cardBody.appendChild(el_table);
				el_card.appendChild(el_cardHeader);
				el_card.appendChild(el_cardBody);
				document.getElementById("specDisplay").appendChild(el_card);

			}

		} else {
			scrapeDegree(specID);
		}
	});
}

