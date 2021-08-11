const path = require('path');
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const helpers = require('./helpers');
const sqlite3 = require('sqlite3').verbose();

const app = express();
var db = new sqlite3.Database('mydb.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

var returnToPage = "";

app.use('/', express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/docs', express.static(path.join(__dirname, 'documentation')));

app.use(session({secret: 'user_id'}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//--Testing--
const ejs = require('ejs');
app.set('views', path.join(__dirname, 'dist/views'));

// app.set('view engine', 'ejs');
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

app.get('/test', function(req, res) {
  // res.render('index');
  res.render('test.html');
});
//--Testing--

// app.use(express.static(__dirname + '/public'));

const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'uploads/');
	},
    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
    	cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


// app.post('/upload-image', (req, res) => {
//     let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('image');

//     upload(req, res, function(err) {
//         // req.file contains information of uploaded file
//         // req.body contains information of text fields, if there were any

//         if (req.fileValidationError) {
//         	return res.send(req.fileValidationError);
//         }
//         else if (!req.file) {
//         	return res.send('Please select an image to upload');
//         }
//         else if (err instanceof multer.MulterError) {
//         	return res.send(err);
//         }
//         else if (err) {
//         	return res.send(err);
//         }

//         // Display uploaded image for user validation
//         res.send(`You have uploaded this image: <hr/><img src="${req.file.path}" width="500"><hr /><a href="./">Upload another image</a>`);
//     });
// });

app.post('/upload-multiple-images', (req, res) => {
    // 10 is the limit I've defined for number of uploaded files at once
    // 'multiple_images' is the name of our file input field
    let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).array('images', 10);

    upload(req, res, function(err) {
    	if (req.fileValidationError) {
    		return res.send(req.fileValidationError);
    	}
        //else if (...) // The same as when uploading single images
        // else if (!req.file) {
        // 	return res.send('Please select an image to upload');
        // }
        // else if (err instanceof multer.MulterError) {
        // 	return res.send(err);
        // }
        // else if (err) {
        // 	return res.send(err);
        // }

        let result = "You have uploaded these images: <hr />";
        const files = req.files;
        let index, len;

        // Loop through all the uploaded images and display them on frontend
        for (index = 0, len = files.length; index < len; ++index) {
        	result += `<img src="${files[index].path}" width="300" style="margin-right: 20px;">`;
        }
        result += '<hr/><a href="./">Upload more images</a>';
        res.send(result);
    });
});

app.get('/apply_voting', checkUserSession, function(req,res) {
  res.render('apply_voting');
});


app.get('/set_session', function(req,res) {
  // Your code here
  res.render('set_session.html');
});

app.post('/set_session', function(req,res) {
  req.session.user_id = req.body.yourAccount;
  // console.log(req.session.user_id);
  res.redirect(returnToPage);
});

function checkUserSession( req, res, next )
{
    if( req.session.user_id )
    {
        next();
    }
    else
    {
        returnToPage = req.url;
        res.redirect('/set_session');
    }
}//checkUserSession()




	app.set('port', process.env.PORT || 8080);


// eslint-disable-next-line no-unused-vars
const server = app.listen(app.get('port'), () => console.log(`Listening on port ${app.get('port')}...`));

// db.close((err) => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log('Close the database connection.');
// });
