# impossible-loyalty

Draft for an NFT contract to create cards within a loyalty programme. 

The card NFTs are dynamic: points can be added and redeemed for benefits. These operations are only performed by whitelisted operators.

The cards are not transferrable by default. Destinations for transfers can be whitelisted (e.g. it would make sense to transfer the cards to staking contracts)

# Installation

`npm install`
# OPS

## Currently supported chains

- Binance Smart Chain
- Binance Smart Chain Testnet

1. Contract Deployment
   
  - `npm run deploy-bsc-mainnet`
  - `npm run deploy-bsc-testnet`
  
2. Contract Verification
   
  - `npm run verify-bsc-mainnet`
  - `npm run verify-bsc-testnet`

When executing these commands the latest deployments are used
  
3. Contract Operation

> @dev Convenience vs. Flexibility

> The commands below can be made more convenient by wrapping them in dedicated scripts
>   - automatically use latest deployed contract address
>   - include network in script name for better prevention of human error
>   - cleaner output
>   - logging

> They currently require explicitly passing the LoyaltyCard contract address. This is more flexible, but may be of no great use to us. (TBD)

## Add/Remove operators   
  
  - `npx hardhat --network binance add-operator --contract <DEPLOYMENT_ADDRESS> --operator <OPERATOR_ADDRESS>`
  - `npx hardhat --network binance remove-operator --contract <DEPLOYMENT_ADDRESS> --operator <OPERATOR_ADDRESS>`

  - `npx hardhat --network binanceTest add-operator --contract <DEPLOYMENT_ADDRESS> --operator <OPERATOR_ADDRESS>`
  - `npx hardhat --network binanceTest remove-operator --contract <DEPLOYMENT_ADDRESS> --operator <OPERATOR_ADDRESS>`
  
## Add/Remove destinations

  - `npx hardhat --network binance add-destination --contract <DEPLOYMENT_ADDRESS> --destination <DESTINATION_ADDRESS>`
  - `npx hardhat --network binance remove-destination --contract <DEPLOYMENT_ADDRESS> --destination <DESTINATION_ADDRESS>`
  
  - `npx hardhat --network binanceTest add-destination --contract <DEPLOYMENT_ADDRESS> --destination <DESTINATION_ADDRESS>`
  - `npx hardhat --network binanceTest remove-destination --contract <DEPLOYMENT_ADDRESS> --destination <DESTINATION_ADDRESS>`





