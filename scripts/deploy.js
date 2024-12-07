const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy ContentManager 
  const ContentManager = await ethers.getContractFactory("ContentManager");
  const platformFee = ethers.parseEther("0.01"); // Set platform fee to 0.01 ETH
  const contentManager = await ContentManager.deploy(deployer.address, platformFee);
  await contentManager.waitForDeployment();
  console.log("ContentManager deployed to:", await contentManager.getAddress());

  // Deploy LicenceManager
  const LicenceManager = await ethers.getContractFactory("LicenceManager");
  const licenceManager = await LicenceManager.deploy(
    deployer.address,
    await contentManager.getAddress()
  );
  await licenceManager.waitForDeployment();
  console.log("LicenceManager deployed to:", await licenceManager.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
