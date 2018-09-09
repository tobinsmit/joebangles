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
var longName;
var spedid;
var specList = [];

// Dismiss warning
db.settings({ timestampsInSnapshots: true });


// addSpec Click
$('#addSpec').on('click', function() {
	// Get specialistation
	specid = document.getElementById("specialisationTF").value;

	// Get degree doc
	db.doc("degrees/" + specid).onSnapshot(doc => {
		if (doc.exists) {
			longName = fillDegreeCourses(doc.data());
		} else {
			longName = scrapeDegree(specid);
		}

		// Add this spec to the list of specs added
		specList.push(specid);

		// If this is the first spec added, print the title for the table
		if(specList.length == 1){
			$('#specialisationsTable').append(

			'<tr><td><b>Specialisations Added</b></td>');
		}

		// Add a row to the 'Specialisations Added' Table
		$('#specialisationsTable').append(

		'<tr><td>'+specid+' - '+longName+'</td>'+
		'<td><span class="fa fa-times" style="cursor:pointer" onclick="removeSpec(&#39'+specid+'&#39)"></span></td></tr>');
		
	})
	
});

// Removes the spec at index 'index' from the specList array
function removeSpec(specID) {

	var table = document.getElementById('specialisationsTable');

	if(table.childNodes.length == 2){
		table.removeChild(table.childNodes[1]);
		table.removeChild(table.childNodes[0]);
	} else {
		table.removeChild(table.childNodes[specList.indexOf(specID)+1]);
	}

	specList.splice(specList.indexOf(specID), 1);
}

// Fill the div #degreeCourses with course levels, levels, compulsory subs (checkbox) and option sets (radio)
function fillDegreeCourses(data) {

	// Clear div
	degreeCourses = document.getElementById('degreeCourses');
	degreeCourses.innerHTML = "";

	degreeTitle = document.createElement("h2")
	degreeTitle.innerHTML = data.longname;
	degreeTitle.className = "pt-5 pb-3";
	degreeCourses.appendChild(degreeTitle);

	courseLevels = data.courseLevels;

	// For each level
	for (i_level in courseLevels) {
		levelObj = courseLevels[i_level];
		levelid = levelObj.levelid;

		// Create div
		levelDiv = document.createElement("div")
    	levelTitle = document.createElement("h4")
    	levelTitle.innerHTML = levelid;
    	levelDiv.appendChild(levelTitle);

		// For each compulsory course
		for (courseid in levelObj.compulsory) {
			courseObj = levelObj.compulsory[courseid];

			// Add course div with checkbox
    		courseDiv = document.createElement("div");
        		courseDiv.className = "custom-control custom-checkbox";
        		checkbox = document.createElement("input");
	        		checkbox.type = "checkbox";
	        		checkbox.className = "custom-control-input";
	        		checkbox.id = courseid;
	        		courseDiv.appendChild(checkbox);
        		label = document.createElement("label");
	        		label.className = "custom-control-label active";
	        		label.htmlFor = courseid;
	        		label.innerHTML = courseid + ' - ' + courseObj.longname;
	        		courseDiv.appendChild(label);
        		levelDiv.appendChild(courseDiv);
		}

		// For each set of options
		for (i_optionSet in levelObj.optionSets) {
			optionSet = levelObj.optionSets[i_optionSet]

			// Create div
    		optionDiv = document.createElement("div");

    		// If first optionSet, insert br
    		if (i_optionSet == 0) {
    			br = document.createElement("br");
    			optionDiv.appendChild(br);
    		}

    		// For each course in each set of options
    		for (courseid in optionSet) {
    			courseObj = optionSet[courseid];

    			// Create course div with radio. Radios are linked for each option set.
    			courseDiv = document.createElement("div");
        			courseDiv.className = "custom-control custom-radio custom-control-inline";
	        		radio = document.createElement("input");
		        		radio.type = "radio";
		        		radio.className = "custom-control-input";
		        		radio.id = courseid;
		        		radio.name = levelid + " " + i_optionSet
		        		courseDiv.appendChild(radio);
	        		label = document.createElement("label");
		        		label.className = "custom-control-label";
		        		label.htmlFor = courseid;
		        		label.innerHTML = courseid + ' - ' + courseObj.longname;
		        		courseDiv.appendChild(label);
	        		optionDiv.appendChild(courseDiv);

    		}

    		levelDiv.appendChild(optionDiv);
		}

		// Add divider
		hr = document.createElement("hr");
		levelDiv.appendChild(hr);

		degreeCourses.appendChild(levelDiv);

	}
	return data.longname;
}


