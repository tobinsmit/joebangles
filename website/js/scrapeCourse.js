function scrapeCourse(courseid, isSpecial, defaultState, addToSpecialCourseTable) {

  console.log("requesting website. courseid: " + courseid);
  updateCourseProgressBanner("Downloading handbook page");

  newDoc = {}

  var url = "https://www.handbook.unsw.edu.au/undergraduate/courses/2019/" + courseid;

  // Bellow only works for testing
  // $.get(url, function(response) {

  // All Origins - times: 5000,3500,3500,5800,5254,5165,7203,6903
  $.get('https://allorigins.me/get?method=raw&url=' + encodeURIComponent(url) + '&callback=?', function(response){
    console.log("Scraping " + url);  
    updateCourseProgressBanner("Scraping data");  

    newDoc["longname"] = $(response).find("#subject-intro h2 span").text();
    newDoc["prereqs"] = [];
    newDoc["terms"] = [];

    if (newDoc["longname"] === "") {
      console.log("No title found. Assumed error page");
      updateCourseProgressBanner("Page not found on the handbook", "text-danger");
      return
    }


    // Loop through prereq elements
    $(response).find('#readMoreSubjectConditions > div > div').each( function(i_prereqEl, prereqEl){
      label = $(prereqEl).text();
      console.log("Text in prereq label:", label);
      if (/pre[-]?req(uisite)?[s]?[:;]?[ ]?/i.exec(label)) {
        prereqExp = cleanPrereqExp(label);
        coursePattern = /\b[A-Z]{4}[0-9]{4}\b/g;
        courses = [];
        var match;
        while((match = coursePattern.exec(prereqExp)) !== null) {
          courses.push(match[0]);
        }
        console.log(courses);
        newDoc["prereqs"].push({
          label : label,
          exp : prereqExp,
          courses : courses
        });
      }
    });


    // Loop through side boxes for offered terms
    $(response).find('.hide-lg .a-column-md-6 .o-attributes-table-item p').each( function(i_sideBox, sideBox){
      label = $(sideBox).text();
      console.log("Text in side box:", label);
      termPattern = /\b(Summer )?Term( )?[0-3]?/g;
      terms = [];
      var match;
      while((match = termPattern.exec(label)) !== null) {
        terms.push(match[0]);
      }
      if (terms.length > 0) {
        console.log(terms);
        newDoc["terms"].push({
          label : label,
          terms : terms
        });
      }
    });
    newDoc.lastUpdate = Date.now();

    console.log(newDoc);

    db.doc("courses/" + courseid).get().then(oldDoc => {

    })

    db.doc("courses/" + courseid).set(newDoc, { merge: true })
    .then(function() {
      console.log("document uploaded");
      updateCourseProgressBanner("Success", "text-success");
      loadCourse(courseid, isSpecial, defaultState, addToSpecialCourseTable);
    })

  }) // End request
  .fail( function(error) {
    console.log("ERROR degreeScraper. Unreachable url");
    console.error(error);
  });

};

function cleanPrereqExp(exp) {
  console.log('cleanPrereqExp input:',exp)
  exp = exp.replace(/[pP]re[-]?[rR]eq(uisite)?[s]?[:;]/g, '')  // clear prereq label
  exp = exp.replace(/[:;].*/g, '')                             // clear anything after another : or ;
  exp = exp.replace(/CR[^a-zA-Z]/g,'')                            // clear /CR/ (eg MATH1231)
  exp = exp.replace(/[oO][rR]/g,'+')                           // or -> +
  exp = exp.replace(/[aA][nN][dD]/g,'*')                       // and -> *
  exp = exp.replace(/[^\(\)\+\* a-zA-Z0-9]/g,'')                  // clear everything but (, ), +, *, space, cap letters, digits
  exp = exp.replace(/[a-zA-Z](?![a-zA-Z]{0,3}[0-9]{2})/g,'')             // clear cap letters that arent followed by 4 digits
  exp = exp.replace(/[^0-9][0-9]{1,3}(?![0-9])/g,'')           // clear 1-3 digits numbers
  exp = exp.replace(/[^0-9][0-9]{5,}(?![0-9])/g,'')            // clear >=5 digits numbers
  // exp = exp.replace(/[^A-Z][0-9]{4}/g,'')                   // clear 4 digits numbers that dont have 4 letters before
  exp = exp.replace(/ /g,'')                                   // clear spaces
  console.log('cleanPrereqExp output:',exp)
  return exp
}


function updateCourseProgressBanner(message, addClass) {
  $("#courseProgressBanner").html("<small class='mb-1 " + addClass + "'>" + message + "</small>");
}

