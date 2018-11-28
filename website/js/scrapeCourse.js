/**
 * Scrapes a given course - all variables but courseid are just passing through the function
 * @param {string} courseid The course to be scraped ie MATH1131
 * @param {boolean} isSpecial True if this function is being called from the load special course field
 * @param {string} defaultState The default state (ie completed, planned, ignored) that will be set
 * @param {boolean} addToSpecialCourseTable True if this is a course being loaded for the first time
 */
function scrapeCourse(courseid, isSpecial, defaultState, addToSpecialCourseTable) {

  // Update Progress
  console.log("Attempting to scrape: " + courseid);
  updateCourseProgressBanner("Downloading handbook page");

  // Attempt to find the course in the undergraduate handbook
  scrapeCourseURL(courseid, 'undergraduate', isSpecial, defaultState, addToSpecialCourseTable);

};

/**
 * Scrapes a given course in a specific handbook - all variables but courseid are just passing through the function
 * @param {string} courseid The course to be scraped ie MATH1131
 * @param {string} level The level to scape at ie undergraduate or postgraduate
 * @param {boolean} isSpecial True if this function is being called from the load special course field
 * @param {string} defaultState The default state (ie completed, planned, ignored) that will be set
 * @param {boolean} addToSpecialCourseTable True if this is a course being loaded for the first time
 */
function scrapeCourseURL(courseid, level, isSpecial, defaultState, addToSpecialCourseTable){

  // Initalize object to hold all of the course information
  newDoc = {};

  // Set url to be scraped
  var url = "https://www.handbook.unsw.edu.au/" + level + "/courses/2019/" + courseid;

  // Bellow only works for testing
  // $.get(url, function(response) {

  // All Origins - times: 5000,3500,3500,5800,5254,5165,7203,6903
  // Get the url
  $.get('https://allorigins.me/get?method=raw&url=' + encodeURIComponent(url) + '&callback=?', function(response){

    // Update progress
    console.log("Scraping: " + url);  
    updateCourseProgressBanner("Scraping data");  

    // Initalize the fields of doc
    newDoc["longname"] = $(response).find("#subject-intro h2 span").text();
    newDoc["prereqs"] = [];
    newDoc["terms"] = [];

    // Check that the page scraped is actually a course page, if not:
    if (newDoc["longname"] === "") {

      // If postgraduate hasnt been scraped yet, then try scraping it and then end this function
      if(level != 'postgraduate'){
        scrapeCourseURL(courseid, 'postgraduate', isSpecial, defaultState, addToSpecialCourseTable);
        return;

      // If postgraduate has been scraped, end
      } else {

        // Update progress
        console.log("No title found in"+url+". Assumed error page");
        updateCourseProgressBanner("Page not found", "text-danger");
        return;

      }
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

    // Add timestamp and version control
    newDoc.lastUpdate = Date.now();

    db.doc("courses/" + courseid).get().then(oldDoc => {
      if (oldDoc.exists) {

        // Check is docs are different and add previous version to array
        if (!areDocsSame(oldDoc.data(), newDoc)) {
          if (oldDoc.data().previousVersions == null) {
            newDoc.previousVersions = [];
          } else {
            newDoc.previousVersions = oldDoc.data().previousVersions;
          }
          newDoc.previousVersions.push(oldDoc.data());
        }
 
        if (newDoc.prereqs[0] != null && oldDoc.data().prereqs[0] != null && newDoc.prereqs[0].exp == oldDoc.data().prereqs[0].exp) {
          newDoc.hasValidExp = oldDoc.data().hasValidExp;
        } else if (newDoc.prereqs[0] == null && oldDoc.data().prereqs[0] == null) {
          newDoc.hasValidExp = oldDoc.data().hasValidExp;
        } else {
          newDoc.hasValidExp = false;
        }
      }

      // Log the information pulled
      console.log("newDoc", newDoc);

      // Upload the document to the database
      db.doc("courses/" + courseid).set(newDoc, { merge: true })
      .then(function() {

        // Update progress
        console.log("document uploaded");
        updateCourseProgressBanner("Success", "text-success");

        // Load the course into the session and end
        loadCourse(courseid, isSpecial, defaultState, addToSpecialCourseTable);
        return true;

      })

    })

  }) // End request

  // Error catch
  .fail( function(error) {

    // Update progress
    console.log("ERROR degreeScraper. Unreachable url");
    console.error(error);
    
  });

}

function areDocsSame(a, b) {
  if (a.longname != b.longname) return false;
  if ((a.prereqs == null && b.prereqs != null) || (a.prereqs != null && b.prereqs == null)) return false;
  if (a.prereqs != null && b.prereqs != null && a.prereqs[0] != null && b.prereqs[0] != null && a.prereqs[0].label != b.prereqs[0].label) return false;
  if ((a.terms == null && b.terms != null) || (a.terms != null && b.terms == null)) return false;
  if (a.terms != null && b.terms != null && a.terms[0] != null && b.terms[0] != null && a.terms[0].label != b.terms[0].label) return false;
  return true;
}

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

/**
 * Updates the text and style in the course progress banner
 * @param {string} message The message to be displayed
 * @param {string} addClass The class to style the message with
 */
function updateCourseProgressBanner(message, addClass) {
  $("#courseProgressBanner").html("<small class='mb-1 " + addClass + "'>" + message + "</small>");
}
