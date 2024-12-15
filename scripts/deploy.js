const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const ContentManager = await ethers.getContractFactory("ContentManager");
  const platformFee = ethers.parseEther("0");
  const contentManager = await ContentManager.deploy(deployer.address, platformFee);
  await contentManager.waitForDeployment();
  const contentManagerAddress = await contentManager.getAddress();
  console.log("ContentManager deployed to:", contentManagerAddress);

  const LicenceManager = await ethers.getContractFactory("LicenceManager");
  const licenceManager = await LicenceManager.deploy(contentManagerAddress);
  await licenceManager.waitForDeployment();
  console.log("LicenceManager deployed to:", await licenceManager.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
