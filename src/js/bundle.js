// import Web3 from '../ext/web3';
// import Web3 from '../ext/web3.min.js';
import Contract from '../../build/contracts/mainTest.json';

import './bootstrap.bundle.min.js'
import '../css/bootstrap.min.css'
import '../css/myCss.css'

let web3;
let contract;
let accounts = [];
let account = '';
let accountSelectorEnabled = true;

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

  // let accounts = [];
  // let account = '';

  web3.eth.getAccounts()
  .then(_accounts => {
    // try{
      presets();
    // }catch(err){
    //   console.log(err.message);
    // };
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
      });
    }
  });
}

const init_applyVoting = (inputIndex = 0) => {

  $createVoting.addEventListener('submit', (e) => {
    e.preventDefault();
    account = getSelectedAccount();
    const $msg = document.getElementById('createVoting_msg');
    $msg.innerHTML = "Please wait....";
    const val = e.target.elements[inputIndex].value;
    // console.log("account =",account);
    // console.log("val =",val);
    contract.methods.createVoting(val).send({from:account})
    .then(result => {
      $msg.innerHTML = 'Created Voting successfully.<br>';
      $msg.innerHTML+= '<a href="./vote?canidateAddress='+account+'" target="_blank" >Go for Voting</a>';
    })
    .catch(_e => {
      $msg.innerHTML = 'Ooops... there was an error while creating Voting {' + _e + '}';
    });
  });
};

const init_getVotingStats = (addr = account) => {

  $getVotingStatus.addEventListener('submit', (e) =>{
    e.preventDefault();
    account = getSelectedAccount();
    contract.methods.getVotingStatus(account).call()
      .then(result => {
        // console.log("addr = ",addr);
        // console.log("Result = ",result);
        $positiveVotes.innerHTML = result.positiveVotes;
        $negativeVotes.innerHTML = result.negativeVotes;
        $VSDeadline.innerHTML = parseInt(result.deadline) - parseInt(Date.now()/1000);
      })
      .catch(_e => {
        console.log("Error = ",_e);
      });
  });
};


const init_doVote = () => {

  $doVote.addEventListener('submit', (e) => {
    e.preventDefault();
    account = getSelectedAccount();
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
};

const init_createCF = () => {
  $createCF.addEventListener('submit', (e) =>{
    e.preventDefault();
    account = getSelectedAccount();
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
};

const init_currentCFs = () => {
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
      for (var i = noOfCFs-1; i>=0; i--) {
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
          tbl += "<tr class=\""+(d>0?"table-success":"table-danger")+"\">";
          // tbl += "<th scope=\"row\">"+"</th>";
          tbl += "<th scope=\"row\">" + (d<0?result.admin:"<a href=\"interact_with_crowd_funding?cfAddress="+result.admin+"');\" class=\"addr\" target=\"_blank\" >" +result.admin+"</a>")+"</th>";
          tbl += "<td scope=\"row\">"+result.raisedAmount+"</td>";
          tbl += "<td scope=\"row\">"+result.goal+"</td>";
          tbl += "<td scope=\"row\">"+result.totalContributors+"</td>";
          tbl += "<td scope=\"row\">"+(d<0?"Time Over":new Date(d * 1000).toISOString().substr(11, 8))+"</td>";
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
};

const init_interactWithCFs = () => {

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
};


const init_createOrg = () => {
  $createOrg.addEventListener('submit', (e) =>{
    e.preventDefault();
    account = getSelectedAccount();
    const $msg = document.getElementById('createOrg_msg');
    $msg.innerHTML = "Please wait....";
    const orgName = e.target.elements[0].value;
    // const orgZakat = e.target.elements[1].value;
    const rbs = $createOrg.querySelectorAll('input[name="orgZakat"]');
    var orgZakat;
    for (const rb of rbs) {
        if (rb.checked) {
            orgZakat = rb.value;
            orgZakat = parseInt(orgZakat);
            break;
        }
    }
    console.log(orgZakat);
    contract.methods.createOrganization(Boolean(orgZakat),orgName).send({from:account,gas:3000000})
    .then(result => {
      $msg.innerHTML = 'Created Organization successfully.';
    })
    .catch(_e => {
      $msg.innerHTML = 'Ooops... there was an error while creating Organization {' + _e + '}';
    });

    // contract.methods.getOrgDbCount().call()
    // .then(result => {
    //   $msg.innerHTML += result;
    // })
    // .catch(_e => {
    //   $msg.innerHTML += _e;
    // });
  });
};


const init_currentOrgs = () => {
  $getCurrentOrgs.addEventListener('submit', (e) =>{
    e.preventDefault();
    account = getSelectedAccount();
    const $msg = document.getElementById('getCurrentOrgs_msg');
    // $msg.innerHTML = "Please wait....";
    var noOfOrgs = 0;
    // var tbl;
    const $currentOrgs = document.getElementById('currentOrgs');
    // $currentCFs.innerHTML = "";
    contract.methods.getOrgDbCount().call()
    .then(result => {
      noOfOrgs = parseInt(result);
      $currentOrgs.innerHTML = 'No of Orgs = ' + noOfOrgs + '<br>';
      document.getElementById("OrgsRows").innerHTML ="";
      for (var i = noOfOrgs-1; i>=0; i--) {
        console.log('i = ',i);
        contract.methods.orgDb(i.toString()).call()
        .then(result => {
          // console.log(result);
          var tbl = "";
          tbl += "<tr class=\"table-success\">";
          // tbl += "<th scope=\"row\">"+"</th>";
          tbl += "<td scope=\"row\">"+result.name+"</td>";
          tbl += "<th scope=\"row\"> <a href=\"interact_with_organization?cfAddress=" +result.admin+" \" class=\"addr\" target=\"_blank\" >" +result.admin+"</a></th>";
          tbl += "<td scope=\"row\">"+result.acceptingZakat+"</td>";
          tbl += "<td scope=\"row\">"+result.balanceAmount+"</td>";
          tbl += "</tr>";
          document.getElementById("OrgsRows").innerHTML+= tbl;
        })
        .catch(_e => {
          $msg.innerHTML = 'Ooops... there was an error while getting Orgs at index= {' + i + '} Error= {' + _e + '}';
        });
      }
    })
    .catch(_e => {
      $msg.innerHTML = 'Ooops... there was an error while getting Orgs count {' + _e + '}';
    });
  });
};


// const init_interactWithOrgs = () => {

//   $updateCfStats.addEventListener('submit', (e) => {
//     e.preventDefault();
//     var addr = $CFAddress.value;
//     var cfId;
//     contract.methods.getCfIdFromAddress(addr).call()
//     .then(result => {
//       cfId = result
//       // $cf_deadline.innerHTML = cfId;

//       contract.methods.cfDb(cfId).call()
//       .then(result => {
//         $cf_deadline.innerHTML = result.deadline;
//         $cf_totalContributors.innerHTML = result.totalContributors;
//         $cf_goal.innerHTML = result.goal;
//         $cf_raisedAmount.innerHTML = result.raisedAmount;
//       })
//       .catch(_e => {
//         $cf_deadline.innerHTML = 'Ooops... there was an error while trying to get stats {' + _e + '}';
//       });

//     })
//     .catch(_e => {
//       $cf_deadline.innerHTML = 'Ooops... there was an error while trying to cfId {' + _e + '}';
//     });

//   });


//   $CFcontribute.addEventListener('submit', (e) =>{
//     e.preventDefault();

//     const $msg = document.getElementById('CFcontribute_msg'); 
//     var addr = $CFAddress.value;
//     var cfId;
//     contract.methods.getCfIdFromAddress(addr).call()
//     .then(result => {
//       cfId = result;
//       var val = $CFcontributeAmount.value;
//       contract.methods.cf_contribute(cfId).send({from: account,value:val,gas:3000000})
//       .then(result => {
//         $msg.innerHTML = 'Contributed {'+val+'} successfully.';
//       })
//       .catch(_e => {
//         $msg.innerHTML = 'Ooops... there was an error while trying to Contribute {' + _e + '}';
//       });
//     })
//     .catch(_e => {
//       $msg.innerHTML = 'Ooops... there was an error while trying to cfId {' + _e + '}';
//     });
//   });

//   $CFgetRefund.addEventListener('submit', (e) =>{
//     e.preventDefault();

//     const $msg = document.getElementById('CFgetRefund_msg'); 
//     var addr = $CFAddress.value;
//     var cfId;
//     contract.methods.getCfIdFromAddress(addr).call()
//     .then(result => {
//       cfId = result;
//       var val = $CFcontributeAmount.value;
//       contract.methods.cf_getRefund(cfId).send({from: account})
//       .then(result => {
//         $msg.innerHTML = 'Refunded successfully.';
//       })
//       .catch(_e => {
//         $msg.innerHTML = 'Ooops... there was an error while trying to Refund {' + _e + '}';
//       });
      
//     })
//     .catch(_e => {
//       $msg.innerHTML = 'Ooops... there was an error while trying to cfId {' + _e + '}';
//     });
//   });

//   $CFwithdrawFunding.addEventListener('submit', (e) =>{
//     e.preventDefault();
//     const $msg = document.getElementById('CFwithdrawFunding_msg'); 
//     var addr = $CFAddress.value;
//     var cfId;
//     contract.methods.getCfIdFromAddress(addr).call()
//     .then(result => {
//       cfId = result;
//       var val = $CFcontributeAmount.value;
//       contract.methods.cf_withdrawFunding(cfId).send({from: account})
//       .then(result => {
//         $msg.innerHTML = 'Refunded successfully.';
//       })
//       .catch(_e => {
//         $msg.innerHTML = 'Ooops... there was an error while trying to Refund {' + _e + '}';
//       });
//     })
//     .catch(_e => {
//       $msg.innerHTML = 'Ooops... there was an error while trying to cfId {' + _e + '}';
//     });
//   });
// };



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
});

function copyInputElement(elementID = "yourAccount") {
  var copyText = document.getElementById(elementID);
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */
  document.execCommand("copy");
}

function getSelectedAccount(elementID = "currentAccount"){
  var acc = document.getElementById(elementID).innerHTML;
  console.log("acc = ",acc);
  // var acc = account;
  return acc;
}

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
