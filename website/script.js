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
	spec = document.getElementById("specialisation").value;
	console.log("HMU spec:", spec);

	// Clear div
	degreeCourses = document.getElementById('degreeCourses');
	degreeCourses.innerHTML = "";

	// Get degree doc
	db.doc("degrees/" + spec).onSnapshot(doc => {

		courseLevels = doc.data().courseLevels;

		// For each level
		for (levelid in courseLevels) {
			levelObj = courseLevels[levelid];

			// Create div
			levelDiv = document.createElement("div")
        	title = document.createElement("h4")
        	title.innerHTML = levelid;
        	levelDiv.appendChild(title);

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
		        		label.className = "custom-control-label";
		        		label.htmlFor = courseid;
		        		label.innerHTML = courseid + ' - ' + courseObj.longname;
		        		courseDiv.appendChild(label);
	        		levelDiv.appendChild(courseDiv);
			}

			// For each set of options
			for (optionSetIndex in levelObj.options) {
				optionSet = levelObj.options[optionSetIndex]

				// Create div
        		optionDiv = document.createElement("div");

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
			        		radio.name = levelid + " " + optionSetIndex
			        		courseDiv.appendChild(radio);
		        		label = document.createElement("label");
			        		label.className = "custom-control-label";
			        		label.htmlFor = courseid;
			        		label.innerHTML = courseid;
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

    });
})
