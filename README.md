# Ownership verification :whale:
A blockchain app for ownership verification built with Ethereum Smart Contracts.

## Getting Started
### Prerequisites   
- Node.js
- npm
- Hardhat
- Metamask
- Infura
- Web3.storage
- React

### Installing
- Clone the repository
- Install the dependencies
```
npm install
```
- Run the app with        
```
npm start
```
- Make sure to change PROOF, UCAN, API keys env variables in .env file
```
PRIVATE_KEY=your_private_key_here
INFURA_API_KEY=your_infura_api_key_here

PROOF_KEY=your_proof_key_here
UCAN_KEY=your_ucan_key_here
```

- In another terminal run the server.js
```
node server.js
```
- To deploy the smart contract run the following command
```
npx hardhat run scripts/deploy-test.js --network sepolia
```
-To run the tests
```
npx hardhat test
```


## Authors
- Alexandra Toma
- Macovei Catalina 