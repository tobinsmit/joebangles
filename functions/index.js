const functions = require('firebase-functions');

var request = require('request');
var cheerio = require('cheerio');

exports.myFunctionName = functions.firestore.document('courses/requests').onWrite((change, context) => {
    console.log(change.after.data());

    request('https://www.handbook.unsw.edu.au/undergraduate/specialisations/2019/mtrnah', function (error, response, html) {
      if (!error && response.statusCode === 200) {
        var $ = cheerio.load(html);

        // Loop through levels
        $('#structure .m-accordion').each(function(i, level){
          title = $(level).prev().text().trim();
          console.log(title);
          });
        });
      } else {
        console.log(error);
      }
    });

    return 1
});

