import liquidpledging from 'liquidpledging';
// import getWeb3 from "./getWeb3";

const LiquidPledging = liquidpledging.LiquidPledging(false);

const networks = {
  main: {
    title: "Main",
    liquidPledgingAddress: "0x0",
    etherscan: "https://etherscan.io/",
  },
  morden: {
    title: "Morden",
    liquidPledgingAddress: "0x0",
    etherscan: "",
  },
  ropsten: {
    title: "Ropsten",
    liquidPledgingAddress: "0x0",
    etherscan: "https://ropsten.etherscan.io/",
  },
  rinkeby: {
    title: "Rinkeby",
    liquidPledgingAddress: "0x0",
    etherscan: "",
  },
  kovan: {
    title: "Kovan",
    liquidPledgingAddress: "0x0",
    etherscan: "",
  },
  default: {
    title: "TestRPC",
    liquidPledgingAddress: "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24",
    etherscan: "https://etherscan.io/", // this won't work for. only here so we can see links during development
  },
};

let network = undefined;

export default (web3) => {
  if (network) return Promise.resolve(network);

  network = Object.assign({}, networks.default);
  network.liquidPledging = new LiquidPledging(web3, network.liquidPledgingAddress);
  return network;
  // return getWeb3()
  //   .then(web3 => {
  //     return web3.eth.net.getId()
  //       .then(id => {
  //         console.log('hello16');
  //
  //         switch (id) {
  //           case 1:
  //             network = Object.assign({}, networks.main);
  //             break;
  //           case 2:
  //             network = Object.assign({}, networks.morden);
  //             break;
  //           case 3:
  //             network = Object.assign({}, networks.ropsten);
  //             break;
  //           case 4:
  //             network = Object.assign({}, networks.rinkeby);
  //             break;
  //           case 42:
  //             network = Object.assign({}, networks.kovan);
  //             break;
  //           default:
  //             network = Object.assign({}, networks.default);
  //             break;
  //
  //         }
  //
  //         network.liquidPledging = new LiquidPledging(web3, network.liquidPledgingAddress);
  //         console.log('hello17');
  //         return network;
  //       })
    // });
}