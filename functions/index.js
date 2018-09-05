const functions = require('firebase-functions');

var request = require('request');
var cheerio = require('cheerio');

exports.myFunctionName = functions.firestore.document('courses/requests').onWrite((change, context) => {
    console.log(change.after.data());

    request('https://www.handbook.unsw.edu.au/undergraduate/specialisations/2019/mtrnah', function (error, response, html) {
      if (!error && response.statusCode === 200) {
        var $ = cheerio.load(html);

        data = {}

        // Loop through levels
        $('#structure .m-accordion').each(function(i, level){
          levelid = $(level).prev().text().trim();
          console.log(levelid);
          data[levelid] = {}
          data[levelid]["compulsory"] = {};
          data[levelid]["optionSets"] = [];

          // Loop through each sub level (compulsory then options)
          $(level).find('.o-course-list').each( (i, sublevel) => {
            if (i == 0) {
              // Compulsory : first sublevel

              $(sublevel).find('span.align-left').each( (i, course) => {
                courseid = $(course).text();
                courseLongname = $(course).parent().next().text().trim();
                data[levelid]["compulsory"][courseid] = courseLongname;
              });
            } else {
              // Options : >= 2nd sublevel

              optionSetData = {}; // For some reason "data[levelid]["optionSets"][i-1][courseid] = courseLongname" didn't work but this way does.

              $(sublevel).find('span.align-left').each( (i, course) => {
                courseid = $(course).text();
                courseLongname = $(course).parent().next().text().trim();
                optionSetData[courseid] = courseLongname;
              });

              data[levelid]["optionSets"][i-1] = optionSetData; // needs to shift i by -1 because of the compulsory sublevel

            }
           
          }); // End sublevel loop
         
        }); // End level loop

        console.log(data);

      } else {
        console.log(error);
      }

    }); // End request

    return 1
});

