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
	return string
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
			loadUIFromJSON(thisCookie);
		} else {
			console.log('not match');
		}
	}
};

// Loads state from a json object
loadUIFromJSON = function(data) {
	console.log("loadUIFromJSON", data)
	userData = data;

	// Load specs for specTable

	// Load special courses

	// Load courses to DragDrop
	loadDragDropWithState(userData.courses);
}

refresh = function() {
	writeCookie();
	readCookie();
}

// Load cookie when page is ready
$(document).ready(function(){
	readCookie();
	reactivateTooltips();
});

//Save cookie on page unload
$(window).on('unload', function() {
	writeCookie();
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
		'<td><span class="fa fa-times icon" onclick="removeSpec(&#39'+specID+'&#39)"></span></td></tr>');

		fillSpecDisplay(specID);

	} 

	// If existing spec
	else {

		fillSpecDisplay(specID);

	}

}

// addSpecialCourse Click
$('#addCourse').on('click', function() {
	
	courseid = $('#courseAddInput').val().substring(0,8);
	courselongname = $('#courseAddInput').val().substring(11);

	// Empty text field
	$('#courseAddInput').val("");

	loadSpecialCourse(courseid, courselongname);

});

// Add a special course
function loadSpecialCourse(courseID, longname){

	if(typeof userData.courses["'"+courseID+"'"] === 'undefined'){

		$('#coursesTable').append(
			'<tr><td>'+
				'<span id="'+courseid+'_c" class="fa fa-check icon"></span>&ensp;'+
           		'<span id="'+courseid+'_p" class="far fa-calendar-alt icon"></span>&ensp;'+
          		'<span id="'+courseid+'_i" class="fa fa-ban icon"></span>'+
			'</td>'+
			'<td class="degreeCourses-nameTF">'+courseid+' - '+longname+'</td>'+
			'<td>'+
				'<div class="btn-group-toggle btn-group" data-toggle="buttons" role="group">'+
					'<button id="'+courseid+'_1" type="button" class="btn btn-outline-secondary term-btn">1</button>'+
					'<button id="'+courseid+'_2" type="button" class="btn btn-outline-secondary term-btn">2</button>'+
					'<button id="'+courseid+'_3" type="button" class="btn btn-outline-secondary term-btn">3</button>'+
					'<button id="'+courseid+'_4" type="button" class="btn btn-outline-secondary term-btn">Sum.</button>'+
				'</div>'+
			'</td></tr>');

		loadCourse(courseID);
	}
}

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
	delete userData.courses["'"+courseID+"'"];
}

// Loads (but does NOT display) a given courseID
function loadCourse(courseID){

	// If course **IS NOT** in userData
	if(typeof userData.courses["'"+courseID+"'"] === 'undefined'){

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

				loadCourse(courseID);

			} else {

				scrapeCourse(courseID);

			}
		});

	// If course **IS** in userData
	} else {

		setStatusIcon(courseID, userData.courses["'"+courseID+"'"].state);
		setTerms(courseID);

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

$(document).on('click', '.icon', function(){

	courseID = $(this).attr('id').substring(0,8);

	if($(this).hasClass("fa-check")){
		setStatusIcon(courseID, "completed");
		userData.courses["'"+courseID+"'"].state = "completed";
	} else if($(this).hasClass("fa-calendar-alt")){
		setStatusIcon(courseID, "planned");
		userData.courses["'"+courseID+"'"].state = "planned";
	} else if($(this).hasClass("fa-ban")){
		setStatusIcon(courseID, "ignored");
		userData.courses["'"+courseID+"'"].state = "ignored";
	}

});

function setStatusIcon(courseID, state){

	var p = $('#'+courseID+'_p');
	var c = $('#'+courseID+'_c');
	var i = $('#'+courseID+'_i');

	if(p.attr('class').startsWith('s')){

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

		var elList = $('.'+p.attr('class').substring(0,4));

		for(var j=2; j < elList.length+2; j+=3){
			var id = $(elList[j]).attr('id').substring(0,8);
			if(id != courseID){
				$('#'+id+'_p').removeClass("calendar-active");
				$('#'+id+'_c').removeClass("check-active");
				$('#'+id+'_i').addClass("ban-active");
				
				if(typeof userData.courses["'"+id+"'"] !== 'undefined'){
					userData.courses["'"+id+"'"].state = "ignored";
				}
			}
		}

		console.log(userData.courses);

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
         		   		'<td style="width:80px;"></td>'+
         		   		'<td><b>Course</b></td>'+
           			 	'<td style="width:165px;"><b>2019 Terms</b></td>'+
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
								'<span id="'+courseid+'_c" class="set'+i_optionSet+' fa fa-check icon"></span>&ensp;'+
           						'<span id="'+courseid+'_p" class="set'+i_optionSet+' far fa-calendar-alt icon"></span>&ensp;'+
          						'<span id="'+courseid+'_i" class="set'+i_optionSet+' fa fa-ban icon"></span>'+
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
				document.getElementById("specDisplay").appendChild(el_card);

			}

			for (i_level in courseLevels) {
				levelObj = courseLevels[i_level];

				for (courseid in levelObj.compulsory) {
					loadCourse(courseid);
				}

				for (i_optionSet in levelObj.optionSets) {
					optionSet = levelObj.optionSets[i_optionSet]
    				for (courseid in optionSet) {
    					loadCourse(courseid);
    				}
				}
			}

		} else {
			scrapeDegree(specID);
		}
	});
}

