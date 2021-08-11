import Web3 from '../ext/web3';
import Contract from '../../build/contracts/mainTest.json';

import './bootstrap.bundle.min.js'
import '../css/bootstrap.min.css'
import '../css/myCss.css'

let web3;
let contract;

const initWeb3 = () => {
  return new Promise((resolve, reject) => {
    if(typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum);
      window.ethereum.enable()
        .then(() => {
          resolve(
            new Web3(window.ethereum)
          );
        })
        .catch(e => {
          reject(e);
        });
      return;
    }
    if(typeof window.web3 !== 'undefined') {
      return resolve(
        new Web3(window.web3.currentProvider)
      );
    }
    resolve(new Web3('http://localhost:9545'));
    // resolve(new Web3('http://192.168.1.111:7545'));
  });
};

const initContract = () => {
  const deploymentKey = Object.keys(Contract.networks)[0];
  return new web3.eth.Contract(
    Contract.abi, 
    Contract
      .networks[deploymentKey]
      .address
  );
};


const initApp = () => {

  let accounts = [];
  let account = '';

  web3.eth.getAccounts()
  .then(_accounts => {
    accounts = _accounts;
    account = accounts[0];
    console.log(accounts);
    var select = document.getElementById("selectAccount"); 
    for(var i = 0; i < accounts.length; i++) {
      var opt = accounts[i];
      var el = document.createElement("option");
      el.textContent = opt;
      el.value = opt;
      select.appendChild(el);
    }
    document.getElementById("yourAccount").value = account;
    web3.eth.getBalance(account)
    .then(balance =>{
      document.getElementById("balance").innerHTML = web3.utils.fromWei(balance);
    });
  });

  //Manually added.............
  const $selectAccount = document.getElementById( "selectAccount" );

  const $createVoting = document.getElementById('createVoting');

  const $doVote = document.getElementById('doVote');

  const $createCF = document.getElementById('createCF');

  const $getCurrentCFs = document.getElementById('getCurrentCFs');

  const $updateCfStats = document.getElementById('updateCfStats');

  const $CFAddress = document.getElementById('CFAddress');

  const $cf_deadline = document.getElementById('cf_deadline');
  const $cf_totalContributors = document.getElementById('cf_totalContributors');
  const $cf_goal = document.getElementById('cf_goal');
  const $cf_raisedAmount = document.getElementById('cf_raisedAmount');
  const $getNow = document.getElementById('getNow');
  const $cf_now = document.getElementById('cf_now');
  const $CFcontributeAmount = document.getElementById('CFcontributeAmount');
  const $CFcontribute = document.getElementById('CFcontribute');
  const $CFgetRefund = document.getElementById('CFgetRefund');
  const $CFwithdrawFunding = document.getElementById('CFwithdrawFunding');
  const $last_msg = document.getElementById('last_msg');

  $selectAccount.addEventListener('change', (e) =>{
    var index = selectAccount.selectedIndex;
    account = selectAccount.options[index].value;
    // alert(account);
    document.getElementById("yourAccount").value = account;
    if (accounts.length > 1) {
      document.getElementById("YAHead").innerHTML = "Your Account #" + (index+1);
      web3.eth.getBalance(account)
      .then(balance =>{
        document.getElementById("balance").innerHTML = web3.utils.fromWei(balance);
      });
    }
  });

  $createVoting.addEventListener('submit', (e) => {
    e.preventDefault();
    const $msg = document.getElementById('createVoting_msg');
    $msg.innerHTML = "Please wait....";
    const val = e.target.elements[0].value;
    contract.methods.createVoting(val).send({from:account})
    .then(result => {
      $msg.innerHTML = 'Created Voting successfully.';
    })
    .catch(_e => {
      $msg.innerHTML = 'Ooops... there was an error while creating Voting {' + _e + '}';
    });
  });

  $doVote.addEventListener('submit', (e) => {
    e.preventDefault();
    const $msg = document.getElementById('doVote_msg');
    $msg.innerHTML = "Please wait....";
    const addr = e.target.elements[0].value;
    const vote = e.target.elements[1].value;
    contract.methods.vote(addr,vote).send({from:account})
    .then(result => {
      $msg.innerHTML = 'Voted successfully. {' + result + '}';
    })
    .catch(_e => {
      $msg.innerHTML = 'Ooops... there was an error while Voting {' + _e + '}';
    });
  });

  $createCF.addEventListener('submit', (e) =>{
    e.preventDefault();
    const $msg = document.getElementById('createCF_msg');
    $msg.innerHTML = "Please wait....";
    const d = e.target.elements[0].value;
    const t = e.target.elements[1].value;
    contract.methods.createCrowdFund(d,t).send({from:account,gas:3000000})
    .then(result => {
      $msg.innerHTML = 'Created CF successfully.';
    })
    .catch(_e => {
      $msg.innerHTML = 'Ooops... there was an error while creating CF {' + _e + '}';
    });

    contract.methods.getCfDbCount().call()
    .then(result => {
      $cf_deadline.innerHTML = result;
    })
    .catch(_e => {
      $cf_deadline.innerHTML = _e;
    });

  });


  $getCurrentCFs.addEventListener('submit', (e) =>{
    e.preventDefault();
    const $msg = document.getElementById('getCurrentCFs_msg');
    // $msg.innerHTML = "Please wait....";
    var noOfCFs = 0;
    // var tbl;
    const $currentCFs = document.getElementById('currentCFs');
    // $currentCFs.innerHTML = "";
    contract.methods.getCfDbCount().call()
    .then(result => {
      noOfCFs = parseInt(result);
      $currentCFs.innerHTML = 'No of CFs = ' + noOfCFs + '<br>';
      document.getElementById("CFsRows").innerHTML ="";
      for (var i = 0; i<noOfCFs; i++) {
        console.log('i = ',i);
        contract.methods.cfDb(i.toString()).call()
        .then(result => {
          var tbl = "";
          // var d = new Date(0);
          // d.setUTCSeconds(result.deadline);
          // console.log("now =",Date.now());
          // console.log("dedl =",result.deadline);
          var d = parseInt(result.deadline) - Date.now()/1000
          d = Math.floor(d);
          // var d = result.deadline;
          // $currentCFs.innerHTML+= result.admin;
          // $currentCFs.innerHTML+='<br>';
          tbl += "<tr class=\"table-success\">";
          // tbl += "<th scope=\"row\">"+"</th>";
          tbl += "<th scope=\"row\"><a href onclick=\"return copyToClipboard('"+result.admin+"');\" class=\"addr\">"+result.admin+"</a></th>";
          tbl += "<td scope=\"row\">"+result.raisedAmount+"</td>";
          tbl += "<td scope=\"row\">"+result.goal+"</td>";
          tbl += "<td scope=\"row\">"+result.totalContributors+"</td>";
          tbl += "<td scope=\"row\">"+d+"</td>";
          tbl += "</tr>";
          document.getElementById("CFsRows").innerHTML+= tbl;
        })
        .catch(_e => {
          $msg.innerHTML = 'Ooops... there was an error while getting CFs at index= {' + i + '} Error= {' + _e + '}';
        });
      }
    })
    .catch(_e => {
      $msg.innerHTML = 'Ooops... there was an error while getting CFs count {' + _e + '}';
    });
  });


  $updateCfStats.addEventListener('submit', (e) => {
    e.preventDefault();
    var addr = $CFAddress.value;
    var cfId;
    contract.methods.getCfIdFromAddress(addr).call()
    .then(result => {
      cfId = result
      // $cf_deadline.innerHTML = cfId;

      contract.methods.cfDb(cfId).call()
      .then(result => {
        $cf_deadline.innerHTML = result.deadline;
        $cf_totalContributors.innerHTML = result.totalContributors;
        $cf_goal.innerHTML = result.goal;
        $cf_raisedAmount.innerHTML = result.raisedAmount;
      })
      .catch(_e => {
        $cf_deadline.innerHTML = 'Ooops... there was an error while trying to get stats {' + _e + '}';
      });

    })
    .catch(_e => {
      $cf_deadline.innerHTML = 'Ooops... there was an error while trying to cfId {' + _e + '}';
    });

  });


  $CFcontribute.addEventListener('submit', (e) =>{
    e.preventDefault();

    const $msg = document.getElementById('CFcontribute_msg'); 
    var addr = $CFAddress.value;
    var cfId;
    contract.methods.getCfIdFromAddress(addr).call()
    .then(result => {
      cfId = result;
      var val = $CFcontributeAmount.value;
      contract.methods.cf_contribute(cfId).send({from: account,value:val,gas:3000000})
      .then(result => {
        $msg.innerHTML = 'Contributed {'+val+'} successfully.';
      })
      .catch(_e => {
        $msg.innerHTML = 'Ooops... there was an error while trying to Contribute {' + _e + '}';
      });
    })
    .catch(_e => {
      $msg.innerHTML = 'Ooops... there was an error while trying to cfId {' + _e + '}';
    });
  });

  $CFgetRefund.addEventListener('submit', (e) =>{
    e.preventDefault();

    const $msg = document.getElementById('CFgetRefund_msg'); 
    var addr = $CFAddress.value;
    var cfId;
    contract.methods.getCfIdFromAddress(addr).call()
    .then(result => {
      cfId = result;
      var val = $CFcontributeAmount.value;
      contract.methods.cf_getRefund(cfId).send({from: account})
      .then(result => {
        $msg.innerHTML = 'Refunded successfully.';
      })
      .catch(_e => {
        $msg.innerHTML = 'Ooops... there was an error while trying to Refund {' + _e + '}';
      });
    })
    .catch(_e => {
      $msg.innerHTML = 'Ooops... there was an error while trying to cfId {' + _e + '}';
    });
  });

  $CFwithdrawFunding.addEventListener('submit', (e) =>{
    e.preventDefault();
    const $msg = document.getElementById('CFwithdrawFunding_msg'); 
    var addr = $CFAddress.value;
    var cfId;
    contract.methods.getCfIdFromAddress(addr).call()
    .then(result => {
      cfId = result;
      var val = $CFcontributeAmount.value;
      contract.methods.cf_withdrawFunding(cfId).send({from: account})
      .then(result => {
        $msg.innerHTML = 'Refunded successfully.';
      })
      .catch(_e => {
        $msg.innerHTML = 'Ooops... there was an error while trying to Refund {' + _e + '}';
      });
    })
    .catch(_e => {
      $msg.innerHTML = 'Ooops... there was an error while trying to cfId {' + _e + '}';
    });
  });



  const event = document.createEvent('Event');
  // Define that the event name is 'build'.
  event.initEvent('submit', true, true);

  $getCurrentCFs.dispatchEvent(event);
};

document.addEventListener('DOMContentLoaded', () => {
  initWeb3()
    .then(_web3 => {
      web3 = _web3;
      contract = initContract();
      initApp(); 
    })
    .catch(e => console.log(e.message));
});








// var http = require('../node_modules/http');
// var formidable = require('./formidable');
// var fs = require('fs');

// http.createServer(function (req, res) {
//   if (req.url == '/fileupload') {
//     var form = new formidable.IncomingForm();
//     form.parse(req, function (err, fields, files) {
//       var oldpath = files.filetoupload.path;
//       var newpath = './uploads/' + files.filetoupload.name;
//       fs.rename(oldpath, newpath, function (err) {
//         if (err) throw err;
//         res.write('File uploaded and moved!');
//         res.end();
//       });
//  });
//   } else {
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
//     res.write('<input type="file" name="filetoupload"><br>');
//     res.write('<input type="submit">');
//     res.write('</form>');
//     return res.end();
//   }
// }).listen(8080);