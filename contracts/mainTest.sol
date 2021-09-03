// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// pragma solidity >=0.4.22 <0.6.0;

contract mainTest{   


// ######################### Voting #########################
    
    struct voting{
        mapping(address=>uint) votersIdx;
        bool[] alreadyVoted;
        uint deadline;
        uint positiveVotes;
        uint negativeVotes;
        bool valid;
        uint amount;
        uint8 catagory;
    }
    
    // voting[] public votingDb;
    // mapping(address=>voting) votingDb;
    
    // uind id = votingIdxDb[Address] - 1;
    // votingDb[id];
    
    voting[] public votingDb;
    mapping (address => uint) votingIdxDb;
    
    
    function createVoting(uint deadline,uint _amount, uint8 _catagory) public {
        if(votingIdxDb[msg.sender] > 0){
            require(votingDb[votingIdxDb[msg.sender] - 1].deadline < now,"Deadline not over yet.");
        }
        // require(votingIdxDb[msg.sender] == 0,"Voting Already Exists.");
        if(cfIdxDb[msg.sender]>0){
            require(cfDb[cfIdxDb[msg.sender] - 1].deadline<now,"Crowdfunding Exists and deadline not over yet.");
        }
        voting memory v;
        v.positiveVotes = 0;
        v.negativeVotes = 0;
        v.deadline = deadline + now;
        v.valid = true;
        v.amount = _amount;
        v.catagory = _catagory;
        votingDb.push(v);
        votingIdxDb[msg.sender] = votingDb.length;
    }
    
    function vote(address votingId,bool doYouAgree) public {
        require(votingId != msg.sender,"Admin Cannot Vote!");
        uint id = votingIdxDb[votingId] - 1;
        require(votingDb[id].deadline>now,"Voting deadline over!");
        uint idx = votingDb[id].votersIdx[msg.sender];
        if(idx+1 > votingDb[id].alreadyVoted.length){
            votingDb[id].alreadyVoted.push(true);
            votingDb[id].votersIdx[msg.sender] = votingDb[id].alreadyVoted.length - 1;
        }else{
            require(votingDb[id].alreadyVoted[idx] == false,"Already Voted!");
        }
        
        if(doYouAgree){
            votingDb[id].positiveVotes++;
        }else{
            votingDb[id].negativeVotes++;
        }
        
    }

    function getVotingStatus(address votingId) view public returns(
            uint positiveVotes,
            uint negativeVotes,
            uint deadline,
            uint amount,
            uint8 catagory
        ) {
        require(votingIdxDb[votingId] != 0,"Voting does not exists on this address.");
        uint id = votingIdxDb[votingId] - 1;
        return (
            votingDb[id].positiveVotes,
            votingDb[id].negativeVotes,
            votingDb[id].deadline,
            votingDb[id].amount,
            votingDb[id].catagory
        );
    }
    
    
    function isEligible(address votingId) view public returns(bool) {
        //Some logic
        uint id = votingIdxDb[votingId] - 1;
        return (votingDb[id].positiveVotes > votingDb[id].negativeVotes);
    }
    
    
        
    
    
    // function vote(address votingId,bool doYouAgree) public{
    //     uint vIdx = votingDb[votingId].votersIdx[msg.sender];
        
    //     require(votingDb[votingId].votersChoice[vIdx] == false,"Already Voted!");
    //     uint idx = votingDb[msg.sender].index;
    //     if(doYouAgree){
    //         votingDb[votingId].positiveVotes++;
    //     }else{
    //         votingDb[votingId].negativeVotes++;
    //     }
    //     votingDb[votingId].voters[msg.sender] = true;
    // }

// X-X-X-X-X-X-X-X-X-X-X-X-X Voting X-X-X-X-X-X-X-X-X-X-X-X-X
    
    
// ######################### Crowd Funding #########################
    struct crowdFund{
        mapping(address=>uint) contributions;
        uint totalContributors;    
        uint deadline;             
        uint goal;                 
        uint raisedAmount ;    
        uint8 catagory;
        address payable admin;
    }
    
    crowdFund[] public cfDb;
    mapping (address => uint) cfIdxDb;
    
    
    function getCfDbCount() view public returns(uint){
        return cfDb.length;
    }
    
    // function getCfIdFromAddress(address cfAddress) view public returns(uint){
    //     for(uint i=0;i<cfDb.length;i++){
    //         if(cfDb[i].admin == cfAddress){
    //             return i;
    //         }
    //     }
    // }

    function getCfIdFromAddress(address cfAddress) view public returns(uint){
        return (cfIdxDb[cfAddress] - 1);
    }
    
    function createCrowdFund(uint _deadlineSecs) public{
        uint id = votingIdxDb[msg.sender] - 1;
        require(votingIdxDb[msg.sender] != 0,"Not Valid. First Apply for voting.");
        // require(votingDb[id].valid,"Not Valid. First Apply for voting.!");
        require(isEligible(msg.sender),"Not Eligible. No enough votes.");
        require(votingDb[id].deadline < now,"Voting deadline not over yet!");
        crowdFund memory cf;
        cf.deadline= now + _deadlineSecs;
        cf.goal= votingDb[id].amount;
        cf.catagory = votingDb[id].catagory;
        cf.admin = msg.sender;
        cfDb.push(cf);
        // votingDb[id].valid = false;
        votingIdxDb[msg.sender] = 0;
        cfIdxDb[msg.sender] = cfDb.length;
    }
    
    function cf_contribute(uint cfId) public payable {
        require(now < cfDb[cfId].deadline,"Time is Over!");
        if(cfDb[cfId].contributions[msg.sender] == 0)
        {
            cfDb[cfId].totalContributors++;
        }
        cfDb[cfId].contributions[msg.sender] += msg.value;
        cfDb[cfId].raisedAmount+=msg.value;
    }
    
    //Get Refund if goal is not reached within the set deadline.
    function cf_getRefund(uint cfId) public {
        require(now > cfDb[cfId].deadline,"Deadline is not Over!");
        require(cfDb[cfId].raisedAmount < cfDb[cfId].goal,"Goal is reached.You cannot refund!");
        require(cfDb[cfId].contributions[msg.sender] > 0,"You haven't Contributed!");
        msg.sender.transfer(cfDb[cfId].contributions[msg.sender]);
        cfDb[cfId].raisedAmount -= cfDb[cfId].contributions[msg.sender];
        cfDb[cfId].contributions[msg.sender] = 0;
    }
    
    function cf_withdrawFunding(uint cfId) public {
        require(msg.sender == cfDb[cfId].admin,"Only Admin is allowed!");
        require(cfDb[cfId].raisedAmount >= cfDb[cfId].goal,"Goal amount not reached!");
        cfDb[cfId].admin.transfer(cfDb[cfId].raisedAmount);
    }
    
    // function cf_getRemainingTime(uint cfId) view public returns(uint) {
    //    return cfDb[cfId].deadline - now;
    // }
// X-X-X-X-X-X-X-X-X-X-X-X-X Crowd Funding X-X-X-X-X-X-X-X-X-X-X-X-X

// ######################### Organization #########################

    struct organization{
        address payable admin;
        string name;
        bool acceptingZakat;
        uint balanceAmount;
    }
    
    organization[] public orgDb;
    mapping (address => uint) orgIdxDb;
    
    
    function getOrgDbCount() view public returns(uint){
        return orgDb.length;
    }

    function getOrgIdFromAddress(address orgAddress) view public returns(uint){
        require (orgIdxDb[orgAddress] > 0,"Organization Does Not Exists.");
        return (orgIdxDb[orgAddress] - 1);
    }
    
    event Deposit(address indexed _from, uint _value);
    
    function createOrganization(bool _acceptingZakat,string memory orgName) public {
        require (orgIdxDb[msg.sender] == 0,"Organization Already Exists on this Account.");
        organization memory org;
        org.admin = msg.sender;
        org.name = orgName;
        org.acceptingZakat = _acceptingZakat;
        orgDb.push(org);
        orgIdxDb[msg.sender] = orgDb.length;
    }

    function org_id_donate(uint orgId) public payable {
        require (orgId > 0,"Organization Does Not Exists.");
        orgDb[orgId].balanceAmount += msg.value;
        // emit Deposit(msg.sender, msg.value);
    }

    function org_adr_donate(address orgAdr) public payable {
        require (orgIdxDb[orgAdr] > 0,"Organization Does Not Exists.");
        orgDb[orgIdxDb[orgAdr]-1].balanceAmount += msg.value;
        // emit Deposit(msg.sender, msg.value);
    }
    
    function org_withdraw(uint amount) public {
        require (orgIdxDb[msg.sender] > 0,"Organization Does Not Exists.");
        uint id = orgIdxDb[msg.sender]-1;
        require(msg.sender == orgDb[id].admin,"Only Admin is allowed!");
        require(orgDb[id].balanceAmount >= amount,"Not enough balance!");
        orgDb[id].admin.transfer(amount);
        orgDb[id].balanceAmount-= amount;
    }
    
    // function org_donate(uint orgId) public payable {
    //     orgDb[orgId].balanceAmount += msg.value;
    //     emit Deposit(msg.sender, msg.value);
    // }
    
    // function org_withdraw(uint amount,uint orgId) public {
    //     require(msg.sender == orgDb[orgId].admin,"Only Admin is allowed!");
    //     orgDb[orgId].admin.transfer(amount);
    // }
// X-X-X-X-X-X-X-X-X-X-X-X-X Ororganization X-X-X-X-X-X-X-X-X-X-X-X-X
    
    
    









// ######################### Main #########################

// X-X-X-X-X-X-X-X-X-X-X-X-X Main X-X-X-X-X-X-X-X-X-X-X-X-X

}

// contract main{
//     address[] public contracts;
//     function createCrowdFund (uint _deadlineSecs,uint _goal) 
//     public 
//     returns(address newContract){
//         crowdFund cf = new crowdFund(_deadlineSecs,_goal);
//         contracts.push(address(cf));
//         return address(cf);
//     }
    
//     function getNow(uint id) view public returns(uint) {
//         uint n = crowdFund(contracts[id]).getNow();
//         return n;
//     }
// }




    // bool[] public tst;
    
    // function pushTst(bool val) public{
    //     tst.push(val);
    // }
    
    // function lenTst() view public returns(uint){
    //     return tst.length;
    // }
    
    // function delTst() public{
    //     delete tst;
    // }