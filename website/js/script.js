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
var spedid;
var specList = [];
var courseList = [];

var planData = {completedCourses:{}, plannedCourses:{}};

// Dismiss warning
db.settings({ timestampsInSnapshots: true });

// Get all courses for typeahead
db.doc("other/commonInfo").onSnapshot(doc => {
	if (doc.exists) {
		console.log("Course list doc found");
		input.data('typeahead').source = doc.data().courseList;
	} else {
		console.log("Course list doc NOT found");
	}
});

// addSpec Click
$('#addSpec').on('click', function() {
	// Get specialistation
	specid = document.getElementById("specialisationTF").value.toUpperCase();

	if(specList.indexOf(specid) == -1){

		// Get degree doc
		retrieveSpec(specid);

		// Add this spec to the list of specs added
		specList.push(specid);

		// Empty text field
		$('#specialisationTF').val("");
		$('#specialisationTF').attr("placeholder", "");

		// Add a row to the 'Specialisations Added' Table
		$('#specialisationsTable').append(

		'<tr><td><span onclick="retrieveSpec(&#39'+specid+'&#39)" class="internal-link">'+specid+'</span></td>'+
		'<td><span class="fa fa-times" style="cursor:pointer" onclick="removeSpec(&#39'+specid+'&#39)"></span></td></tr>');
	}
});

// addCourse Click
$('#addCourse').on('click', function() {
	
	courseid = $('#courseAddInput').val().substring(0,8);
	courselongname = $('#courseAddInput').val().substring(11);

	if(courseList.indexOf(courseid) == -1 && courseid != ""){

		$('#coursesTable').append(
			'<tr>'+
				'<td><span onclick="removeCourse(&#39'+courseid+'&#39)" class="fa fa-times" style="cursor:pointer"></span></td>'+
				'<td><input onclick="courseSelectDeselect(&#39'+courseid+'&#39)" type="checkbox" id="'+courseid+'" class="'+courseid+'"></td>'+
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

// Loads a given specID
function retrieveSpec(specID){

	$('#degreeCoursesTitle').html("Loading...");
	db.doc("degrees/" + specID).onSnapshot(doc => {
		if (doc.exists) {
			fillDegreeCourses(doc.data());
		} else {
			scrapeDegree(specID);
		}
	});

}

// Sets the offering terms for a given courseID
function setTerms(courseID){

	db.doc("courses/" + courseID).onSnapshot(doc => {
		if (doc.exists) {

			var terms = [];

			for(i in doc.data().terms[0].terms){
				
				term = doc.data().terms[0].terms[i];

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

			planData.plannedCourses["'"+courseID+"'"] = {	longname: doc.data().longname,
															availableTerms : doc.data().terms[0].terms,
															chosenTerm : null
														};

		} else {

			scrapeCourse(courseID);

		}
	});
}

// Removes the spec at index 'index' from the specList array
function removeSpec(specID) {

	var table = document.getElementById('specialisationsTable');

	// Remove element from table
	table.childNodes[0].removeChild(table.childNodes[0].childNodes[specList.indexOf(specID)+1])

	// Remove spec from specList
	specList.splice(specList.indexOf(specID), 1);

	// Change whats displayed in the degreeCourses div
	if(specList.length != 0){
		retrieveSpec(specList[0])
	} else {
		$('#degreeCoursesTitle').html("Add a Specialisation");
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

// When a course is selected
function courseSelectDeselect(courseID){

	// If the course is currently in plannedCourses, then move it to completedCourses
	if(typeof planData.plannedCourses["'"+courseID+"'"] !== 'undefined'){

		planData.completedCourses["'"+courseID+"'"] = planData.plannedCourses["'"+courseID+"'"];
		delete planData.plannedCourses["'"+courseID+"'"];

	// Else if the course is currently in plannedCourses, then move it to completedCourses
	} else {

		planData.plannedCourses["'"+courseID+"'"] = planData.completedCourses["'"+courseID+"'"];
		delete planData.completedCourses["'"+courseID+"'"];

	}

}

// When the terms are changed
function termChange(btnID){

	var courseID = btnID.substring(0,8);
	var courseStatus;

	if(typeof planData.plannedCourses["'"+courseID+"'"] !== 'undefined'){
		courseStatus = planData.plannedCourses["'"+courseID+"'"];
	} else {
		courseStatus = planData.completedCourses["'"+courseID+"'"];
	}

	//courseStatus.availableTerms = // HERE

}

// Fill the div #degreeCourses with course levels, levels, compulsory subs (checkbox) and option sets (radio)
function fillDegreeCourses(data) {

	// Set Title
	$('#degreeCoursesTitle').html(data.longname);

	// Reset div
	$('#degreeCourses').html("");

	courseLevels = data.courseLevels;

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
		el_cardBody.setAttribute('data-parent', '#degreeCourses');

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

			el_row = document.createElement('tr');
			el_row.innerHTML =
				'<td><input onclick="courseSelectDeselect(&#39'+courseid+'&#39)" id="'+courseid+'" type="checkbox" class="'+courseid+'"></td>'+
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

			courseList.push(courseid);
			setTerms(courseid);

		}

		// For each set of options
		for (i_optionSet in levelObj.optionSets) {
			optionSet = levelObj.optionSets[i_optionSet]

			el_row = document.createElement('tr');
			el_row.innerHTML =
				'<td></td>'+
				'<td></td>'+
				'<td><b style="color:#666">Choose one of the following:</b></td>';
			el_table.appendChild(el_row);

    		// For each course in each set of options
    		for (courseid in optionSet) {
    			courseObj = optionSet[courseid];

    			el_row = document.createElement('tr');
				el_row.innerHTML =
					'<td><input onclick="courseSelectDeselect(&#39'+courseid+'&#39)" name="'+levelid + " " + i_optionSet+'" type="radio" id="'+courseid+'" class="'+courseid+'"></td>'+
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

    			courseList.push(courseid);
				setTerms(courseid);

    		}
		}
		el_cardBody.appendChild(el_table);
		el_card.appendChild(el_cardHeader);
		el_card.appendChild(el_cardBody);
		document.getElementById("degreeCourses").appendChild(el_card);
	}
}