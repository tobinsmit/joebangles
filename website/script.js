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

// Upload document with random id
// db.collection("users").add({
//     first: "Ada",
//     last: "Lovelace",
//     born: 1815
// })
// .then(function(docRef) {
//     console.log("Document written with ID: ", docRef.id);
// })
// .catch(function(error) {
//     console.error("Error adding document: ", error);
// });

// Read document once
// db.collection("pages").doc("front").onSnapshot(function(doc) {
//     if (doc.exists) {
//         console.log("Document data:", doc.data());
//         console.log("title:", doc.data().title);
//         document.getElementById("title").innerHTML = doc.data().title;
//     } else {
//         // doc.data() will be undefined in this case
//         console.log("No such document!");
//     }
// }).catch(function(error) {
//     console.log("Error getting document:", error);
// });

// db.collection("degrees").doc("MTRNAH").getCollections().then(collections => {
//   for (let collection of collections) {
//     console.log('Found collection with id: ${collection.id}');
//   }
// });

$('#HMU').on('click', function() {
	spec = document.getElementById("specialisation").value;
	console.log("HMU spec:", spec);
	levelsDiv = document.getElementById('levels');
	levelsDiv.innerHTML = "";

	// Get levels coll
	db.doc("degrees/" + spec).onSnapshot(doc => {

		courseLevels = doc.data().courseLevels;
		// console.log(courseLevels);

		for (levelid in courseLevels) {
			// console.log(levelid);
			levelObj = courseLevels[levelid];
			// console.log(levelObj);

			levelDiv = document.createElement("div")
        	title = document.createElement("h4")
        	title.innerHTML = levelid;
        	levelDiv.appendChild(title);

			// For each compulsory course
			for (courseid in levelObj.compulsory) {
				// console.log(courseid);
				courseObj = levelObj.compulsory[courseid];

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
				console.log(optionSet)

        		optionDiv = document.createElement("div");
        		// optionDiv.className = "";

        		for (courseid in optionSet) {
        			courseObj = optionSet[courseid];

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

    		hr = document.createElement("hr");
    		levelDiv.appendChild(hr);
    		levels.appendChild(levelDiv);

		}



			// const level = doc.id;
			// console.log(level);

			// levelDiv = document.createElement("div")
			// levelDiv.id = level;
   //      	title = document.createElement("h4")
   //      	title.innerHTML = level;
   //      	levelDiv.appendChild(title);


			// // Get compulsory coll
			// db.collection("degrees/" + spec + "/courseLevels/" + level + "/compulsory").get().then(coll => {
			// 	// For each compulsory doc
			// 	coll.forEach(doc => {
			// 		courseid = doc.id;
			// 		console.log("compulsory:", doc.data(), doc.id, level)

	  //       		courseDiv = document.createElement("div");
	  //       		courseDiv.className = "custom-control custom-checkbox";
	  //       		checkbox = document.createElement("input");
	  //       		checkbox.type = "checkbox";
	  //       		checkbox.className = "custom-control-input";
	  //       		checkbox.id = courseid;
	  //       		courseDiv.appendChild(checkbox);
	  //       		label = document.createElement("label");
	  //       		label.className = "custom-control-label";
	  //       		label.htmlFor = courseid;
	  //       		label.innerHTML = "Compulsory:" + courseid + level;
	  //       		courseDiv.appendChild(label);
	  //       		levelDiv.appendChild(courseDiv);
			// 	});
			// });




	  //       courses = doc.data();
	  //       console.log(courses);


   //      	console.log("level:", level);
   //      	for (course in courses) {
   //      		console.log("course:", course);
   //      		courseDiv = document.createElement("div");
   //      		courseDiv.className = "custom-control custom-checkbox";
   //      		checkbox = document.createElement("input");
   //      		checkbox.type = "checkbox";
   //      		checkbox.className = "custom-control-input";
   //      		checkbox.id = course;
   //      		courseDiv.appendChild(checkbox);
   //      		label = document.createElement("label");
   //      		label.className = "custom-control-label";
   //      		label.htmlFor = course;
   //      		label.innerHTML = course;
   //      		courseDiv.appendChild(label);
   //      		levelDiv.appendChild(courseDiv);
   //      	}
   //  		hr = document.createElement("hr");
   //  		levelDiv.appendChild(hr);
   //  		levels.appendChild(levelDiv);
    });
})
