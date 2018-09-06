const functions = require('firebase-functions');

var request = require('request');
var cheerio = require('cheerio');

exports.scrapeSpec = functions.firestore.document('degreeScrapeRequests/{specid}').onWrite((change, context) => {
    
    console.log(change.after.data());
    specid = context.params.specid;
    console.log("specid: " + specid);

    doc = {}

    request('https://www.handbook.unsw.edu.au/undergraduate/specialisations/2019/' + specid, function(error, response, html) {
      if (!error && response.statusCode === 200) {
        var $ = cheerio.load(html);

        doc["title"] = $("#subject-intro h2 span").text();
        doc["courseLevels"] = {};

        // Loop through levels
        $('#structure .m-accordion').each( function(i, level){
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

      } else {
        console.error("ERROR with REQUEST. error != null or status != 200");
        console.error(error);
        return null
      }

    }); // End request

    return change.after.ref.set({scrape: doc}, {merge: true});

});

// Test Data
/*
scrapeSpec(
  {
    before: {
      degrees: {
        MECHAH : true
      }
    },
    after: {
      degrees: {
        MECHAH : true
      },
      degreeScrapeRequests: {
        CHEMB1 : {
          time : 10000
        }
      }
    }
  },
  {params: {specid: 'CHEMB1'}}
)
*/
