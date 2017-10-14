import { expect, assert } from 'chai';
import requireHacker from 'require-hacker'
import liquidpledging from 'liquidpledging';
require('dotenv').config({path: './.env.local'});

// needed to avoid error with babel and svg imports
const reactNullComponent = `
  require('react').createClass({
    render() {
      return null;
    }
  })
`;
requireHacker.hook('svg', () => `module.exports = ${reactNullComponent}`);

// sugar for formatting string
String.prototype.format = function () {
    var args = [].slice.call(arguments);
    return this.replace(/(\{\d+\})/g, function (a){
        return args[+(a.substr(1,a.length-2))||0];
    });
};

// set web3
const Web3 = require('web3');
const web3 = new Web3('ws://localhost:8546');

// hardcoded test network from "getNetwork.js"
const testNetwork = {
    title: "TestRPC",
    liquidPledgingAddress: "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24",
    etherscan: "https://etherscan.io/", // this won't work for. only here so we can see links during development
};
const network = Object.assign({}, testNetwork);

// set liquidpleding for network using test mode true
const LiquidPledging = liquidpledging.LiquidPledging(true);
network.liquidPledging = new LiquidPledging(web3, network.liquidPledgingAddress);

// define globals
global.assert = assert;
global.expect = expect;
global.network = network;
global.web3 = web3;