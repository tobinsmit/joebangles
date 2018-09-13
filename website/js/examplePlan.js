examplePlan = {
	completedCourses : {
		"ENGG1000" : {
			longname : "Engineering Design",
			terms : []
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
			availableTerms : ["Summer Term", "Term 1", "Term 2", "Term 3"]
			chosenTerm : ["Term 1"]
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
			prerep : "MATH1231 + MATH1241 + MATH1251"
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
