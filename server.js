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

app.get('/', function(req, res) {
  // res.render('index');
  returnToPage = '/apply_voting';
  res.redirect('/apply_voting');
});

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


app.post('/upload-multiple-images', (req, res) => {
    // 10 is the limit I've defined for number of uploaded files at once
    // 'multiple_images' is the name of our file input field
    var user_id = req.session.user_id;
    let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).array('images', 10);

    upload(req, res, function(err) {
    	if (req.fileValidationError) {
    		return res.send(req.fileValidationError);
    	}

        let result = "You have uploaded these images: <hr />";
        const files = req.files;
        let index, len;

        // Loop through all the uploaded images and display them on frontend
        for (index = 0, len = files.length; index < len; ++index) {
        	result += `<img src="${files[index].path}" width="300" style="margin-right: 20px;">`;
        }

        db.serialize(function() {
            var tableName = req.session.user_id.substring(1);
            db.run("CREATE TABLE if not exists "+tableName+" (info TEXT)");
            var stmt = db.prepare("INSERT INTO "+tableName+" VALUES (?)");
            for (index = 0, len = files.length; index < len; ++index) {
                stmt.run(files[index].path);
            }
            stmt.finalize();
        });
        result += '<hr/><a href="./">Upload more images</a>';
        res.send(result);
    });
});

app.get('/apply_voting', checkUserSession, function(req,res) {
    var result = `<b>Images</b><br>`;
    var tableName = req.session.user_id.substring(1);

    // var tableExists = false;
    // db.get("SELECT count(*) as exist FROM sqlite_master WHERE type='table' AND name='testing';", function(err, row) {
    //     console.log("ex=",row.exist);
    //     tableExists = row.exist;
    // });
    db.serialize(function() {
    db.run("CREATE TABLE if not exists "+tableName+" (info TEXT)");
    db.all("SELECT info FROM "+tableName, [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
        console.log(row.info);
        result += `<a href="${row.info}"><img src="${row.info}" width="300" style="margin-right: 20px;"></a>`;
        });
        console.log(result);
        res.render('apply_voting',{
            account:req.session.user_id,
            images:result
        });
    });
    });
});


app.get('/vote', checkUserSession, function(req,res) {
    var result = `<b>Images</b><br>`;
    var canidateAddress = req.query.canidateAddress;
    console.log("vt=",req.query.canidateAddress);  
    res.render('vote',{
        account:req.session.user_id,
        images:result,
        canidateAddress:canidateAddress
    });
});

app.get('/create_crowd_funding', checkUserSession, function(req,res) {  
    res.render('create_crowd_funding',{
        account:req.session.user_id
    });
});

app.get('/all_crowd_fundings', checkUserSession, function(req,res) {  
    res.render('all_crowd_fundings',{
        account:req.session.user_id
    });
});


app.get('/interact_with_crowd_funding', checkUserSession, function(req,res) {  
    var cfAddress = req.query.cfAddress;
    res.render('interact_with_crowd_funding',{
        account:req.session.user_id,
        cfAddress:cfAddress
    });
});

// create_crowd_funding.html


app.get('/set_session', function(req,res) {
  // Your code here
  if(req.query.change)
  {
    console.log("yes");
    // returnToPage = req.url;
    req.session.user_id = 0;
  }
  console.log(req.query);
  res.render('set_session');
});

app.post('/set_session', function(req,res) {
  req.session.user_id = req.body.yourAccount;
  console.log(req.session.user_id);
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
        console.log("return to page =",returnToPage);
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
// });;
