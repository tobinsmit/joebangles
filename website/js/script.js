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

// Fill the div #degreeCourses with course levels, levels, compulsory subs (checkbox) and option sets (radio)
function fillDegreeCourses(data) {

	$('#degreeCoursesTitle').html(data.longname);

	// Reset div
	$('#degreeCourses').html(
		'<table id="degreeCourses"><tr>'+
		 	'<td style="width:20px;"></td>'+
            '<td style="width:100px;"><b>Course</b></td>'+
            '<td><b>Name</b></td>'+
            '<td style="width:165px;"><b>Terms</b></td>'+
		'</tr>'
	);

	courseLevels = data.courseLevels;

	// For each level
	for (i_level in courseLevels) {

		levelObj = courseLevels[i_level];
		levelid = levelObj.levelid;

		$('#degreeCourses').append(
			'<tr>'+
				'<td></td>'+
				'<td></td>'+
				'<td><b>'+levelid+'</b></td>'+
			'</tr>'
		);

		// For each compulsory course
		for (courseid in levelObj.compulsory) {
			courseObj = levelObj.compulsory[courseid];

			$('#degreeCourses').append(
				'<tr>'+
					'<td><input type="checkbox" id="'+courseid+'"></td>'+
					'<td>'+courseid+'</td>'+
					'<td class="degreeCourses-nameTF">'+courseObj.longname+'</td>'+
					'<td>'+
						'<div class="btn-group-toggle btn-group" data-toggle="buttons" role="group">'+
							'<button type="button" class="btn btn-outline-secondary term-btn">1</button>'+
							'<button type="button" class="btn btn-outline-secondary term-btn">2</button>'+
							'<button type="button" class="btn btn-outline-secondary term-btn">3</button>'+
							'<button type="button" class="btn btn-outline-secondary term-btn">Sum.</button>'+
						'</div>'+
					'</td>'+
				'</tr>'
			);

		}

		// For each set of options
		for (i_optionSet in levelObj.optionSets) {
			optionSet = levelObj.optionSets[i_optionSet]

    		$('#degreeCourses').append(
				'<tr>'+
					'<td></td>'+
					'<td></td>'+
					'<td><b style="color:#666">Choose one of the following:</b></td>'+
				'</tr>'
			);

    		// For each course in each set of options
    		for (courseid in optionSet) {
    			courseObj = optionSet[courseid];

    			$('#degreeCourses').append(
					'<tr>'+
						'<td><input name="'+levelid + " " + i_optionSet+'" type="radio" id="'+courseid+'"></td>'+
							'<td>'+courseid+'</td>'+
						'<td class="degreeCourses-nameTF">'+courseObj.longname+'</td>'+
						'<td>'+
							'<div class="btn-group" role="group">'+
								'<button type="button" class="btn btn-outline-secondary term-btn">1</button>'+
								'<button type="button" class="btn btn-outline-secondary term-btn">2</button>'+
								'<button type="button" class="btn btn-outline-secondary term-btn">3</button>'+
								'<button type="button" class="btn btn-outline-secondary term-btn">Sum.</button>'+
							'</div>'+
						'</td>'+
					'</tr>'
				);

    		}
		}
	}
}