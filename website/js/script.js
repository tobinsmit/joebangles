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

// Dismiss warning
db.settings({ timestampsInSnapshots: true });


// HMU Click
$('#HMU').on('click', function() {
	// Get specialistation
	specid = document.getElementById("specialisation").value;
	console.log("HMU spec:", specid);

	// Get degree doc
	updateSpecProgressBanner("Checking database");
	db.doc("degrees/" + specid).onSnapshot(doc => {
		if (doc.exists) {
			console.log("doc found");
			updateSpecProgressBanner("Loaded specialistation", "text-success");
			fillDegreeCourses(doc.data());
		} else {
			console.log("doc not found");
			scrapeDegree(specid);
		}
		
	});
});


$("#tester").on("click", function() {
	// Get course
	courseid = document.getElementById("course").value;
	console.log("tester courseid:", courseid);

	// Get course doc
	updateCourseProgressBanner("Checking database");
	db.doc("courses/" + courseid).onSnapshot(doc => {
		if (doc.exists) {
			console.log("doc found");
			updateCourseProgressBanner("Loaded course doc", "text-success");
			// add doc.data()
		} else {
			console.log("doc not found");
			scrapeCourse(courseid);
		}
		
	});
});


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
}


