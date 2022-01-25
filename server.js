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
if(!port){
    port = 9545;
}
var web3Address = "http://" + ip + ':' + port;
console.log("web3Address = ",web3Address);
const Web3 = require('web3');
const Contract = require('./build/contracts/myContract.json');
const deploymentKey = Object.keys(Contract.networks)[0];
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
var adr = "0xBAB5A2cC2EaE8f2CB1fE1069d1311Bca23fCAdB6";
function asyncGetUserType(addr) {
    return new Promise((resolve, reject) => {
        var ut = 0;
        var orgId = 0;
        contract.methods.getAddrStatus(addr).call()
        .then(result =>{
            
            orgId = result["orgId"];
            if(addr.toLowerCase() == contractAdmin.toLowerCase()) //it's admin
            {
                ut += 2
            }
            if(orgId > 0){// it's organization
                ut +=1
            }
            
            resolve(ut); // 1 => organization , 2=> admin , 3 => admin + organization
        })
        .catch(reject);
    });
}
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
const ejs = require('ejs');
app.set('views', path.join(__dirname, 'dist/views'));
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
app.get('/', function(req, res) {
  
  returnToPage = '/Home.html';
  res.redirect(returnToPage);
});
app.get('/test', function(req, res) {
  
  res.render('test.html');
});
const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'uploads/');
	},
    
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
        
        result += '<hr/></center>';
        res.send(result);
    });
});
app.get('/View_Images.html', checkUserSession, async function(req,res) {
    
    var userType = await asyncGetUserType(req.session.user_id);
    var result = `<center><br>`;
    var tableName = req.session.user_id.substring(1).toLowerCase();
    var address = req.query.address.toLowerCase();
    
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
        
        if(row.type == 1)
        {
            result += `<a href="${row.info}"><img src="${row.info}" width="300" style="margin-right: 20px;"></a>`;
        }else{
            message+= row.info;
        }
        });
        
        result+= "</center>"
        +'<center><br><br><div class="alert-info form-control" >'+message+'</div><br></center>';
            
            
            
            
                res.render('View_Images.html',{
                    account:req.session.user_id,
                    rate:ratePerRupee,
                    images:result,
                    userType:userType
                });
            
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
        
        var msg = req.body.msg;
        var filenameString = "";
        
        for (index = 0, len = files.length; index < len; ++index) {
            result += `<img src="${files[index].path}" width="250" style="margin-right: 20px;">`;
            if(index){
                filenameString += delimiter;
            }
            filenameString += files[index].path ;
        }
        db.serialize(function() {
            var tableName = 'org_'+user_id.substring(1);
            
            db.run("CREATE TABLE if not exists "+tableName+" (tx TEXT, type INTEGER, info TEXT)");
            db.run("INSERT INTO "+tableName+" VALUES (\""+req.body.txId.substring(1).toLowerCase()+"\",2,\""+ msg +"\")");
            db.run("INSERT INTO "+tableName+" VALUES (\""+req.body.txId.substring(1).toLowerCase()+"\",1,\""+filenameString+"\")");
        });
        result += '<hr/></center>';
        res.send(result);
    });
});
app.get('/Org_View_Images.html', checkUserSession, async function(req,res) {
    var userType = await asyncGetUserType(req.session.user_id);
    var result = `<center><br>`;
    var tableName = 'org_'+req.session.user_id.substring(1).toLowerCase();
    var txId = req.query.txId;
    var address = req.query.address.toLowerCase();
    var message = "";
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
        result+= "</center>"
        +'<center><br><br><div class="alert-info form-control" >'+message+'</div><br></center>';
                res.render('Org_View_Images.html',{
                    account:req.session.user_id,
                    rate:ratePerRupee,
                    images:result,
                    userType:userType
                });
    });
    });
});
app.get('/set_session', function(req,res) {
  
  if(req.query.change)
  {
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
}
var d = new Date();
var dateString = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+(d.getDate()-1);
const options = {
  hostname: 'exchangerate.guru',
  port: 443,
  path: '/system/exchange-rate-chart/?amount=1&bcc=ETH&scc=PKR&dateFrom='+dateString+'&dateTo='+dateString,
  method: 'GET'
}
const req = https.request(options, res => {
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
  console.log("Internet Connection Error. Using Previous rate.");
  ratePerRupee = config["rate"];
  console.log('rate (WeiPerRupee) = ',ratePerRupee);
});
req.end();
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
app.set('port', process.env.PORT || 8080);
const server = app.listen(app.get('port'), () => console.log(`Listening on port ${app.get('port')}...`));
