// Smart Contract by Muhammad Fizan Saeed
pragma solidity >=0.4.22 <0.9.0;
contract myContract{   
    
    address payable public contractAdmin;
    constructor() public {
        contractAdmin = msg.sender;
    }
    
    function getAddrStatus(address addr) view public 
    returns(
    uint orgId,
    uint cfId,
    uint votingId
    ){
        return(
            orgIdxDb[addr],
            cfIdxDb[addr],
            votingIdxDb[addr]
        );
    }
// ######################### Voting #########################
    
    struct voting{
        mapping(address=>bool) votersIdx;
        uint votingDeadline;
        uint cfDeadline;
        uint positiveVotes;
        uint negativeVotes;
        uint amount;
        uint8 catagory;
        address admin;
    }
    
    voting[] public votingDb;
    mapping (address => uint) votingIdxDb;
    
    
     function getVotingDbCount() view public returns(uint){
        return votingDb.length;
    }
    
    
    function createVoting(uint deadline,uint cfDeadline,uint _amount, uint8 _catagory) public {
        if(votingIdxDb[msg.sender] > 0){
            require(votingDb[votingIdxDb[msg.sender] - 1].votingDeadline < now,"Deadline not over yet.");
        }
        if(cfIdxDb[msg.sender]>0){
            require(cfDb[cfIdxDb[msg.sender] - 1].deadline<now,"Crowdfunding Exists and deadline not over yet.");
        }
        voting memory v;
        v.positiveVotes = 0;
        v.negativeVotes = 0;
        v.votingDeadline = deadline + now;
        v.cfDeadline = cfDeadline;
        v.amount = _amount;
        v.catagory = _catagory;
        v.admin = msg.sender;
        votingDb.push(v);
        votingIdxDb[msg.sender] = votingDb.length;
    }
    
    function vote(address votingId,bool doYouAgree) public {
        require(votingId != msg.sender,"Admin Cannot Vote!");
        require (orgIdxDb[msg.sender] > 0,"Only Organizations can Vote!");
        uint id = votingIdxDb[votingId] - 1;
        require(votingDb[id].votingDeadline>now,"Voting deadline over!");
        require(votingDb[id].votersIdx[msg.sender] == false,"Already Voted!");
        votingDb[id].votersIdx[msg.sender] = true;
        
        if(doYouAgree){
            votingDb[id].positiveVotes++;
        }else{
            votingDb[id].negativeVotes++;
        }
        
        if(isEligible(votingId)){
            createCrowdFund(votingDb[id].admin);
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
            votingDb[id].votingDeadline,
            votingDb[id].amount,
            votingDb[id].catagory
        );
    }
    
    
    function isEligible(address votingId) view public returns(bool) {
        uint id = votingIdxDb[votingId] - 1;
        return (votingDb[id].positiveVotes >= votingDb[id].negativeVotes + 3);
    }
    
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
    function getCfIdFromAddress(address cfAddress) view public returns(uint){
        require(cfIdxDb[cfAddress] > 0,"CrowdFunding does not exists on this address!");
        return (cfIdxDb[cfAddress] - 1);
    }
    
        function createCrowdFund(address addr) public{//uint _deadlineSecs
        uint id = votingIdxDb[addr] - 1;
        require(votingIdxDb[addr] != 0,"Not Valid. First Apply for voting.");
        require(isEligible(addr),"Not Eligible. No enough votes.");
        votingDb[id].votingDeadline = now;
        crowdFund memory cf;
        cf.deadline = votingDb[id].cfDeadline + now;
        cf.goal= votingDb[id].amount;
        cf.catagory = votingDb[id].catagory;
        cf.admin = address(uint160(addr));
        cfDb.push(cf);
        cfIdxDb[addr] = cfDb.length;
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
    
// X-X-X-X-X-X-X-X-X-X-X-X-X Crowd Funding X-X-X-X-X-X-X-X-X-X-X-X-X
// ######################### Organization #########################
    struct organization{
        address payable admin;
        string name;
        // bool acceptingZakat;
        uint balanceAmount;
        uint donateTotal;
        uint withdrawTotal;
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
    
    function createOrganization(address payable addr,string memory orgName) public {
        require(msg.sender == contractAdmin,"Only Contract Admin can Create Organization!");
        require (orgIdxDb[addr] == 0,"Organization Already Exists on this Account.");
        organization memory org;
        org.admin = addr;
        org.name = orgName;
        orgDb.push(org);
        orgIdxDb[addr] = orgDb.length;
    }
    function org_id_donate(uint orgId) public payable {
        require (orgId > 0,"Organization Does Not Exists.");
        orgDb[orgId].balanceAmount += msg.value;
        orgDb[orgId].donateTotal += msg.value;
    }
    function org_adr_donate(address orgAdr) public payable {
        require (orgIdxDb[orgAdr] > 0,"Organization Does Not Exists.");
        orgDb[orgIdxDb[orgAdr]-1].balanceAmount += msg.value;
        orgDb[orgIdxDb[orgAdr]-1].donateTotal += msg.value;
    }
    
    function org_withdraw(uint amount) public {
        require (orgIdxDb[msg.sender] > 0,"Organization Does Not Exists.");
        uint id = orgIdxDb[msg.sender]-1;
        require(msg.sender == orgDb[id].admin,"Only Admin is allowed!");
        require(orgDb[id].balanceAmount >= amount,"Not enough balance!");
        orgDb[id].admin.transfer(amount);
        orgDb[id].balanceAmount-= amount;
        orgDb[id].withdrawTotal += amount;
    }
    
    function org_send(address payable addr,uint amount) public{
        require (orgIdxDb[msg.sender] > 0,"Organization Does Not Exists.");
        uint id = orgIdxDb[msg.sender]-1;
        require(msg.sender == orgDb[id].admin,"Only Admin is allowed!");
        require(orgDb[id].balanceAmount >= amount,"Not enough balance!");
        addr.transfer(amount);
        orgDb[id].balanceAmount-= amount;
        orgDb[id].withdrawTotal += amount;
    }
    
// X-X-X-X-X-X-X-X-X-X-X-X-X Ororganization X-X-X-X-X-X-X-X-X-X-X-X-X
}