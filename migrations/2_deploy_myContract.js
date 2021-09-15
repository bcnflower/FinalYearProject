var MyContract = artifacts.require("myContract");

module.exports = function (deployer) {
  deployer.deploy(MyContract);
};