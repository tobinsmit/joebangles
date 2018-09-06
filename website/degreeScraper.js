function scrapeDegree(specid) {

  console.log("retrieving specid: " + specid);

  doc = {}

  var url = "https://www.handbook.unsw.edu.au/undergraduate/specialisations/2019/" + specid;

  $.get(url, function(response) {

    doc["longname"] = $(response).find("#subject-intro h2 span").text();
    doc["courseLevels"] = {};

    // Loop through levels
    $(response).find('#structure .m-accordion').each( function(i, level){
      levelid = $(level).prev().text().trim();
      doc["courseLevels"][levelid] = {}
      doc["courseLevels"][levelid]["compulsory"] = {};
      doc["courseLevels"][levelid]["optionSets"] = [];

      // Loop through each sub level (compulsory then options)
      $(level).find('.o-course-list').each( function(i, sublevel) {
        if (i === 0) {
          // Compulsory : first sublevel

          $(sublevel).find('span.align-left').each( function(i, course) {
            courseid = $(course).text();
            courseLongname = $(course).parent().next().text().trim();
            doc["courseLevels"][levelid]["compulsory"][courseid] = {"longname" : courseLongname};
          });
        } else {
          // Options : >= 2nd sublevel

          optionSetData = {}; // For some reason "doc["courseLevels"][levelid]["optionSets"][i-1][courseid] = courseLongname" didn't work but this way does.

          $(sublevel).find('span.align-left').each( (i, course) => {
            courseid = $(course).text();
            courseLongname = $(course).parent().next().text().trim();
            optionSetData[courseid] = {"longname" : courseLongname};
          });

          doc["courseLevels"][levelid]["optionSets"][i-1] = optionSetData; // needs to shift i by -1 because of the compulsory sublevel

        }
       
      }); // End sublevel loop
     
    }); // End level loop

    console.log(doc);

  }) // End request
  .fail( function(error) {
    console.log("ERROR degreeScraper. Invalid url");
    console.error(error);
  });
};

$('#tester').on('click', function() {
  var specid = document.getElementById("specialisation").value;
  scrapeDegree(specid);
});
