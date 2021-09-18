const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const helpers = require('./helpers');
const sqlite3 = require('sqlite3').verbose();

const https = require('https')

const app = express();
var db = new sqlite3.Database('mydb.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

// X=X=X=X=X=X=X=X=X WEB3 Test X=X=X=X=X=X=X=X=X
var config;
var ip = "";
var host = "";
var rate = 0;
var port = 0;

try{
    config = fs.readFileSync('myConfig.json', 'utf8');
    config = JSON.parse(config);
    ip = config["ip"];
    host = config["host"];
    rate = config["rate"];
    port = config["port"];
}catch(err){
  console.log(err.message);
};

// console.log("rate = ",rate);
// console.log("ip = ",ip);
// console.log("host = ",host);
// console.log("port = ",port);

if(!port){
    port = 9545;
}

var web3Address = "http://" + ip + ':' + port;
console.log("web3Address = ",web3Address);

const Web3 = require('web3');
const Contract = require('./build/contracts/myContract.json');
const deploymentKey = Object.keys(Contract.networks)[0];
// const web3 = new Web3('http://localhost:9545');
const web3 = new Web3(web3Address);
const contractAddress = Contract.networks[deploymentKey].address;
const contract = new web3.eth.Contract(Contract.abi,contractAddress);

var contractAdmin;

contract.methods.contractAdmin().call()
.then(async (result) => {
    contractAdmin = result;
    console.log("Contract Admin = ",contractAdmin);
    console.log("Contract Address = ",contractAddress);
})
.catch(_e => {
    $msg.innerHTML = 'Ooops... there was an error while getting contractAdmin {' + _e + '}';
});
// console.log("Contract Admin = ",contractAdmin);
// console.log("Contract Address = ",contractAddress);

// var adr = "0xbab5a2cc2eae8f2cb1fe1069d1311bca23fcadb6";
// var adr = "0xe7674aF9bDcE09B9975CC99BDf5659d3BE843027";
var adr = "0xBAB5A2cC2EaE8f2CB1fE1069d1311Bca23fCAdB6";
// contract.methods.getAddrStatus(adr).call()
// .then( result => {
//     console.log("result =",result); 
// })

// async function asyncGetUserType(addr) {
//     var ut = 0;
//     var orgId = 0;
//     var result = await contract.methods.getAddrStatus(addr).call();
//     orgId = result["orgId"];
//     if(addr == contractAdmin) //it's admin
//     {
//         ut += 2
//     }
//     if(orgId > 0){// it's organization
//         ut +=1
//     }
//     return ut; // 1 => organization , 2=> admin , 3 => admin + organization
// }

// async function getUserType(addr){
//     var ut = await asyncGetUserType(addr);
//     // console.log("user Type = ", userType);
//     return ut;
// }

function asyncGetUserType(addr) {
    return new Promise((resolve, reject) => {
        var ut = 0;
        var orgId = 0;
        contract.methods.getAddrStatus(addr).call()
        .then(result =>{
            // console.log("result = ",result);
            orgId = result["orgId"];
            if(addr.toLowerCase() == contractAdmin.toLowerCase()) //it's admin
            {
                ut += 2
            }
            if(orgId > 0){// it's organization
                ut +=1
            }
            // console.log("ut = ",ut);
            resolve(ut); // 1 => organization , 2=> admin , 3 => admin + organization
        })
        .catch(reject);
    });
}

// console.log("asyncGetUserType = ",asyncGetUserType(adr));



// x-x-x-x-x-x-x-x-x WEB3 Test x-x-x-x-x-x-x-x-x


var returnToPage = "Home.html";
var previousPage = "Home.html";
var ratePerRupee = 0;
var userType = 0;

app.use('/', express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/docs', express.static(path.join(__dirname, 'documentation')));

app.use(session({
    secret: 'user_id',
    resave: true,
    saveUninitialized: true
}));

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
  returnToPage = '/Home.html';
  res.redirect(returnToPage);
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

app.get('/Upload-Images.html', checkUserSession,async function(req,res) {  
    var userType = await asyncGetUserType(req.session.user_id); 
    var cfId = req.query.cfId;
    res.render('Upload-Images',{
        account:req.session.user_id,
        rate:ratePerRupee,
        cfId:cfId,
        userType:userType
    });
});

app.post('/Upload_Images.html', (req, res) => {
    // 10 is the limit I've defined for number of uploaded files at once
    // 'multiple_images' is the name of our file input field

    var user_id = req.session.user_id.toLowerCase();
    let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).array('images', 10);

    upload(req, res, function(err) {
    	if (req.fileValidationError) {
    		return res.send(req.fileValidationError);
    	}

        let result = "<center>You have uploaded these images: <hr />";
        const files = req.files;
        let index, len;

        console.log(req.body.msg);
        var msg = req.body.msg;

        // Loop through all the uploaded images and display them on frontend
        for (index = 0, len = files.length; index < len; ++index) {
        	result += `<img src="${files[index].path}" width="250" style="margin-right: 20px;">`;
        }

        db.serialize(function() {
            var tableName = user_id.substring(1);
            db.run("CREATE TABLE if not exists "+tableName+" (type INTEGER, info TEXT)");
            db.run("DELETE FROM "+tableName);
            db.run("INSERT INTO "+tableName+" VALUES (2,\""+ msg +"\")");
            var stmt = db.prepare("INSERT INTO "+tableName+" VALUES (1,?)");
            for (index = 0, len = files.length; index < len; ++index) {
                stmt.run(files[index].path);
            }
            stmt.finalize();
        });
        // result += '<hr/><a href="./">Upload more images</a></center>';
        result += '<hr/></center>';
        res.send(result);
    });
});



app.get('/View_Images.html', checkUserSession, async function(req,res) {//, checkUserSession
    // var result = `<center><b>Images</b><br>`;
    var userType = await asyncGetUserType(req.session.user_id);
    var result = `<center><br>`;
    var tableName = req.session.user_id.substring(1).toLowerCase();
    var address = req.query.address.toLowerCase();
    // var styling = req.query.styling;
    var message = "";
    if(address)
    if(address.length >= 42){
        tableName = address.substring(1);
        console.log("tableName = ",tableName);
    }
    db.serialize(function() {
    db.run("CREATE TABLE if not exists "+tableName+" (info TEXT)");
    db.all("SELECT info,type FROM "+tableName, [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
        // console.log(row.info);
        if(row.type == 1)
        {
            result += `<a href="${row.info}"><img src="${row.info}" width="300" style="margin-right: 20px;"></a>`;
        }else{
            message+= row.info;
        }
        });
        // console.log(result);
        result+= "</center>"
        +'<center><br><br><div class="alert-info form-control" >'+message+'</div><br></center>';

            // var styling = req.query.styling;
            // if(styling.length){
            //     res.send(result);
            // }else{
                res.render('View_Images.html',{
                    account:req.session.user_id,
                    rate:ratePerRupee,
                    images:result,
                    userType:userType
                });
            // }
    });
    });
});

var delimiter = ';';

app.post('/Org_Upload_Images.html', (req, res) => {
    
    var user_id = req.session.user_id.toLowerCase();
    let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).array('images', 10);

    upload(req, res, function(err) {
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }

        console.log("txId = ",req.body);

        let result = "<center>You have uploaded these images: <hr />";
        const files = req.files;
        let index, len;

        // console.log(req.body.msg);
        var msg = req.body.msg;
        var filenameString = "";

        // Loop through all the uploaded images and display them on frontend
        for (index = 0, len = files.length; index < len; ++index) {
            result += `<img src="${files[index].path}" width="250" style="margin-right: 20px;">`;
            if(index){
                filenameString += delimiter;
            }
            filenameString += files[index].path ;
        }

        db.serialize(function() {
            var tableName = 'org_'+user_id.substring(1);
            // var tableName = req.body.txId.substring(1);
            db.run("CREATE TABLE if not exists "+tableName+" (tx TEXT, type INTEGER, info TEXT)");
            db.run("INSERT INTO "+tableName+" VALUES (\""+req.body.txId.substring(1).toLowerCase()+"\",2,\""+ msg +"\")");
            db.run("INSERT INTO "+tableName+" VALUES (\""+req.body.txId.substring(1).toLowerCase()+"\",1,\""+filenameString+"\")");
            // db.run("DELETE FROM "+tableName);
            // db.run("INSERT INTO "+tableName+" VALUES (2,\""+ msg +"\")");
            // var stmt = db.prepare("INSERT INTO "+tableName+" VALUES (1,?)");
            // for (index = 0, len = files.length; index < len; ++index) {
            //     stmt.run(files[index].path);
            // }
            // stmt.finalize();
        });
        // result += '<hr/><a href="./">Upload more images</a></center>';
        result += '<hr/></center>';
        res.send(result);
    });
});

// http://localhost:8080/Org_View_Images.html?address=0xe7674aF9bDcE09B9975CC99BDf5659d3BE843027&txId=0xd59648dab176dddd5f6a9f96430dd692295997be02fdc7c5c6bc79f83b4f7c4f
app.get('/Org_View_Images.html', checkUserSession, async function(req,res) {//, checkUserSession
    // var result = `<center><b>Images</b><br>`;
    var userType = await asyncGetUserType(req.session.user_id);
    var result = `<center><br>`;
    var tableName = 'org_'+req.session.user_id.substring(1).toLowerCase();
    var txId = req.query.txId;
    var address = req.query.address.toLowerCase();
    var message = "";
    // var styling = req.query.styling;
    // console.log("req.body = ",req.query);

    if(txId)
    if(txId.length>42){
        txId = txId.substring(1).toLowerCase();
        console.log("txId =",txId);
    }

    if(address)
    if(address.length >= 42){
        tableName = 'org_'+address.substring(1);
        console.log("get parameter => tableName = ",tableName);
    }
    db.serialize(function() {
    db.run("CREATE TABLE if not exists "+tableName+" (tx TEXT, type INTEGER, info TEXT)");
    db.all("SELECT info,type FROM "+tableName+(txId?" WHERE tx = \""+txId+"\"":""), [], (err, rows) => {
        if (err) {
            throw err;
            return cb(err);
        }
        console.log(rows);
        rows.forEach((row) => {
        if(row.type == 1)
        {
            txRows = row.info;
            txRows.split(delimiter).forEach((txRow) =>{
                result += `<a href="${txRow}"><img src="${txRow}" width="300" style="margin-right: 20px;"></a><br>`;
            });
        }else{
            message+= row.info;
        }
        });
        // console.log(result);
        result+= "</center>"
        +'<center><br><br><div class="alert-info form-control" >'+message+'</div><br></center>';

            // var styling = req.query.styling;
            // if(styling.length){
            //     res.send(result);
            // }else{
                res.render('Org_View_Images.html',{
                    account:req.session.user_id,
                    rate:ratePerRupee,
                    images:result,
                    userType:userType
                });
            // }
    });
    });
});



// app.get('/vote', checkUserSession, function(req,res) {
//     var result = `<b>Images</b><br>`;
//     var canidateAddress = req.query.canidateAddress;
//     console.log("vt=",req.query.canidateAddress);  
//     res.render('vote',{
//         account:req.session.user_id,
//         images:result,
//         canidateAddress:canidateAddress
//     });
// });

// app.get('/create_crowd_funding', checkUserSession, function(req,res) {  
//     res.render('create_crowd_funding',{
//         account:req.session.user_id
//     });
// });

// app.get('/all_crowd_fundings', checkUserSession, function(req,res) {  
//     res.render('all_crowd_fundings',{
//         account:req.session.user_id,
//         // rate:ratePerRupee
//     });
// });


// app.get('/interact_with_crowd_funding', checkUserSession, function(req,res) {  
//     var cfAddress = req.query.cfAddress;
//     res.render('interact_with_crowd_funding',{
//         account:req.session.user_id,
//         cfAddress:cfAddress
//     });
// });

// app.get('/create_organization', checkUserSession, function(req,res) {  
//     var cfAddress = req.query.cfAddress;
//     res.render('create_organization',{
//         account:req.session.user_id
//     });
// });

// app.get('/all_organizations', checkUserSession, function(req,res) {  
//     var cfAddress = req.query.cfAddress;
//     res.render('all_organizations',{
//         account:req.session.user_id,
//         rate:ratePerRupee
//     });
// });

// app.get('/interact_with_organization', checkUserSession, function(req,res) {  
//     var orgAddress = req.query.orgAddress;
//     res.render('interact_with_organization',{
//         account:req.session.user_id,
//         orgAddress,orgAddress,
//         rate:ratePerRupee
//     });
// });


// create_crowd_funding.html


app.get('/set_session', function(req,res) {
  // Your code here
  if(req.query.change)
  {
    // console.log("yes");
    // returnToPage = req.url;
    req.session.user_id = 0;
  }
  returnToPage = previousPage;
  console.log(req.query);
  console.log("Rate = ",ratePerRupee);
  res.render('set_session',{
    account:req.session.user_id,
    rate:ratePerRupee,
    userType:0
});
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


// wei per rupee
var d = new Date();
var dateString = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+(d.getDate()-1);
const options = {
  hostname: 'exchangerate.guru',
  port: 443,
  path: '/system/exchange-rate-chart/?amount=1&bcc=ETH&scc=PKR&dateFrom='+dateString+'&dateTo='+dateString,
  method: 'GET'
}

const req = https.request(options, res => {
  // console.log(`statusCode: ${res.statusCode}`)
  res.on('data', d => {
    var price = JSON.parse(d);
    console.log('price = ',price);
    ratePerRupee = (1e18)/price[0][1];
    console.log('rate (WeiPerRupee) = ',ratePerRupee);
    
    config["rate"] = ratePerRupee;
    let data = JSON.stringify(config);
    fs.writeFileSync('myConfig.json', data);

  });
});

req.on('error', error => {
  // console.error(error)
  console.log("Internet Connection Error. Using Previous rate.");
  // ratePerRupee = 1521869061597.4343;
  ratePerRupee = config["rate"];
  console.log('rate (WeiPerRupee) = ',ratePerRupee);
});

req.end();
// wei per rupee


// ############### New Ui Changes ###############

app.get('/Home.html', checkUserSession, async function(req,res) {  
    previousPage = req.originalUrl;
    var userType = await asyncGetUserType(req.session.user_id);
    res.render('Home',{
        account:req.session.user_id,
        rate:ratePerRupee,
        userType:userType
    });
});

app.get('/Fundraising.html', checkUserSession, async function(req,res) {  
    previousPage = req.originalUrl;
    var userType = await asyncGetUserType(req.session.user_id);
    res.render('Fundraising',{
        account:req.session.user_id,
        rate:ratePerRupee,
        userType:userType
    });
});

app.get('/Vote.html', checkUserSession, async function(req,res) {  
    previousPage = req.originalUrl;
    var canidateAddress = req.query.canidateAddress;
    var userType = await asyncGetUserType(req.session.user_id);
    res.render('Vote',{
        account:req.session.user_id,
        rate:ratePerRupee,
        canidateAddress:canidateAddress,
        userType:userType
    });
});

app.get('/Active_Campaigns.html', checkUserSession, async function(req,res) { 
    previousPage = req.originalUrl; 
    var userType = await asyncGetUserType(req.session.user_id);
    res.render('Active_Campaigns',{
        account:req.session.user_id,
        rate:ratePerRupee,
        userType:userType
    });
});

app.get('/Create_Organization.html', checkUserSession, async function(req,res) {
    previousPage = req.originalUrl;  
    var userType = await asyncGetUserType(req.session.user_id);
    res.render('Create_Organization',{
        account:req.session.user_id,
        rate:ratePerRupee,
        userType:userType
    });
});

app.get('/Active_Organizations.html', checkUserSession, async function(req,res) {
    previousPage = req.originalUrl; 
    var userType = await asyncGetUserType(req.session.user_id); 
    res.render('Active_Organizations',{
        account:req.session.user_id,
        rate:ratePerRupee,
        userType:userType
    });
});

app.get('/Donate_Organization.html', checkUserSession, async function(req,res) { 
    previousPage = req.originalUrl; 
    var userType = await asyncGetUserType(req.session.user_id); 
    var orgAddress = req.query.orgAddress;
    var amount = req.query.amount;
    res.render('Donate_Organization',{
        account:req.session.user_id,
        rate:ratePerRupee,
        orgAddress:orgAddress,
        amount:amount,
        userType,userType
    });
});

app.get('/Donate_Individual.html', checkUserSession, async function(req,res) {  
    previousPage = req.originalUrl;
    var userType = await asyncGetUserType(req.session.user_id); 
    res.render('Donate_Individual',{
        account:req.session.user_id,
        rate:ratePerRupee,
        userType:userType
    });
});

app.get('/Interact_Fundraising.html', checkUserSession, async function(req,res) {  
    previousPage = req.originalUrl;
    var userType = await asyncGetUserType(req.session.user_id); 
    var cfId = req.query.cfId;
    res.render('Interact_Fundraising',{
        account:req.session.user_id,
        rate:ratePerRupee,
        cfId:cfId,
        userType:userType
    });
});

app.get('/Organization_Dashboard.html', checkUserSession, async function(req,res) {  
    previousPage = req.originalUrl;
    var userType = await asyncGetUserType(req.session.user_id); 
    var cfId = req.query.cfId;
    res.render('Organization_Dashboard',{
        account:req.session.user_id,
        rate:ratePerRupee,
        cfId:cfId,
        userType:userType
    });
});

app.get('/Zakat.html', checkUserSession,async function(req,res) {  
    previousPage = req.originalUrl;
    var userType = await asyncGetUserType(req.session.user_id); 
    var cfId = req.query.cfId;
    res.render('Zakat',{
        account:req.session.user_id,
        rate:ratePerRupee,
        cfId:cfId,
        userType:userType
    });
});


// ############### New Ui Changes ###############





app.set('port', process.env.PORT || 8080);


// eslint-disable-next-line no-unused-vars
const server = app.listen(app.get('port'), () => console.log(`Listening on port ${app.get('port')}...`));

// db.close((err) => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log('Close the database connection.');
// });;
