const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('LicenceManager', function () {
    async function deployContractAndSetVariables() {
      const [deployer, user1, user2] = await ethers.getSigners();
  
      const platformFee = 2;
  
      const ContentManager = await ethers.getContractFactory('ContentManager');
      const contentManager = await ContentManager.deploy(deployer, platformFee);
  
      const newCid = 'bafkreibkfkqs5iax34mccrllg352slzz7x4nwkftpxe5yt5qd236gsxz4i';
      const addedCid = 'cafkreibkfkqs5iax34mccrllg352slzz7x4nwkftpxe5yt5qd236gsxz4i';
      const addedPrice = 10;
  
      await contentManager.addContent(addedPrice, addedCid, {value: platformFee});
      const contentManagerAddress = await contentManager.getAddress();
  
      const LicenceManager = await ethers.getContractFactory('LicenceManager');
      const licenceManager = await LicenceManager.deploy(contentManagerAddress);
  
      await licenceManager.waitForDeployment();
  
      return { 
        contentManager, 
        licenceManager, 
        platformFee, 
        user1, 
        user2,
        addedCid, 
        newCid,
        addedPrice,
        duration: 30 * 24 * 60 * 60 // 30 days
      };
    }
  
  describe('Deployment', function() {
    it('should print and verify contract addresses', async function() {
        const { licenceManager, contentManager } = await loadFixture(deployContractAndSetVariables);
        
        // get addresses
        const contentManagerAddress = await contentManager.getAddress();
        const licenceManagerAddress = await licenceManager.getAddress();
  
        console.log('ContentManager Address:', contentManagerAddress);
        console.log('LicenceManager Address:', licenceManagerAddress);
  
        // ensure addresses are not empty
        expect(contentManagerAddress).to.not.be.undefined;
        expect(licenceManagerAddress).to.not.be.undefined;
      });
  });

  describe('Licence Payment', function() {
    it('should allow payment for a valid content', async function() {
      const { licenceManager, user1, addedCid, addedPrice } = await loadFixture(deployContractAndSetVariables);
      
      const user1Address = await user1.getAddress();

      await expect(licenceManager.connect(user1).pay(addedCid, { value: addedPrice }))
        .to.emit(licenceManager, "PaymentReceived")
        .withArgs(user1Address, addedCid, addedPrice);
    });

    it('should reject insufficient payment', async function() {
      const { licenceManager, user1, addedCid, addedPrice } = await loadFixture(deployContractAndSetVariables);
      
      await expect(licenceManager.connect(user1).pay(addedCid, { value: Math.floor(addedPrice / 2) }))
        .to.be.revertedWith("Insufficient payment");
    });
  });

  describe('Licence Issuance', function() {
    it('should issue licence after payment', async function() {
      const { licenceManager, user1, addedCid, addedPrice, duration } = await loadFixture(deployContractAndSetVariables);
      
      const user1Address = await user1.getAddress();

      // pay for the licence
      await licenceManager.connect(user1).pay(addedCid, { value: addedPrice });
      
      // issue the licence
      await expect(licenceManager.issueLicence(user1Address, addedCid, duration))
        .to.emit(licenceManager, "LicenceIssued");
      
      // verify licence details
      const licence = await licenceManager.getLicenceDetails(user1Address, addedCid);
      expect(licence.isValid).to.be.true;
      expect(licence.userId).to.equal(user1Address);
      expect(licence.CID).to.equal(addedCid);
    });

    it('should reject issuing licence without payment', async function() {
      const { licenceManager, user1, addedCid, duration } = await loadFixture(deployContractAndSetVariables);
      
      const user1Address = await user1.getAddress();

      await expect(licenceManager.issueLicence(user1Address, addedCid, duration))
        .to.be.revertedWith("Licence not paid for");
    });
  });
});