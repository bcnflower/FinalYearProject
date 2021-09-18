// import Web3 from '../ext/web3';
// import Web3 from '../ext/web3.min.js';
import Contract from '../../build/contracts/myContract.json';
import config from '../../myConfig.json';

// import './bootstrap3.bundle.min.js'
// import '../css/bootstrap3.min.css'
// import '../css/font-awesome.min.css'
// import './jquery.min.js'

// import '../css/myCss.css'

import "./html-duration-picker.min.js"
import 'regenerator-runtime/runtime'
const abiDecoder = require('abi-decoder'); // NodeJS
abiDecoder.addABI(Contract.abi);

let web3;
let contract;
let accounts = [];
let account = '';
let accountSelectorEnabled = true;

var gasLim = 3000000;

  //Manually added.............
  const $selectAccount = document.getElementById( "selectAccount" );

  const $createVoting = document.getElementById('createVoting');

  const $getVotingStatus = document.getElementById('getVotingStatus');
  const $positiveVotes = document.getElementById('positiveVotes');
  const $negativeVotes = document.getElementById('negativeVotes');
  const $VSDeadline = document.getElementById('VSDeadline');


  const $doVote = document.getElementById('doVote');

  const $createCF = document.getElementById('createCF');

  const $getCurrentCFs = document.getElementById('getCurrentCFs');

  const $updateCfStats = document.getElementById('updateCfStats');

  const $CFAddress = document.getElementById('CFAddress');

  const $createOrg = document.getElementById('createOrg');

  const $getCurrentOrgs = document.getElementById('getCurrentOrgs');

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

  // Org variables...
  const $updateOrgStats = document.getElementById('updateOrgStats');
  const $orgAddress = document.getElementById('orgAddress');
  const $org_name = document.getElementById('org_name');
  const $org_zakat = document.getElementById('org_zakat');
  const $org_balanceAmount = document.getElementById('org_balanceAmount');

  const $orgContribute = document.getElementById('orgContribute');
  const $orgContributeAmount = document.getElementById('orgContributeAmount');

  const $orgWithdraw = document.getElementById('orgWithdraw');
  const $withdrawAmount = document.getElementById('withdrawAmount');

  const $populateOrgs = document.getElementById('populateOrgs');

  // Org variables...

  const initWeb3 = () => {
    return new Promise((resolve, reject) => {
      if(typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        window.web3 = web3;
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
    // resolve(new Web3('http://192.168.1.123:9545'));
    var web3Address = "http://" + config["ip"] + ':' + (config["port"]?config["port"]:9545);
    // resolve(new Web3('http://localhost:9545'));
    resolve(new Web3(web3Address));
    // resolve(new Web3('http://192.168.1.9:7545'));
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

  // let accounts = [];
  // let account = '';

  web3.eth.getAccounts()
  .then(_accounts => {
    try{
      presets();
    }catch(err){
      console.log(err.message);
    };
    accounts = _accounts;
    account = accounts[0];
    console.log(accounts);
    if(accountSelectorEnabled){
      try{
        accountSelector();
      }catch(err){
        console.log(err.message);
      };
    };
    // try{
      features();
    //   }catch(err){
    //     console.log(err.message);
    // };
  });
};

const accountSelector = () =>{

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
    document.getElementById("balancePKR").innerHTML = Math.floor(weiToPkr(balance));
  });

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
        document.getElementById('balancePKR').innerHTML = Math.round(weiToPkr(balance));
      });
    }
  });
}

const init_applyVoting = (inputIndex = 0) => {

  $createVoting.addEventListener('submit', (e) => {
    // document.getElementById('createVoting').addEventListener('submit', (e) => {
      e.preventDefault();
      account = getSelectedAccount();
      const $msg = document.getElementById('createVoting_msg');
      var cause = document.getElementById("cause").value;
      cause = parseInt(cause);
      var amount = document.getElementById("amount").value;
      amount = parseInt(amount);
      amount = PkrToWei(amount);
      amount = Math.round(amount).toString();
      console.log(amount);
      var Vduration = getDurationInSec("Vduration");
      var CFduration = getDurationInSec("CFduration");
      msgWrn($msg);
      $msg.innerHTML = "Please wait....";
      contract.methods.createVoting(Vduration,CFduration,amount,cause).send({from:account,gas:gasLim })
      .then(result => {
        msgOk($msg);
        $msg.innerHTML = 'Created Voting successfully. ';
        $msg.innerHTML+= '<a href="./Vote.html?canidateAddress='+account+'" target="_blank" >Voting Link</a>';
      })
      .catch(_e => {e.target.elements[0].value;
        msgErr($msg);
        $msg.innerHTML = 'Ooops... there was an error while creating Voting {' + _e + '}';
      });
    });
};

const init_getVotingStats = (elementID = "currentAccount") => {

  $getVotingStatus.addEventListener('submit', (e) =>{
    e.preventDefault();
    const $msg = document.getElementById('getVotingStatus_msg');
    msgWrn($msg);
    $msg.innerHTML = "Please wait ...";
    var acc = document.getElementById(elementID).value;
    if(acc.length < 42){
      msgErr($msg);
      $msg.innerHTML = 'Address not Valid!';
      return;
    }
    contract.methods.getVotingStatus(acc).call()
    .then(async(result) => {
        // console.log("addr = ",addr);
        // console.log("Result = ",result);
        $positiveVotes.innerHTML = result.positiveVotes;
        // $negativeVotes.innerHTML = result.negativeVotes;
        var d = parseInt(result.deadline) - Date.now()/1000;
        d = Math.floor(d);
        document.getElementById("VSamount").innerHTML = Math.round(weiToPkr(result.amount));  
        document.getElementById("VScause").innerHTML = getCause(result.catagory);
        // $VSDeadline.innerHTML = new Date((result.deadline*1000 - Date.now())).toISOString().substr(11, 8) ;
        var cfid = -1;
        var cfd = Date.now()/1000;
        var timeOutput = "";

        try{
          cfid = await contract.methods.getCfIdFromAddress(acc).call();
          cfd = await contract.methods.cfDb(cfid).call();
          cfd = parseInt(cfd["deadline"]) - Date.now()/1000;
          cfd = Math.floor(cfd);
        }catch(e){
          console.log("e=",e);
        }

        console.log("cfid =",cfid );
        console.log("cfd =",cfd );

        if(d>0){
          timeOutput = "Voting ends in: " + new Date(d * 1000).toISOString().substr(11, 8);
        }else if(cfd>0){
          timeOutput = "Funding ends in: " + new Date(cfd * 1000).toISOString().substr(11, 8);
        }else{
          timeOutput = "Time Over";
        }
        
        $VSDeadline.innerHTML = timeOutput;

        // $VSDeadline.innerHTML = (d<0?(cfid?"Deployed":"Time Over"):new Date(d * 1000).toISOString().substr(11, 8))
        msgOk($msg);
        $msg.innerHTML = 'Stats Updated.';
      })
    .catch(_e => {
      msgErr($msg);
      $msg.innerHTML = 'Ooops... there was an error while getting stats {' + _e + '}';
    });
  });
};


const init_doVote = () => {

  $doVote.addEventListener('submit', (e) => {
    e.preventDefault();
    account = getSelectedAccount();
    const $msg = document.getElementById('doVote_msg');
    msgWrn($msg);
    $msg.innerHTML = "Please wait....";
    // const addr = e.target.elements[0].value;
    // const vote = e.target.elements[1].value;
    const addr = document.getElementById("canidateAddress").value;
    var vote;// = document.getElementById("voteAgree").value;
    const rbs = document.querySelectorAll('input[name="voteAgree"]');
    // console.log(rbs)
    for (const rb of rbs) {
      if (rb.checked) {
        vote = rb.value;
        vote = parseInt(vote);
        break;
      }
    }
    // console.log("vote = ",vote," = ",Boolean(vote));
    contract.methods.vote(addr,Boolean(vote)).send({from:account,gas:gasLim })
    .then(result => {
      msgOk($msg);
      $msg.innerHTML = 'Voted successfully. {' + result + '}';
    })
    .catch(_e => {
      msgErr($msg);
      $msg.innerHTML = 'Ooops... there was an error while Voting {' + _e + '}';
      console.log("error =",_e);
    });
  });
};

const init_getVotingList = async () => {

  document.getElementById("populateVotingList").addEventListener('submit', (e) => {
    e.preventDefault();
    account = getSelectedAccount();
    const $msg = document.getElementById('doVote_msg');
    msgWrn($msg);
    $msg.innerHTML = "Please wait....";
    var votingList = document.getElementById("votingList");

    var noVoting = 0;
    contract.methods.getVotingDbCount().call()
    .then(async (result) => {
      noVoting = parseInt(result);
      // $currentOrgs.innerHTML = 'No of Orgs = ' + noOfOrgs + '<br>';
      votingList.innerHTML ="<br>";
      for (var i = noVoting-1; i>=0; i--) {
        // console.log('i = ',i);
        await contract.methods.votingDb(i.toString()).call()
        .then(result => {
          // console.log('result = ',result);
          var row = "";
          var d = parseInt(result.votingDeadline) - Date.now()/1000;
          // console.log("result.votingDeadline = ",result.votingDeadline);
          // console.log("i = ",i,", d =",d);
          if(d>0 && result.admin != account){
            row += '<option value="'+result.admin+'">'+result.admin+'</option>'
            votingList.innerHTML+= row;
          }
        })
        .catch(_e => {
          msgErr($msg);
          $msg.innerHTML = 'Ooops... there was an error while getting Voting at index= {' + i + '} Error= {' + _e + '}';
        });
      }
      var votingAdr = document.getElementById("canidateAddress");
      if(votingAdr.value.length >= 42){
        votingList.value = votingAdr.value;
      }else{
        votingAdr.value = votingList.value;
          // votingAdr.value = votingList.options[0].value;
        }
      })
    .catch(_e => {
      msgErr($msg);
      $msg.innerHTML = 'Ooops... there was an error while getting Voting Count {' + _e + '}';
    });
    msgOk($msg);
    $msg.innerHTML = "Voting list populated.";
  });
};

const init_createCF = () => {
  $createCF.addEventListener('submit', (e) =>{
    e.preventDefault();
    account = getSelectedAccount();
    const $msg = document.getElementById('createCF_msg');
    msgWrn($msg);
    $msg.innerHTML = "Please wait....";
    const d = e.target.elements[0].value;
    const t = e.target.elements[1].value;
    contract.methods.createCrowdFund(d,t).send({from:account,gas:gasLim })
    .then(result => {
      msgOk($msg);
      $msg.innerHTML = 'Created CF successfully.';
    })
    .catch(_e => {
      msgErr($msg);
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
};

const init_currentCFs = () => {
  var active_rows = document.getElementById("active_rows");
  var ended_rows = document.getElementById("ended_rows");
  var refund_rows = document.getElementById("refund_rows");
  var withdraw_rows = document.getElementById("withdraw_rows");
  var active_div = document.getElementById("active_div");
  var ended_div = document.getElementById("ended_div");
  var refund_div = document.getElementById("refund_div");
  var withdraw_div = document.getElementById("withdraw_div");

  document.getElementById("getCurrentCFs").addEventListener('submit', (e) =>{
    e.preventDefault();
    const $msg = document.getElementById('getCurrentCFs_msg');
    msgWrn($msg);
    $msg.innerHTML = "Please wait....";
    var noOfCFs = 0;
    // var tbl;
    // const $currentCFs = document.getElementById('currentCFs');
    // $currentCFs.innerHTML = "<br>";
    contract.methods.getCfDbCount().call()
    .then( async (result) => {
      noOfCFs = parseInt(result);
      // $currentCFs.innerHTML = 'No of CFs = ' + noOfCFs + '<br>';
      active_div.style.display = "none";
      ended_div.style.display = "none";
      refund_div.style.display = "none";
      withdraw_div.style.display = "none";

      active_rows.innerHTML = "<br>";
      ended_rows.innerHTML = "<br>";
      refund_rows.innerHTML = "<br>";
      withdraw_rows.innerHTML = "<br>";

      for (var i = noOfCFs-1; i>=0; i--) {
        console.log('i = ',i);
        await contract.methods.cfDb(i.toString()).call()
        .then(result => {
          var tbl = "<br>";
          var d = parseInt(result.deadline) - Date.now()/1000
          d = Math.floor(d);
          var percent = (result.raisedAmount*100) / result.goal;

          tbl+= "<h4><b>"+getCause(result.catagory)+"</b></h4>";
          tbl+= "Collected: "+percent.toFixed(2)+"%"
          tbl+= "<br>";
          tbl+= (d<0?"<br>":"Time Left: "+new Date(d * 1000).toISOString().substr(11, 8));
          tbl+= "<br>";


          console.log(i.toString());

          tbl = '<div class="col-lg-2 col-md-4 col-5"><a href="Interact_Fundraising.html?cfId='
          +i.toString()+
          '"><div class="box"><center>'
          + tbl +
          '</center></div></a></div>';

          // tbl += "<tr class=\""+(d>0?"table-success":"table-danger")+"\">";
          // // tbl += "<th scope=\"row\">"+"</th>";
          // tbl += "<th scope=\"row\">" + (d<0?result.admin:"<a href=\"interact_with_crowd_funding?cfAddress="+result.admin+"');\" class=\"addr\" target=\"_blank\" >" +result.admin+"</a>")+"</th>";
          // tbl += "<td scope=\"row\">"+result.raisedAmount+"</td>";
          // tbl += "<td scope=\"row\">"+result.goal+"</td>";
          // tbl += "<td scope=\"row\">"+result.totalContributors+"</td>";
          // tbl += "<td scope=\"row\">"+(d<0?"Time Over":new Date(d * 1000).toISOString().substr(11, 8))+"</td>";
          // tbl += "</tr>";

          // console.log("tbl=",tbl);

          if(d>0){
            active_div.style.display = "block";
            active_rows.innerHTML+= tbl;
          }else if (result.raisedAmount == 0){
            ended_div.style.display = "block";
            ended_rows.innerHTML+= tbl;
          }else if(result.raisedAmount < result.goal){
            refund_div.style.display = "block";
            refund_rows.innerHTML+= tbl;
          }else{
            withdraw_div.style.display = "block";
            withdraw_rows.innerHTML+= tbl;
          }
        })
        .catch(_e => {
          msgErr($msg);
          $msg.innerHTML = 'Ooops... there was an error while getting CFs at index= {' + i + '} Error= {' + _e + '}';
        });
      }
      msgOk($msg);
      $msg.innerHTML = 'List Updated.';
    })
    .catch(_e => {
      msgErr($msg);
      $msg.innerHTML = 'Ooops... there was an error while getting CFs count {' + _e + '}';
    });
  });
};

const init_interactWithCFs = () => {

  var $cfId = document.getElementById("cfId");
  var contribute_div = document.getElementById("contribute_div");
  var refund_div = document.getElementById("refund_div");
  var withdraw_div = document.getElementById("withdraw_div");

  $updateCfStats.addEventListener('submit', (e) => {
    e.preventDefault();
    var $msg = document.getElementById("cfStatus_msg");
    msgWrn($msg);
    $msg.innerHTML = 'Please wait ...';
    var addr = $CFAddress.value;
    var cfId;
    console.log("addr= ",addr);
    // contract.methods.getCfIdFromAddress(addr).call()
    // .then(result => {
      cfId = parseInt($cfId.value);
      // $cf_deadline.innerHTML = cfId;
      console.log("cfId=",cfId);

      contract.methods.cfDb(cfId).call()
      .then(result => {
        var d = parseInt(result.deadline) - Date.now()/1000
        document.getElementById("cf_cause").innerHTML = getCause(result.catagory);
        $cf_deadline.innerHTML = (d<0?"Time Over":new Date(d * 1000).toISOString().substr(11, 8));
        $cf_totalContributors.innerHTML = result.totalContributors;
        $cf_goal.innerHTML = weiToPkr(result.goal).toFixed(2);
        $cf_raisedAmount.innerHTML = weiToPkr(result.raisedAmount).toFixed(2);
        $CFAddress.value = result.admin;


        contribute_div.style.display = "none";
        refund_div.style.display = "none";
        withdraw_div.style.display = "none";
        if(d>0){
          contribute_div.style.display = "block";
        }else if(result.raisedAmount < result.goal){
          refund_div.style.display = "block";
        }else if(result.admin == getSelectedAccount()){
          withdraw_div.style.display = "block";
        }
        msgOk($msg);
        $msg.innerHTML = 'Stats updated.';
      })
      .catch(_e => {
        msgErr($msg);
        $msg.innerHTML = 'Ooops... there was an error while trying to get stats {' + _e + '}';
      });

    // })
    // .catch(_e => {
    //   $msg.innerHTML = 'Ooops... there was an error while trying to cfId {' + _e + '}';
    // });

  });


  $CFcontribute.addEventListener('submit', (e) =>{
    e.preventDefault();
    account = getSelectedAccount();
    const $msg = document.getElementById('CFcontribute_msg'); 
    var addr = $CFAddress.value;
    var cfId;
    // contract.methods.getCfIdFromAddress(addr).call()
    // .then(result => {
      // cfId = result;
      cfId = parseInt($cfId.value);
      var val = $CFcontributeAmount.value;
      val = Math.round(PkrToWei(val));
      contract.methods.cf_contribute(cfId).send({from: account,value:val,gas:gasLim })
      .then(result => {
        msgOk($msg);
        $msg.innerHTML = 'Contributed {'+val+' wei} successfully.';
      })
      .catch(_e => {
        msgErr($msg);
        $msg.innerHTML = 'Ooops... there was an error while trying to Contribute {' + _e + '}';
      });
    // })
    // .catch(_e => {
    //   $msg.innerHTML = 'Ooops... there was an error while trying to cfId {' + _e + '}';
    // });
  });

  $CFgetRefund.addEventListener('submit', (e) =>{
    e.preventDefault();

    const $msg = document.getElementById('CFgetRefund_msg'); 
    var addr = $CFAddress.value;
    var cfId;
    // contract.methods.getCfIdFromAddress(addr).call()
    // .then(result => {
    //   cfId = result;
    cfId = parseInt($cfId.value);
    var val = $CFcontributeAmount.value;
    contract.methods.cf_getRefund(cfId).send({from: account})
    .then(result => {
      msgOk($msg);
      $msg.innerHTML = 'Refunded successfully.';
    })
    .catch(_e => {
      msgErr($msg);
      $msg.innerHTML = 'Ooops... there was an error while trying to Refund {' + _e + '}';
    });

    // })
    // .catch(_e => {
    //   $msg.innerHTML = 'Ooops... there was an error while trying to cfId {' + _e + '}';
    // });
  });

  $CFwithdrawFunding.addEventListener('submit', (e) =>{
    e.preventDefault();
    const $msg = document.getElementById('CFwithdrawFunding_msg'); 
    var addr = $CFAddress.value;
    var cfId;
    // contract.methods.getCfIdFromAddress(addr).call()
    // .then(result => {
    //   cfId = result;
    cfId = parseInt($cfId.value);
    var val = $CFcontributeAmount.value;
    contract.methods.cf_withdrawFunding(cfId).send({from: account})
    .then(result => {
      msgOk($msg);
      $msg.innerHTML = 'Witdraw Funding successfull.';
    })
    .catch(_e => {
      msgErr($msg);
      $msg.innerHTML = 'Ooops... there was an error while trying to Withdraw {' + _e + '}';
    });
    // })
    // .catch(_e => {
    //   $msg.innerHTML = 'Ooops... there was an error while trying to cfId {' + _e + '}';
    // });
  });
};


const init_createOrg = () => {
  $createOrg.addEventListener('submit', (e) =>{
    e.preventDefault();
    account = getSelectedAccount();
    const $msg = document.getElementById('createOrg_msg');
    $msg.innerHTML = "Please wait....";
    // const orgName = e.target.elements[0].value;
    // const orgZakat = e.target.elements[1].value;
    // const rbs = $createOrg.querySelectorAll('input[name="orgZakat"]');
    // var orgZakat;
    // for (const rb of rbs) {
    //     if (rb.checked) {
    //         orgZakat = rb.value;
    //         orgZakat = parseInt(orgZakat);
    //         break;
    //     }
    // }
    // console.log(orgZakat);
    var orgName = document.getElementById("orgName").value;
    var orgAddress = document.getElementById("orgAddress").value;

    if(orgAddress.length < 42){
      msgErr($msg);
      $msg.innerHTML = 'Address not Valid!';
      return;
    }

    // contract.methods.createOrganization(Boolean(orgZakat),orgName).send({from:account,gas:gasLim })
    contract.methods.createOrganization(orgAddress,orgName).send({from:account,gas:gasLim })
    .then(result => {
      msgOk($msg);
      $msg.innerHTML = 'Created Organization successfully.';
    })
    .catch(_e => {
      msgErr($msg);
      $msg.innerHTML = 'Ooops... there was an error while creating Organization {' + _e + '}';
    });

    // contract.methods.getOrgDbCount().call()
    // .then(result => {
    //   $msg.innerHTML += result;
    // })
    // .catch(_e => {
    //   $msg.innerHTML += _e;
    // });
    $createOrg.reset();
  });
};


const init_currentOrgs = () => {
  $getCurrentOrgs.addEventListener('submit', (e) =>{
    e.preventDefault();
    account = getSelectedAccount();
    const $msg = document.getElementById('getCurrentOrgs_msg');
    msgWrn($msg);
    $msg.innerHTML = "Please wait...";
    var noOfOrgs = 0;
    // var tbl;
    // const $currentOrgs = document.getElementById('currentOrgs');
    // $currentCFs.innerHTML = "";
    contract.methods.getOrgDbCount().call()
    .then(result => {
      noOfOrgs = parseInt(result);
      // $currentOrgs.innerHTML = 'No of Orgs = ' + noOfOrgs + '<br>';
      document.getElementById("orgsRows").innerHTML ="<br>";
      for (var i = noOfOrgs-1; i>=0; i--) {
        console.log('i = ',i);
        contract.methods.orgDb(i.toString()).call()
        .then(result => {
          // console.log(result);
          // var tbl = "";
          // tbl += "<tr class=\"table-success\">";
          // // tbl += "<th scope=\"row\">"+"</th>";
          // tbl += "<td scope=\"row\">"+result.name+"</td>";
          // tbl += "<th scope=\"row\"> <a href=\"interact_with_organization?orgAddress=" +result.admin+" \" class=\"addr\" target=\"_blank\" >" +result.admin+"</a></th>";
          // tbl += "<td scope=\"row\">"+result.acceptingZakat+"</td>";
          // tbl += "<td scope=\"row\">"+Math.round(weiToPkr(result.balanceAmount))+" PKR</td>";
          // tbl += "</tr>";
          var row = "";
          row += '<a href="Donate_Organization.html?orgAddress='+result.admin+'" class=" btn btn-info" target="_blank">' + result.name + '</a><BR><BR>'
          document.getElementById("orgsRows").innerHTML+= row;
          
        })
        .catch(_e => {
          msgErr($msg);
          $msg.innerHTML = 'Ooops... there was an error while getting Orgs at index= {' + i + '} Error= {' + _e + '}';
        });
      }
      msgOk($msg);
      $msg.innerHTML = "List Updated...";
    })
    .catch(_e => {
      msgErr($msg);
      $msg.innerHTML = 'Ooops... there was an error while getting Orgs count {' + _e + '}';
    });
  });
};


const init_donateToOrg = () => {

  $populateOrgs.addEventListener('submit', (e) =>{
    e.preventDefault();
    const $msg = document.getElementById('org_msg');
    msgWrn($msg);
    $msg.innerHTML = "Please wait...";
    var noOfOrgs = 0;
    contract.methods.getOrgDbCount().call()
    .then(result => {
      noOfOrgs = parseInt(result);
      // $currentOrgs.innerHTML = 'No of Orgs = ' + noOfOrgs + '<br>';
      document.getElementById("orgsList").innerHTML ="<br>";
      for (var i = noOfOrgs-1; i>=0; i--) {
        // console.log('i = ',i);
        contract.methods.orgDb(i.toString()).call()
        .then(result => {
          var row = "<br>";
          row += '<option value="'+result.admin+'">'+result.name+'</option>'
          document.getElementById("orgsList").innerHTML+= row;
          var orgAdr = document.getElementById("orgAddress").value;
          if(orgAdr.length >= 42){
            document.getElementById("orgsList").value = orgAdr;
            const event = document.createEvent('Event');
            event.initEvent('submit', true, true);
            document.getElementById("updateWalletStats").dispatchEvent(event);
          }
        })
        .catch(_e => {
          msgErr($msg);
          $msg.innerHTML = 'Ooops... there was an error while getting Orgs at index= {' + i + '} Error= {' + _e + '}';
        });
      }
    })
    .catch(_e => {
      msgErr($msg);
      $msg.innerHTML = 'Ooops... there was an error while getting Orgs count {' + _e + '}';
    });
    msgOk($msg);
    $msg.innerHTML = "Organization List loaded successfully.";
  });

  $orgContribute.addEventListener('submit', (e) =>{
    e.preventDefault();
    account = getSelectedAccount();
    const $msg = document.getElementById('org_msg');
    msgWrn($msg);
    $msg.innerHTML = "Please wait...";
    // var addr = $orgAddress.value;
    var addr = document.getElementById("orgsList").value;
    var val = $orgContributeAmount.value;
    console.log("addr = ",addr);
    val = Math.round(PkrToWei(val)).toString();
    contract.methods.org_adr_donate(addr).send({from: account,value:val,gas:gasLim })
    .then(result => {
      msgOk($msg);
      $msg.innerHTML = 'Contributed {'+val+' wei} successfully.';
    })
    .catch(_e => {
      msgErr($msg);
      $msg.innerHTML = 'Ooops... there was an error while trying to Contribute {' + _e + '}';
    });

  });
};

const init_donateToIndividual = () => {

  document.getElementById('donateToIndividual').addEventListener('submit', (e) =>{
    e.preventDefault();
    account = getSelectedAccount();
    const $msg = document.getElementById('msg');
    msgWrn($msg);
    $msg.innerHTML = "Please wait...";
    var addr = document.getElementById('account').value;
    var val = document.getElementById('amount').value;
    if(addr.length < 42){
      msgErr($msg);
      $msg.innerHTML = "Invalid Address";
      return;
    }
    val = Math.round(PkrToWei(val));
    // contract.methods.org_adr_donate(addr).send({from: account,value:val,gas:gasLim })
    web3.eth.sendTransaction({to:addr, from:account, value:val})
    .then(result => {
      msgOk($msg);
      $msg.innerHTML = 'Donated {'+val+' wei} successfully.';
    })
    .catch(_e => {
      msgErr($msg);
      $msg.innerHTML = 'Ooops... there was an error while trying to Donate {' + _e + '}';
    });
    $msg = "<br>";
  });
};


const init_updateTransactionStats = () =>{

  document.getElementById("updateWalletStats").addEventListener('submit', (e) =>{
    e.preventDefault();
    const $msg = document.getElementById('wallet_msg');
    msgWrn($msg);
    $msg.innerHTML = "Please wait...";
    // var addr = $orgAddress.value;
    // var addr = getSelectedAccount();
    var addr = document.getElementById("orgsList").value;
    if(addr.length < 42){
      msgErr($msg);
      $msg.innerHTML = "Invalid Address";
      return;
    }
    var orgId;
    contract.methods.getOrgIdFromAddress(addr).call()
    .then(result => {
      orgId = result
      contract.methods.orgDb(orgId).call()
      .then(result => {
        document.getElementById("org_name").innerHTML = result.name;
        document.getElementById("org_address").value = addr;
        document.getElementById("org_totalCollected").value = weiToPkr(result.donateTotal).toFixed();
        document.getElementById("org_totalDistributed").value = weiToPkr(result.withdrawTotal).toFixed();
        // $org_zakat.innerHTML = result.acceptingZakat;
        document.getElementById("org_balanceAmount").value = weiToPkr(result.balanceAmount).toFixed();// + " PKR";
         // $msg.innerHTML = "Done...";
       })
      .catch(_e => {
        msgErr($msg);
        $msg.innerHTML = 'Ooops... there was an error while trying to get stats {' + _e + '}';
      });

    })
    .catch(_e => {
      msgErr($msg);
      $msg.innerHTML = 'Ooops... there was an error while trying to get orgId {' + _e + '}';
    });
    getCredit(addr)
    .then(() =>{
      msgOk($msg);
      $msg.innerHTML = "Stats Updated.";
    });
  });

}


const init_wallet = () => {
  document.getElementById("orgWithdraw").addEventListener('submit', (e) =>{
    e.preventDefault();

    var fileTag = document.getElementById("images_withdraw");
    if(fileTag.value.length == 0)
    {
      alert("Please select document");
      return;
    }

    account = getSelectedAccount();
    const $msg = document.getElementById('orgWithdraw_msg'); 
    var val = document.getElementById("withdrawAmount").value;
    val = Math.round(PkrToWei(val));
    // contract.methods.org_withdraw(val).send({from: account})//,gas:gasLim })
    // .then(result => {
    //   $msg.innerHTML = 'Withdraw {' + val + ' wei} successfully.';
    // })
    // .catch(_e => {
    //   $msg.innerHTML = 'Ooops... there was an error while trying to Withdraw {' + _e + '}';
    // });

    contract.methods.getOrgIdFromAddress(account).call()
    .then(result => {
      var orgId = result
      contract.methods.orgDb(orgId).call()
      .then(result => {
        ////////
        if(result.balanceAmount >= val){
        contract.methods.org_withdraw(val).send({from: account})//,gas:gasLim })
        .on('transactionHash', function(hash){
          console.log("hash = ",hash);
          document.getElementById("txId_withdraw").value = hash;
          document.getElementById("file_upload_withdraw").submit();
          document.getElementById("frame_withdraw").style.display = "block";
        })
        .on('receipt', function(receipt){
          console.log("receipt = ",receipt);
          msgOk($msg);
          $msg.innerHTML = 'Withdraw {' + val + ' wei} successfully.';
        })
        .on('error', function(error){
          console.log("error = ",error);
          return;
        });
      }else{
        msgErr($msg);
        $msg.innerHTML = "Not Enough Balance";
      }
        /////////
      
      })
      .catch(_e => {
        msgErr($msg);
        $msg.innerHTML = 'Ooops... there was an error while trying to get stats {' + _e + '}';
      });

    })
    .catch(_e => {
      msgErr($msg);
      $msg.innerHTML = 'Ooops... there was an error while trying to get orgId {' + _e + '}';
    });
  });


  document.getElementById("updateWalletStats").addEventListener('submit', (e) =>{
    e.preventDefault();
    const $msg = document.getElementById('wallet_msg');
    msgWrn($msg);
    $msg.innerHTML = "Please wait...";
    // var addr = $orgAddress.value;
    var addr = getSelectedAccount();
    var orgId;
    contract.methods.getOrgIdFromAddress(addr).call()
    .then(result => {
      orgId = result
      contract.methods.orgDb(orgId).call()
      .then(result => {
        document.getElementById("org_name").innerHTML = result.name;
        document.getElementById("org_address").value = addr;
        document.getElementById("org_totalCollected").value = weiToPkr(result.donateTotal).toFixed();
        document.getElementById("org_totalDistributed").value = weiToPkr(result.withdrawTotal).toFixed();
        // $org_zakat.innerHTML = result.acceptingZakat;
        document.getElementById("org_balanceAmount").value = weiToPkr(result.balanceAmount).toFixed();// + " PKR";
         // $msg.innerHTML = "Done...";
       })
      .catch(_e => {
        msgErr($msg);
        $msg.innerHTML = 'Ooops... there was an error while trying to get stats {' + _e + '}';
      });

    })
    .catch(_e => {
      msgErr($msg);
      $msg.innerHTML = 'Ooops... there was an error while trying to get orgId {' + _e + '}';
    });
    getCredit(getSelectedAccount())
    .then(() =>{
      msgOk($msg);
      $msg.innerHTML = "Stats Updated.";
    });
  });


  document.getElementById("orgSend").addEventListener('submit', (e) =>{
    e.preventDefault();

    var fileTag = document.getElementById("images_send");
    if(fileTag.value.length == 0)
    {
      alert("Please select document");
      return;
    }

    account = getSelectedAccount();
    const $msg = document.getElementById('orgSend_msg'); 
    var val = document.getElementById("sendAmount").value;
    var sendAddress = document.getElementById("sendAddress").value;
    val = Math.round(PkrToWei(val));


    // contract.methods.org_send(sendAddress,val).send({from: account})//,gas:gasLim })
    // .then(result => {
    //   $msg.innerHTML = 'Sent {' + val + ' wei to '+ sendAddress +'} successfully.';
    // })
    // .catch(_e => {
    //   $msg.innerHTML = 'Ooops... there was an error while trying to Send Amount {' + _e + '}';
    // });

    contract.methods.getOrgIdFromAddress(account).call()
    .then(result => {
      var orgId = result
      contract.methods.orgDb(orgId).call()
      .then(result => {

    /////////////////
    if(result.balanceAmount >= val){
    contract.methods.org_send(sendAddress,val).send({from: account})//,gas:gasLim })
    .on('transactionHash', function(hash){
          console.log("hash = ",hash);
          document.getElementById("txId_send").value = hash;
          document.getElementById("file_upload_send").submit();
          document.getElementById("frame_send").style.display = "block";
        })
        .on('receipt', function(receipt){
          console.log("receipt = ",receipt);
          msgOk($msg);
          $msg.innerHTML = 'Sent {' + val + ' wei to '+ sendAddress +'} successfully.';
        })
        .on('error', function(error){
          console.log("error = ",error);
          msgErr($msg);
          $msg.innerHTML = 'Ooops... there was an error while trying to Send Amount {' + error + '}';
          return;
        });
      }else{
        msgErr($msg);
        $msg.innerHTML = "Not Enough Balance";
      }
      
    /////////////////

    })
      .catch(_e => {
        msgErr($msg);
        $msg.innerHTML = 'Ooops... there was an error while trying to get stats {' + _e + '}';
      });

    })
    .catch(_e => {
      msgErr($msg);
      $msg.innerHTML = 'Ooops... there was an error while trying to get orgId {' + _e + '}';
    });

  });
};

async function getCredit(orgAddress){
  var endBlockNumber = await web3.eth.getBlockNumber();
  var startBlockNumber = 0;
  var func = "org_adr_donate";

  var $creditTbl = document.getElementById("creditTbl");
  var $debitTbl = document.getElementById("debitTbl");
  $creditTbl.innerHTML = "<br>";
  $debitTbl.innerHTML = "<br>";

  // for (var i = startBlockNumber; i <= endBlockNumber; i++) {
  for (var i = endBlockNumber; i >= startBlockNumber; i--) {
    if (i % 1000 == 0) {
      console.log("Searching block " + i);
    }
    var block = await web3.eth.getBlock(i, true);
    if (block != null && block.transactions != null) {
      block.transactions.forEach( function(e) {
        var dec = abiDecoder.decodeMethod(e.input);
        if(dec){
          // console.log("parameter = ",dec["params"][0]["value"]);


          if(dec["name"] == "org_adr_donate" && (dec["params"][0]["value"].toLowerCase() == orgAddress.toLowerCase() || orgAddress == "*"))
          {
            $creditTbl.innerHTML += '<tr><td>'
            +e.from
            +'</td><td>'
            +weiToPkr(e.value).toFixed(2)
            +'</td><td> '
            + new Date(block.timestamp * 1000).toLocaleString([], { hour12: true}) 
            +'</td></tr>';
            // console.log("\n"
            //   + "   from            : " + e.from + "\n" 
            //   + "   to              : " + e.to + "\n"
            //   + "   value           : " + e.value + "\n"
            //   + "   time            : " + block.timestamp + " " + new Date(block.timestamp * 1000).toGMTString() + "\n"
            //   );
          }


          if(dec["name"] == "org_send" && (e.from.toLowerCase() == orgAddress.toLowerCase() || orgAddress == "*"))
          {
            $debitTbl.innerHTML += '<tr><td>'
            +dec["params"][0]["value"]
            +'</td><td>'
            +weiToPkr(parseInt(dec["params"][1]["value"])).toFixed(2)
            +'</td><td>Send</td><td> '
            + new Date(block.timestamp * 1000).toLocaleString([], { hour12: true}) 
            +'</td><td> '
            + '<a class="btn btn-info" href="Org_View_Images.html?address='+orgAddress.toLowerCase()+'&txId='+e.hash.toLowerCase()+'" target="_blank">View</a>'
            +'</td></tr>';
            // console.log("\n"
            //   + "   from            : " + e.from + "\n" 
            //   + "   to              : " + e.to + "\n"
            //   + "   value           : " + e.value + "\n"
            //   + "   time            : " + block.timestamp + " " + new Date(block.timestamp * 1000).toGMTString() + "\n"
            //   );
          }


          if(dec["name"] == "org_withdraw" && (e.from.toLowerCase() == orgAddress.toLowerCase() || orgAddress == "*"))
          {
            $debitTbl.innerHTML += '<tr><td>'
            +e.from
            +'</td><td>'
            +weiToPkr(parseInt(dec["params"][0]["value"])).toFixed(2)
            +'</td><td>Withdraw</td><td> '
            + new Date(block.timestamp * 1000).toLocaleString([], { hour12: true}) 
            +'</td><td> '
            + '<a class="btn btn-info" href="Org_View_Images.html?address='+orgAddress.toLowerCase()+'&txId='+e.hash.toLowerCase()+'" target="_blank">View</a>'
            +'</td></tr>';


            // console.log("\n"
            //   + "   from            : " + e.from + "\n" 
            //   + "   to              : " + e.to + "\n"
            //   + "   value           : " + e.value + "\n"
            //   + "   time            : " + block.timestamp + " " + new Date(block.timestamp * 1000).toGMTString() + "\n"
            //   );
          }
        }
      })
    }
  }
}


const init_auto = () => {
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
  console.log("dom loaded");
  const deploymentKey = Object.keys(Contract.networks)[0];
  console.log("Contract Address = ",Contract.networks[deploymentKey].address);
});

function copyInputElement(elementID = "yourAccount") {
  var copyText = document.getElementById(elementID);
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */
  document.execCommand("copy");
}

function getSelectedAccount(elementID = "currentAccount"){
  var acc = document.getElementById(elementID).value;
  console.log("acc = ",acc);
  // var acc = account;
  return acc;
}

function getRate(elementID = "rate"){
  var rate = document.getElementById(elementID);
  var rate = rate.value;
  return rate;
}

function weiToPkr(wei){
  return (wei/getRate());
}

function PkrToWei(pkr){
  return (pkr*getRate());
}

function init_balance(){
  account = getSelectedAccount();
  web3.eth.getBalance(account)
  .then(balance =>{
    document.getElementById('balance').innerHTML = web3.utils.fromWei(balance) + ' ETH';
    document.getElementById('balancePKR').innerHTML = Math.round(weiToPkr(balance)) + ' PKR';
  });
}

function getDurationInSec(elementID = "duration")
{
  var t = 0;
  var input = document.getElementById(elementID);
  var d = input.value.split(":");
  t += parseInt(d[0]) * 60 * 60;
  t += parseInt(d[1]) * 60;
  t += parseInt(d[2]);
  console.log(t);
  return t;
}

function getCause (c) {
  c = parseInt(c);
  var r = ""  ;
  switch(c){
    case 1:
    r = "Education";
    break;
    case 2:
    r = "Medical";
    break;
    case 3:
    r = "Financial";
    break;
    case 4:
    r = "Disaster";
    break;
    case 5:
    r = "Welfare";
    break;
    case 6:
    r = "Food";
    break;
    default:
    r = "Other";
    break;
  }
  return r;
}

function id(elementID) {
  return document.getElementById(elementID);
}

function msgOk(msg) {
  msg.classList.remove("alert-danger");
  msg.classList.remove("alert-info");
  msg.classList.remove("alert-warning");
  msg.classList.add("alert-success");
  msg.classList.remove("is-invalid");
  msg.classList.add("is-valid");
}

function msgWrn(msg) {
  msg.classList.remove("alert-success");
  msg.classList.remove("alert-info");
  msg.classList.remove("alert-danger");
  msg.classList.add("alert-warning");
  msg.classList.remove("is-valid");
  msg.classList.remove("is-invalid");
}

function msgErr(msg) {
  msg.classList.remove("alert-success");
  msg.classList.remove("alert-info");
  msg.classList.remove("alert-warning");
  msg.classList.add("alert-danger");
  msg.classList.remove("is-valid");
  msg.classList.add("is-invalid");
}


// =X=X=X=X=X=X=X=X=X=X=X=X=X=X=X=X=X=X=X=X=X Testing =X=X=X=X=X=X=X=X=X=X=X=X=X=X=X=X=X=X=X=X=X=X


async function getTransactionsByAccount(myaccount, startBlockNumber, endBlockNumber) {
  if (endBlockNumber == null) {
    endBlockNumber = await web3.eth.getBlockNumber();
    // (async ()=> { await web3.eth.getBlockNumber().then(d =>{ endBlockNumber = d}) })();
    console.log("Using endBlockNumber: " + endBlockNumber);
  }
  if (startBlockNumber == null) {
    // startBlockNumber = endBlockNumber - 1000;
    startBlockNumber = 0;
    console.log("Using startBlockNumber: " + startBlockNumber);
  }
  console.log("Searching for transactions to/from account \"" + myaccount + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber);

  for (var i = startBlockNumber; i <= endBlockNumber; i++) {
    if (i % 1000 == 0) {
      console.log("Searching block " + i);
    }
    var block = await web3.eth.getBlock(i, true);
    if (block != null && block.transactions != null) {
      block.transactions.forEach( function(e) {
        var dec = abiDecoder.decodeMethod(e.input);
        if ((myaccount == "*" || myaccount == e.from || myaccount == e.to) /*&& (dec?abiDecoder.decodeMethod(e.input)["name"] == "org_adr_donate":false)*/) {
          console.log(""
            + "  tx hash          : " + e.hash + "\n"
            // + "   nonce           : " + e.nonce + "\n"
            + "   blockHash       : " + e.blockHash + "\n"
            + "   blockNumber     : " + e.blockNumber + "\n"
            // + "   transactionIndex: " + e.transactionIndex + "\n"
            + "   from            : " + e.from + "\n" 
            + "   to              : " + e.to + "\n"
            + "   value           : " + e.value + "\n"
            + "   time            : " + block.timestamp + " " + new Date(block.timestamp * 1000).toGMTString() + "\n"
            + "   gasPrice        : " + e.gasPrice + "\n"
            + "   gas             : " + e.gas + "\n"
            // + "   input           : " + e.input
            );
          console.log("ABI Decoded = ",dec);
          if(dec){
           console.log("abiDecoder = ",dec["name"]);
         }
       }
     });
    }
  }
}


// =x=x=x=x=x=x=x=x=x=x=x=x=x=x=x=x=x=x=x=x=x Testing =x=x=x=x=x=x=x=x=x=x=x=x=x=x=x=x=x=x=x=x=x=x




window.getAccount = function(){
  return account;
}


window.account = account;
window.initApp = initApp;
window.initWeb3 = initWeb3;
window.accountSelector = accountSelector;
window.accountSelectorEnabled = accountSelectorEnabled;
window.initContract = initContract;
window.init_auto = init_auto;
window.init_doVote = init_doVote;
window.init_createCF = init_createCF;
window.init_currentCFs = init_currentCFs;
window.init_applyVoting = init_applyVoting;
window.init_interactWithCFs = init_interactWithCFs;
window.init_getVotingStats = init_getVotingStats;
window.init_createOrg = init_createOrg;
window.init_currentOrgs =init_currentOrgs;
window.init_donateToOrg = init_donateToOrg;
window.init_donateToIndividual = init_donateToIndividual;
window.init_balance = init_balance;
window.init_wallet = init_wallet;
window.init_updateTransactionStats = init_updateTransactionStats;

window.msgOk = msgOk;
window.msgWrn = msgWrn;
window.msgErr = msgErr;

window.init_getVotingList = init_getVotingList;

window.getCause = getCause;

window.getTransactionsByAccount = getTransactionsByAccount;
window.getCredit = getCredit;


/*Links
https://github.com/ConsenSys/abi-decoder
https://ethereum.stackexchange.com/questions/32959/how-to-use-web3-to-send-money-from-wallet-a-to-wallet-b
*/