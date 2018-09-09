function scrapeDegree(specid) {

  console.log("requesting website. specid: " + specid);
  updateSpecProgressBanner("Downloading handbook page");

  doc = {}

  var url = "https://www.handbook.unsw.edu.au/undergraduate/specialisations/2019/" + specid;

  // Bellow only works for testing
  // $.get(url, function(response) {

  // All Origins - times: 5000,3500,3500,5800,5254,5165,7203,6903
  $.get('https://allorigins.me/get?method=raw&url=' + encodeURIComponent(url) + '&callback=?', function(response){
    console.log("Scraping " + url);  
    updateSpecProgressBanner("Scraping data");  

    doc["longname"] = $(response).find("#subject-intro h2 span").text();
    doc["courseLevels"] = [];

    if (doc["longname"] === "") {
      console.log("No title found. Assumed error page");
      updateSpecProgressBanner("Page not found on the handbook", "text-danger");
      return
    }

    // Loop through levels
    $(response).find('#structure .m-accordion').each( function(i_level, level){
      levelid = $(level).prev().text().trim();
      doc["courseLevels"][i_level] = {}
      doc["courseLevels"][i_level]["levelid"] = levelid;
      doc["courseLevels"][i_level]["compulsory"] = {};
      doc["courseLevels"][i_level]["optionSets"] = [];

      // Loop through each sub level (compulsory then options)
      $(level).find('.o-course-list').each( function(i_sublevel, sublevel) {
        if (i_sublevel === 0) {
          // Compulsory : first sublevel

          $(sublevel).find('span.align-left').each( function(i_course, course) {
            courseid = $(course).text();
            courseLongname = $(course).parent().next().text().trim();
            doc["courseLevels"][i_level]["compulsory"][courseid] = {"longname" : courseLongname};
          });
        } else {
          // Options : >= 2nd sublevel

          optionSetData = {}; // For some reason "doc["courseLevels"][i_level]["optionSets"][i_sublevel-1][courseid] = courseLongname" didn't work but this way does.

          $(sublevel).find('span.align-left').each( (i_course, course) => {
            courseid = $(course).text();
            courseLongname = $(course).parent().next().text().trim();
            optionSetData[courseid] = {"longname" : courseLongname};
          });

          doc["courseLevels"][i_level]["optionSets"][i_sublevel-1] = optionSetData; // needs to shift i_sublevel by -1 because of the compulsory sublevel

        }
       
      }); // End sublevel loop
     
    }); // End level loop

    console.log(doc);

    db.doc("degrees/" + specid).set(doc, { merge: true })
    .then(function() {
      console.log("document uploaded");
    })

  }) // End request
  .fail( function(error) {
    console.log("ERROR degreeScraper. Unreachable url");
    console.error(error);
  });

};

function updateSpecProgressBanner(message, addClass) {
  $("#specProgressBanner").html("<p class='" + addClass + "'>" + message + "</p>");
}