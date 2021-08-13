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
    }
    
    // voting[] public votingDb;
    mapping(address=>voting) votingDb;
    
    
    function createVoting(uint deadline) public {
        require(now>votingDb[msg.sender].deadline,"Voting Already Exists.");
        delete votingDb[msg.sender].alreadyVoted;
        votingDb[msg.sender].positiveVotes = 0;
        votingDb[msg.sender].negativeVotes = 0;
        votingDb[msg.sender].deadline = deadline + now;
        votingDb[msg.sender].valid = true;
    }
    
    function vote(address votingId,bool doYouAgree) public {
        require(votingId != msg.sender,"Admin Cannot Vote!");
        uint idx = votingDb[votingId].votersIdx[msg.sender];
        if(idx+1 > votingDb[votingId].alreadyVoted.length){
            votingDb[votingId].alreadyVoted.push(true);
            votingDb[votingId].votersIdx[msg.sender] = votingDb[votingId].alreadyVoted.length - 1;
        }else{
            require(votingDb[votingId].alreadyVoted[idx] == false,"Already Voted!");
        }
        
        if(doYouAgree){
            votingDb[votingId].positiveVotes++;
        }else{
            votingDb[votingId].negativeVotes++;
        }
        
    }

    function getVotingStatus(address votingId) view public returns(uint positiveVotes,uint negativeVotes,uint deadline) {
        return (votingDb[votingId].positiveVotes,votingDb[votingId].negativeVotes,votingDb[votingId].deadline);
    }
    
    
    function isEligible(address votingId) view public returns(bool) {
        //Some logic
        return (votingDb[votingId].positiveVotes > votingDb[votingId].negativeVotes);
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
        return (cfIdxDb[msg.sender] - 1);
    }
    
    function createCrowdFund(uint _deadlineSecs,uint _goal) public{
        require(votingDb[msg.sender].valid,"Not Valid. First Apply for voting.");
        require(isEligible(msg.sender),"Not Eligible. No enough votes.");
        require(votingDb[msg.sender].deadline < now,"Voting deadline not over yet!");
        crowdFund memory cf;
        cf.deadline= now + _deadlineSecs;
        cf.goal=_goal;
        cf.admin = msg.sender;
        cfDb.push(cf);
        votingDb[msg.sender].valid = false;
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
        orgDb[id].admin.transfer(amount);
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