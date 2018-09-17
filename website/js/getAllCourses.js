function getAllCourses() {

  console.log("Downloading timetable home page");

  data = [];
  // courseList = [];

  var myurl = "http://timetable.unsw.edu.au/2018/subjectSearch.html";

  // Bellow only works for testing
  // $.get(url, function(response) {
  $.ajax({
       async: false,
       type: 'GET',
       url: myurl,
       success: function(response) {

  // All Origins - times: 5000,3500,3500,5800,5254,5165,7203,6903
  // $.get('https://allorigins.me/get?method=raw&url=' + encodeURIComponent(url) + '&callback=?', function(response){
    console.log("Scraping " + myurl);  


    // Get schools
    $(response).find('.classSearchMinorHeading').each( function(i_subheading, subheading) {
      if ($(subheading).text() == " Kensington Campus ") {
        $(subheading).parent().next().find('.rowHighlight, .rowLowlight').each( function(i_row, row){
          $(row).find('.data').each( function(i, el) {
            if (i == 0) {
              console.log($(el).text());
              course = []
              school = $(el).next().text();

              // Get schools courses
              // $.get("http://timetable.unsw.edu.au/2018/" + $(el).text() + "KENS.html", function(response2) {
              $.ajax({
                   async: false,
                   type: 'GET',
                   url: "http://timetable.unsw.edu.au/2018/" + $(el).text() + "KENS.html",
                   success: function(response2) {

                $(response2).find('.classSearchMinorHeading').each( function(i_subheading, subheading) {
                  if ($(subheading).text() == " Undergraduate ") {
                    $(subheading).parent().next().find('.rowHighlight, .rowLowlight').each( function(i_courserow, courserow){
                      $(courserow).find('.data').each( function(i, el) {
                        if (i == 0) {
                          console.log($(el).text());
                          course.push($(el).text() + ' - ' + $(el).next().text());
                          courseList.push({
                            name : $(el).text() + ' - ' + $(el).next().text(),
                            category : school
                          })
                        }
                      });
                    });
                  }
                });
              }});

              data.push(course);
            }
          });
        });
      } else {
        console.log($(subheading).text());
      }
    })

    // db.doc("degrees/" + specid).set(doc, { merge: true })
    // .then(function() {
    //   console.log("document uploaded");
    // })

  }}) // End request
  .done( function() {
    console.log(data)
    console.log(courseList);
    return courseList;
  })
  .fail( function(error) {
    console.log("ERROR degreeScraper. Unreachable url");
    console.error(error);
  });

};
