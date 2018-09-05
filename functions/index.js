const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
var request = require('request');
var cheerio = require('cheerio');

exports.myFunctionName = functions.firestore.document('courses/requests').onWrite((change, context) => {
    // ... Your code here
    console.log(change.after.data());
    request('https://www.handbook.unsw.edu.au/undergraduate/specialisations/2019/mtrnah', function (error, response, html) {
      if (!error && response.statusCode === 200) {
        var $ = cheerio.load(html);
        $('#structure > div > .a-card').each(function(i, element){
          // var a = $(this).prev();
          console.log(this);
          console.log($(this).html);
          console.log($(this).text);
        });
      } else {
        console.log(error);
      }
    });

});


// require("jsdom").env("", function(err, window) {
//     if (err) {
//         console.error(err);
//         return;
//     }
 
//     var $ = require("jquery")(window);
// });

