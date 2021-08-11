import './bundle.js'




// import * as FilePond from 'filepond';

// // Create a multi file upload component
// const pond = FilePond.create({
//     multiple: true,
//     name: 'filepond'
// });

// // Add it to the DOM
// document.body.appendChild(pond.element);




// var express = require('express');    //Express Web Server 
// var busboy = require('connect-busboy'); //middleware for form/file upload
// var path = require('path');     //used for file path
// var fs = require('fs-extra');       //File System - for file manipulation

// var app = express();
// app.use(busboy());
// app.use(express.static(path.join(__dirname, 'public')));

// /* ========================================================== 
// Create a Route (/upload) to handle the Form submission 
// (handle POST requests to /upload)
// Express v4  Route definition
// ============================================================ */
// app.route('/upload')
//     .post(function (req, res, next) {

//         var fstream;
//         req.pipe(req.busboy);
//         req.busboy.on('file', function (fieldname, file, filename) {
//             console.log("Uploading: " + filename);

//             //Path where image will be uploaded
//             fstream = fs.createWriteStream(__dirname + '/src/' + filename);
//             file.pipe(fstream);
//             fstream.on('close', function () {    
//                 console.log("Upload Finished of " + filename);              
//                 res.redirect('back');           //where to go next
//             });
//         });
//     });

// var server = app.listen(5000, function() {
//     console.log('Listening on port %d', server.address().port);
// });





// require("regenerator-runtime/runtime"); // babel dependency needed to compile
// const op = require('./sum.js');
// require('../css/main.scss');

// op.multiplyByFour(4)
//   .then((res) => {
//     console.log(op.sum(1, 4));
//     document.body.innerHTML += `sum: ${op.sum(1, 4)} and multiply: ${res}`;
//   });

// console.log(globalHello);