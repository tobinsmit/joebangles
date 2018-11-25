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
var temp_specDisplayTitle;

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

db.doc("other/commonInfo").get().then(doc => {
	if (doc.exists) {
		// Increment use counter
		previousUsecases = doc.data().usecases || 0;
		db.doc("other/commonInfo").set({usecases: previousUsecases + 1},{merge:true});

		//console.log("Course list doc found");
		$input.data('typeahead').source = doc.data().courseList;
	} else {
		console.log("Course list doc NOT found");
	}
});
 
/*
	Cookie functions
*/

//Writes current data to cookie
writeCookie = function(){
	console.log("writeCookie");
	document.cookie = 'joebanglesJSON='+ saveStateToJSONString() + 
					';expires=Fri, 31 Dec 2030 23:59:59 GMT;path=/';
	// document.cookie = "joebanglesJSON=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
};

// Exports state to a json object
saveStateToJSONString = function() {
	temp_obj = removeEmpty(removeIgnored(userData));
	console.log(temp_obj)
	string = JSON.stringify(temp_obj);
	console.log("saveStateToJSON");
	console.log(string);
	if (byteCount(string) >= 4000) {
		alert("Cannot store cookie as too many courses are marked as completed or planned");
		console.error("Cannot store cookie as too many courses are marked as completed or planned");
		return
	}
	return string
}
byteCount = function(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}


// Turns objects with state : 'ignored' to null
function removeIgnored(obj) {
  const o = JSON.parse(JSON.stringify(obj)); // Clone source oect.

  Object.keys(o).forEach(key => {
    if (o[key] && typeof o[key] === 'object') {
      o[key] = removeIgnored(o[key]);  // Recurse
    }
  });

  if (o.state && o.state === 'ignored') {
  	return
  }

  return o; // Return new object.
}

// Removes null and undeifned values in nested objects
removeEmpty = function(obj){
  const o = JSON.parse(JSON.stringify(obj)); // Clone source oect.

  Object.keys(o).forEach(key => {
    if (o[key] && typeof o[key] === 'object')
      o[key] = removeEmpty(o[key]);  // Recurse.
    else if (o[key] === undefined || o[key] === null)
      delete o[key]; // Delete undefined and null.
    else
      o[key] = o[key];  // Copy value.
  });

  return o; // Return new object.
};

//Reads subject data from cookie
readCookie = function(){
	console.log("readCookie");
	console.log("All cookies:", document.cookie);
	let cookieData = document.cookie.split(';');
	for (let i in cookieData) {
		thisCookie = cookieData[i];
		console.log("This cookie", thisCookie)
		if (thisCookie.match(/joebanglesJSON=/)) {
			thisCookie = thisCookie.replace('joebanglesJSON=', ''); // Remove name
			thisCookie = thisCookie.replace(/;.*/g,'');
			thisCookie = JSON.parse(thisCookie);
			console.log("This cookie data:",thisCookie);
			userData = thisCookie;
			loadUI();
		} else {
			console.log('not match');
		}
	}
};

// Loads state from a json object
loadUI = function() {

	// Clear everything first
	$('#specialisationsTable').html('<tr><td><b>Specialisations</b></td></tr>');

	$('#coursesTable').html(
		'<tr>'+
    	'<td style="width:100px;"></td>'+
    	'<td><b>Course</b></td>'+
			'<td style="width:165px;">'+
				'<b>2019 Terms </b>'+
				'<span class="fa fa-question-circle" data-toggle="tooltip" data-original-title="These are the available terms read from the handbook. Sometimes the handbook is wrong and you can correct them here."></span>'+
			'</td>'+
    '</tr>'
  );

	$('#specDisplay').html("");
	$('#specDisplayTitle').html("Add a Specialisation");

	// Load specs for specTable
	for(var spec in userData.specs){
		loadSpec(userData.specs[spec]);
	}

	// Load special courses
	for(var course in userData.courses){
		if(userData.courses[course].isSpecial){
			loadCourse(course.substring(1,9), true, "planned", true, null);
		}
	}

	// Load courses to DragDrop
	loadDragDropWithState(userData.courses);

	reactivateTooltips();
}

refreshOLD = function() {
	writeCookie();
	readCookie();
}

// Load cookie when page is ready
// $(document).ready(function(){
// 	readCookie();
// 	reactivateTooltips();
// });

//Save cookie on page unload
// $(window).on('unload', function() {
// 	writeCookie();
// });

/*
	localStorage functions
*/

readLocalStorage = function() {
	console.log("readLocalStorage");
	userData = JSON.parse(localStorage.userDataString);
	//console.log("Read data:");
	//console.log(userData);
	loadUI();
}

writeLocalStorage = function() {
	console.log("writeLocalStorage");
	localStorage.userDataString = JSON.stringify(userData);
}

// Load when page is ready
$(document).ready(function(){
	readLocalStorage();
});

// Save on page unload
$(window).on('unload', function() {
	writeLocalStorage();
});

refresh = function() {
	writeLocalStorage();
	readLocalStorage();
}

/*
 * Adding functions
 */

// addSpec Click
$('#addSpec').on('click', function() {
	
	specID = document.getElementById("specialisationTF").value.toUpperCase();
	document.getElementById("specialisationTF").value = "";

	if(!userData.specs.includes(specID))
		loadSpec(specID);

});

// Load a spec, whether it is new, existing, from UI, from JSON etc
function loadSpec(specID){

	temp_specDisplayTitle = $('#specDisplayTitle').html();

	$('#specDisplayTitle').html('Loading...');
	updateSpecProgressBanner("Checking database");

	fillSpecDisplay(specID, true);

}

$('#reset').on('click', function(){
	if (confirm("Are you sure you want to clear all of the data?")) {
		userData = {specs:[], courses:{}};
		refresh();
	}
});

// addSpecialCourse Click
$('#addCourse').on('click', function() {

	updateCourseProgressBanner("Checking database...");
	
	courseid = $('#courseAddInput').val().substring(0,8);
	courselongname = $('#courseAddInput').val().substring(11);

	// Empty text field
	$('#courseAddInput').val("");

	if(typeof userData.courses["'"+courseid+"'"] === 'undefined'){
		loadCourse(courseid, true, "planned", true, null);
	} else {
		updateCourseProgressBanner("Course already offered in 1 or more specialisations.", "text-danger");
	}

});

// Copy link to clipboard in step 5
$("#copyLinkBut").on('click', function() {
  $("#copyLinkBut").html('<span class="far fa-clipboard-check"></span>');
  var copyTest = document.queryCommandSupported('copy');
  if (copyTest === true) {
    el = document.getElementById('copyLinkField')
    el.select();
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'Copied!' : 'Whoops, not copied!';
      $(this).attr('data-original-title', msg).tooltip('show');
    } catch (err) {
      console.log('Oops, unable to copy');
    }
    // Remove selection
    window.getSelection().removeAllRanges()
  } else {
    // Fallback if browser doesn't support .execCommand('copy')
    window.prompt("Copy to clipboard: Ctrl+C or Command+C, Enter", "joebangles.tobinsmit.com");
  }
});


function dragDropAddRow() {
	year = $('.year').length + 1;
	$('#dragDropTable tbody').append(
    '<tr class="year" data-year="' + year + '">'+
      '<th scope="row">' + year + '</th>'+
      '<td class="p-0"><div id="year' + year + 'term1" class="draggable-container term" data-term="1"></div></td>'+
      '<td class="p-0"><div id="year' + year + 'term2" class="draggable-container term" data-term="2"></div></td>'+
      '<td class="p-0"><div id="year' + year + 'term3" class="draggable-container term" data-term="3"></div></td>'+
    '</tr>'
	);
}

function dragDropRemoveRow() {
	$('.year').last().find('.course').each( function() {
		$(this).prependTo('#unassigned');
	})
	$('.year').last().remove();
}

/*
 * Removing functions
 */

// Removes the spec at index 'index' from the specList array
function removeSpec(specID) {

	var table = document.getElementById('specialisationsTable');

	// Remove element from table
	table.removeChild(table.childNodes[userData.specs.indexOf(specID)+1])

	// Remove spec from specList
	userData.specs.splice(userData.specs.indexOf(specID), 1);

	// Change whats displayed in the degreeCourses div
	if(userData.specs.length != 0){
		fillSpecDisplay(userData.specs[0], false);
	} else {
		$('#specDisplayTitle').html("Add a Specialisation");
		$('#specDisplay').html("");
	}

	removeSpecObj(specID);

}

// Removes the course at index 'index' from the courseList array
function removeSpecialCourse(courseID) {

	var table = document.getElementById('coursesTable');

	for(var i in table.childNodes){

		node = table.childNodes[i];

		if($(node.childNodes[1]).html().startsWith(courseID)){
			// Remove element from table
			table.removeChild(node);

			// Remove spec from userData
			delete userData.courses["'"+courseID+"'"];

			return;
		}
	}

}

// courseID
// isSpecial: true if a special course if being loaded
// defaultState: default state (ie completed, planned, ignored) that will be set
// addToSpecialCourseTable: true if this is a course being loaded for the first time
// callerSpec: The spec that called loadCourse, so that it can be added to the array of specs this course belongs to
function loadCourse(courseID, isSpecial, defaultState, addToSpecialCourseTable, callerSpec){

	// If course **IS NOT** in userData
	if(typeof userData.courses["'"+courseID+"'"] === 'undefined'){

		var isSuccess = false;

		db.doc("courses/" + courseID).get().then(doc => {

			if (doc.exists) {
				// Increment use counter
				previousUsecases = doc.data().usecases || 0;
				db.doc("courses/" + courseID).set({usecases: previousUsecases + 1},{merge:true});


				userData.courses["'"+courseID+"'"] = 	{
					longname : doc.data().longname,
					availableTerms : null,
					chosenTerm : null,
					chosenYear : null,
					prereq : null,
					state : defaultState,
					belongsTo : [callerSpec]
				};

				if (isSpecial) {
					userData.courses["'"+courseID+"'"].isSpecial = isSpecial;
				}

				if(typeof doc.data().terms[0] !== 'undefined'){

					userData.courses["'"+courseID+"'"].availableTerms = doc.data().terms[0].terms;
				}

				if(typeof doc.data().prereqs[0] !== 'undefined'){

					userData.courses["'"+courseID+"'"].prereq = doc.data().prereqs[0].exp;
				}

				if(typeof doc.data().prereqs[0] !== 'undefined'){

					userData.courses["'"+courseID+"'"].prereqString = doc.data().prereqs[0].label;
				}

				loadCourse(courseID, isSpecial, defaultState, addToSpecialCourseTable, callerSpec);

			} else {

				scrapeCourse(courseID, isSpecial, defaultState, addToSpecialCourseTable);

			}
		});

	// If course **IS** in userData
	} else {

		if(addToSpecialCourseTable){
			$('#coursesTable').append(
				'<tr><td>'+
					'<span class="fa fa-times icon" onclick="removeSpecialCourse(&#39'+courseID+'&#39)"></span>&emsp;'+
					'<span id="'+courseID+'_c" class="fa fa-check icon"></span>&ensp;'+
       				'<span id="'+courseID+'_p" class="far fa-calendar-alt icon"></span>&ensp;'+
      				'<span id="'+courseID+'_i" class="fa fa-ban icon"></span>'+
				'</td>'+
				'<td class="degreeCourses-nameTF">'+courseID+' - '+userData.courses["'"+courseID+"'"].longname+'</td>'+
				'<td>'+
					'<div class="btn-group-toggle btn-group" data-toggle="buttons" role="group">'+
						'<button id="'+courseID+'_1" type="button" class="btn btn-outline-secondary term-btn">1</button>'+
						'<button id="'+courseID+'_2" type="button" class="btn btn-outline-secondary term-btn">2</button>'+
						'<button id="'+courseID+'_3" type="button" class="btn btn-outline-secondary term-btn">3</button>'+
						'<button id="'+courseID+'_4" type="button" class="btn btn-outline-secondary term-btn">Sum.</button>'+
					'</div>'+
				'</td></tr>');
		} 

		// Add the caller spec to the array of specs this course belongs to if needed.
		if((typeof callerSpec !== 'undefined') && (callerSpec != null)){
			if(!userData.courses["'"+courseID+"'"].belongsTo.includes(callerSpec)){
				userData.courses["'"+courseID+"'"].belongsTo.push(callerSpec);
			}
		}

		setStatusIcon(courseID, userData.courses["'"+courseID+"'"].state, true);
		setTerms(courseID);

		updateCourseProgressBanner("Success", "text-success");

	}
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

// Change offering terms when one of the toggle buttons is pressed
$(document).on('click', '.term-btn', function(){

	term_longname = "";
	term = $(this).html();
	courseID = $(this).attr('id').substring(0,8);

	terms = userData.courses["'"+courseID+"'"].availableTerms;

	if(term == "1"){
		term_longname = "Term 1";
	} else if(term == "2"){
		term_longname = "Term 2";
	} else if(term == "3"){
		term_longname = "Term 3";
	} else if(term == "Sum."){
		term_longname = "Summer Term";
	}

	if(terms.includes(term_longname)){
		terms.splice(terms.indexOf(term_longname), 1);
	} else {
		terms.push(term_longname);
	}

});

$(document).on('click', '.icon', function(){

	if(!$(this).hasClass('fa-times')){

		courseID = $(this).attr('id').substring(0,8);

		if($(this).hasClass("fa-check")){
			setStatusIcon(courseID, "completed", false);
		} else if($(this).hasClass("fa-calendar-alt")){
			setStatusIcon(courseID, "planned", false);
		} else if($(this).hasClass("fa-ban")){
			setStatusIcon(courseID, "ignored", false);
		}

	}

});

function setStatusIcon(courseID, state, initialLoad){

	userData.courses["'"+courseID+"'"].state = state;

	var p = $('#'+courseID+'_p');
	var c = $('#'+courseID+'_c');
	var i = $('#'+courseID+'_i');

	if(p.attr('class').startsWith('s') && !(initialLoad && state == "ignored")){

		var elList = $('.'+p.attr('class').substring(0,5));

		for(var j=2; j < elList.length+2; j+=3){
			var id = $(elList[j]).attr('id').substring(0,8);

			if(id != courseID) {
				$('#'+id+'_p').removeClass("calendar-active");
				$('#'+id+'_c').removeClass("check-active");
				$('#'+id+'_i').addClass("ban-active");

				if(typeof userData.courses["'"+id+"'"] !== 'undefined'){
					userData.courses["'"+id+"'"].state = "ignored";
				}

			} else {

				if(state == "completed" && !c.hasClass("check-active")){
					p.removeClass("calendar-active");
					c.addClass("check-active");
					i.removeClass("ban-active");
				} else if(state == "planned" && !p.hasClass("calendar-active")){
					p.addClass("calendar-active");
					c.removeClass("check-active");
					i.removeClass("ban-active");
				} else if(state == "ignored" && !i.hasClass("ban-active")){
					p.removeClass("calendar-active");
					c.removeClass("check-active");
					i.addClass("ban-active");
				}

			}
		}

	} else {

		if(state == "completed" && !c.hasClass("check-active")){
			p.removeClass("calendar-active");
			c.addClass("check-active");
			i.removeClass("ban-active");
		} else if(state == "planned" && !p.hasClass("calendar-active")){
			p.addClass("calendar-active");
			c.removeClass("check-active");
			i.removeClass("ban-active");
		} else if(state == "ignored" && !i.hasClass("ban-active")){
			p.removeClass("calendar-active");
			c.removeClass("check-active");
			i.addClass("ban-active");
		}

	}
}

/*
 * Fill Spec Display
 */

// Fill the div #specDisplay with course levels, levels, compulsory subs (checkbox) and option sets (radio)
// fromLoadSpec is true if this function is called from loadSpec
function fillSpecDisplay(specID, fromLoadSpec) {

	var defaultState;
	var isSuccess = false;

	db.doc("degrees/" + specID).get().then(doc => {
		if (doc.exists) {
			// Increment use counter
			previousUsecases = doc.data().usecases || 0;
			db.doc("degrees/" + specID).set({usecases: previousUsecases + 1},{merge:true});

			// Set Title
			$('#specDisplayTitle').html(doc.data().longname);
			isSuccess = true;

			// Reset div
			$('#specDisplay').html("");
			updateSpecProgressBanner("Success", "text-success");

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
         		'<td style="width:80px;"></td>'+
         		'<td><b>Course</b></td>'+
           	'<td style="width:165px;">'+
           		'<b>2019 Terms </b>'+
           		'<span class="fa fa-question-circle" data-toggle="tooltip" data-original-title="These are the available terms read from the handbook. Sometimes the handbook is wrong and you can correct them here."></span>'+
           	'</td>'+
					'</tr>';
				el_table.appendChild(el_row);

				// For each compulsory course
				for (courseid in levelObj.compulsory) {
					courseObj = levelObj.compulsory[courseid];

					el_row = document.createElement('tr');
					el_row.innerHTML =
						'<td>'+
							'<span id="'+courseid+'_c" class="fa fa-check icon"></span>&ensp;'+
           					'<span id="'+courseid+'_p" class="far fa-calendar-alt icon"></span>&ensp;'+
          					'<span id="'+courseid+'_i" class="fa fa-ban icon"></span>'+
						'</td>'+
						'<td class="degreeCourses-nameTF">'+courseid+' - '+courseObj.longname+'</td>'+
						'<td>'+
							'<div class="btn-group-toggle btn-group" data-toggle="buttons" role="group">'+
								'<button id="'+courseid+'_1" type="button" class="btn btn-outline-secondary term-btn">1</button>'+
								'<button id="'+courseid+'_2" type="button" class="btn btn-outline-secondary term-btn">2</button>'+
								'<button id="'+courseid+'_3" type="button" class="btn btn-outline-secondary term-btn">3</button>'+
								'<button id="'+courseid+'_4" type="button" class="btn btn-outline-secondary term-btn">Sum.</button>'+
							'</div>'+
						'</td>';

					if(document.getElementById(courseid+'_1') == null){
						el_table.appendChild(el_row);
					}
				}

				// For each set of options
				for (i_optionSet in levelObj.optionSets) {
					optionSet = levelObj.optionSets[i_optionSet]

					el_row = document.createElement('tr');
					el_row.innerHTML =
						'<td></td>'+
						'<td style="padding-top:15px;"><b style="color:#666;">Choose one of the following:</b></td>';
					el_table.appendChild(el_row);

    				// For each course in each set of options
    				for (courseid in optionSet) {
    					courseObj = optionSet[courseid];

    					el_row = document.createElement('tr');
						el_row.innerHTML =
							'<td>'+
								'<span id="'+courseid+'_c" class="set'+i_optionSet+i_level+' fa fa-check icon"></span>&ensp;'+
           						'<span id="'+courseid+'_p" class="set'+i_optionSet+i_level+' far fa-calendar-alt icon"></span>&ensp;'+
          						'<span id="'+courseid+'_i" class="set'+i_optionSet+i_level+' fa fa-ban icon"></span>'+
							'</td>'+
							'<td class="degreeCourses-nameTF">'+courseid+' - '+courseObj.longname+'</td>'+
							'<td>'+
								'<div class="btn-group-toggle btn-group" data-toggle="buttons" role="group">'+
									'<button id="'+courseid+'_1" type="button" class="btn btn-outline-secondary term-btn">1</button>'+
									'<button id="'+courseid+'_2" type="button" class="btn btn-outline-secondary term-btn">2</button>'+
									'<button id="'+courseid+'_3" type="button" class="btn btn-outline-secondary term-btn">3</button>'+
									'<button id="'+courseid+'_4" type="button" class="btn btn-outline-secondary term-btn">Sum.</button>'+
								'</div>'+
							'</td>';

						if(document.getElementById(courseid+'_1') == null){
							el_table.appendChild(el_row);
						}

    				}
				}

				el_cardBody.appendChild(el_table);
				el_card.appendChild(el_cardHeader);
				el_card.appendChild(el_cardBody);

				// Only add a card if it actually has stuff in it
				if(el_card.childNodes[1].childNodes[0].childNodes.length != 1){
					document.getElementById("specDisplay").appendChild(el_card);
				}

			}

			for (i_level in courseLevels) {
				levelObj = courseLevels[i_level];

				if(levelObj.levelid.toLowerCase().includes("elective")){
					defaultState = "ignored";
				} else {
					defaultState = "planned";
				}

				for (courseid in levelObj.compulsory) {
					loadCourse(courseid, false, defaultState, false, specID);
				}

				for (i_optionSet in levelObj.optionSets) {
					optionSet = levelObj.optionSets[i_optionSet]
    				for (courseid in optionSet) {
    					loadCourse(courseid, false, defaultState, false, specID);
    				}
				}
			}

		} else {
			isSuccess = scrapeDegree(specID);
		}

		if(isSuccess){

			// If new spec
			if(userData.specs.indexOf(specID) == -1){

				userData.specs.push(specID);
				//console.log(userData.specs);

			}
			if(fromLoadSpec){
				$('#specialisationsTable').append(
					'<tr><td><span onclick="fillSpecDisplay(&#39'+specID+'&#39, false)" class="internal-link">'+specID+'</span></td>'+
					'<td><span class="fa fa-times icon" onclick="removeSpec(&#39'+specID+'&#39)"></span></td></tr>');
			}
		} 

		reactivateTooltips();
	});
}

removeSpecObj = function(removeSpecID) {
	deleteCourses = {};

	for(i in userData.courses){
		course = userData.courses[i];

		if(course.belongsTo.includes(removeSpecID) && course.belongsTo.length == 1){
			deleteCourses[i] = true;
		} else {
			deleteCourses[i] = false;
		}
	}

	// Delete each course
	for (courseID in deleteCourses) {
		if (deleteCourses[courseID] == true) {
			delete userData.courses[courseID];
		} else {
			userData.courses[courseID].belongsTo.splice(removeSpecID, 1);
		}
	}
}

userDataMock = {
	specs : {
		MTRNAH : {
			courseLevels : [
				{
					compulsory : {
						MMAN1300 : {},
						ENGG1000 : {}
					},
					optionSets : [
						{
							MATH1131 : {},
							MATH1141 : {}
						},
						{
							PHYS1121 : {},
							PHYS1131 : {}
						}
					]
				}
			]
		}
	}
}



