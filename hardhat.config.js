require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("./tasks");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  settings: {
    optimizer: {
      enabled: true,
      runs: 2000,
    },
  },
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    binance: {
      url: process.env.BSC_RPC_URL,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      saveDeployments: true,
      chainId: 56,
    },
    binanceTest: {
      url: process.env.BSC_TESTNET_RPC_URL,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      saveDeployments: true,
      chainId: 97,
    },
  },
  etherscan: {
    apiKey: process.env.BINANCESCAN_API_KEY,
  },
};
