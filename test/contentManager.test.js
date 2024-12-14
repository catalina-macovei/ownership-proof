const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('ContentManager', function () {

  async function deployContractAndSetVariables() {
    const [owner, user1, user2] = await ethers.getSigners();

    const platformFee = 2;

    const ContentManager = await ethers.getContractFactory('ContentManager');
    const contentManager = await ContentManager.deploy(owner, platformFee);

    const newCid = 'bafkreibkfkqs5iax34mccrllg352slzz7x4nwkftpxe5yt5qd236gsxz4i';

    const addedCid = 'cafkreibkfkqs5iax34mccrllg352slzz7x4nwkftpxe5yt5qd236gsxz4i';

    const addedPrice = 10;

    const addedTitle = 'title';

    await contentManager.addContent(addedPrice, addedCid, addedTitle, {value: platformFee});


    return { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid};
  }

  // test deploying contract

  describe('Deployment', function () {
    it('should deploy and set the owner correctly', async function () {
      const { contentManager, platformFee, owner } = await loadFixture(deployContractAndSetVariables);

      expect(await contentManager.owner()).to.equal(owner.address);
    });
  });


  // test getContent
  describe('Content Details', function () {
    it('should get the content with given CID correctly', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      gotContent = await contentManager.getContent(addedCid);

      expect(gotContent).to.not.equal(undefined);
      expect(gotContent.creator).to.equal(owner.address);
      expect(gotContent.price).to.equal(addedPrice);
      expect(gotContent.usageCount).to.equal(0);
      expect(gotContent.title).to.equal(addedTitle);
    });

    it('should not allow getting inexistent content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await expect(contentManager.getContent(newCid)).to.be.revertedWith('Content not found!');
    });
  });

  // test addContent

  describe('Content Addition', function () {
    it('should save the content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedTitle, addedPrice, newCid } = await loadFixture(deployContractAndSetVariables);

      const newTitle = 'newTitle';
      await contentManager.addContent(15, newCid, newTitle, {value: platformFee});

      const savedContent = await contentManager.getContent(newCid);

      expect(savedContent).to.not.equal(undefined);
      expect(savedContent.creator).to.equal(owner.address);
      expect(savedContent.price).to.equal(15);
      expect(savedContent.usageCount).to.equal(0);
      expect(savedContent.title).to.equal(newTitle);
    });

    it('should emit ContentAdded event after saving the content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedContent, newCid } = await loadFixture(deployContractAndSetVariables);

      await expect(contentManager.addContent(15, newCid, 'title', {value: platformFee})).to.emit(contentManager, "ContentAdded").withArgs(owner, newCid);
    });

    it('should not allow uploads of duplicate content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, newCid } = await loadFixture(deployContractAndSetVariables);

      await expect(contentManager.addContent(15, addedCid, 'title', {value: platformFee})).to.be.revertedWith('Content is already on the platform!');
    });

    it('should not allow uploads without paying the platform fee', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await expect(contentManager.addContent(15, newCid, 'title')).to.be.revertedWith('You must pay the platform fee to upload content');
    });

    it('should transfer the platform fee into owner s account', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      
      await contentManager.connect(user1).addContent(15, newCid, 'title', {value: platformFee});

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + BigInt(platformFee));
    });
  });


  // test removeContent

  describe('Content Removal', function () {
    it('should delete the content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await contentManager.removeContent(addedCid);

      await expect(contentManager.getContent(addedCid)).to.be.revertedWith('Content not found!');
    });

    it('should emit ContentRemove event after deleting the content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await expect(contentManager.removeContent(addedCid)).to.emit(contentManager, "ContentRemoved").withArgs(owner, addedCid);
    });

    it('should not allow removal of inexistent content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await expect(contentManager.removeContent(newCid)).to.be.revertedWith('Content not found!');
    });

    it('should not allow removal of not owned content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await expect(contentManager.connect(user1).removeContent(addedCid)).to.be.revertedWith('Action allowed only for the creator of the content!');
    });
  });

  // test setPrice

  describe('Content Price Change', function () {
    it('should set new price for the content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await contentManager.setPrice(addedCid, addedPrice + 1);

      const updatedContent = await contentManager.getContent(addedCid);

      expect(updatedContent.price).to.equal(addedPrice + 1);
    });

    it('should not allow setting new price for inexistent content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await expect(contentManager.setPrice(newCid, addedPrice + 1)).to.be.revertedWith('Content not found!');
    });

    it('should not allow setting new price for not owned content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await expect(contentManager.connect(user1).setPrice(addedCid, addedPrice + 1)).to.be.revertedWith('Action allowed only for the creator of the content!');
    });

    it('should emit ContentPriceChanged event after setting a new price', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await expect(contentManager.setPrice(addedCid, addedPrice + 1)).to.emit(contentManager, "ContentPriceChanged").withArgs(addedCid, addedPrice, addedPrice + 1);
    });
  });

  // test setTitle

  describe('Content Title Change', function () {
    it('should set new title for the content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      const newTitle = 'newTitle';
      await contentManager.setTitle(addedCid, newTitle);

      const updatedContent = await contentManager.getContent(addedCid);

      expect(updatedContent.title).to.equal(newTitle);
    });

    it('should not allow setting new title for inexistent content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await expect(contentManager.setTitle(newCid, 'newTitle')).to.be.revertedWith('Content not found!');
    });

    it('should not allow setting new price for not owned content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await expect(contentManager.connect(user1).setTitle(addedCid, 'newTitle')).to.be.revertedWith('Action allowed only for the creator of the content!');
    });

    it('should emit ContentTitleChanged event after setting a new title', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);
      const newTitle = 'newTitle';
      await expect(contentManager.setTitle(addedCid, newTitle)).to.emit(contentManager, "ContentTitleChanged").withArgs(addedCid, addedTitle, newTitle);
    });
  });


  // test increaseUsageCount
  describe('Content Usage Count increase', function () {
    it('should increase the usage count for the content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      const addedContent = await contentManager.getContent(addedCid);

      await contentManager.increaseUsageCount(addedCid);

      const updatedContent = await contentManager.getContent(addedCid);

      expect(updatedContent.usageCount).to.equal(addedContent.usageCount + BigInt(1));
    });

    it('should not allow increasing the usage count for inexistent content', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await expect(contentManager.increaseUsageCount(newCid)).to.be.revertedWith('Content not found!');
    });


    it('should emit ContentUsageCountChanged event after increasing usage count', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      const oldContent = await contentManager.getContent(addedCid);

      await expect(contentManager.increaseUsageCount(addedCid)).to.emit(contentManager, "ContentUsageCountChanged").withArgs(addedCid, oldContent.usageCount, oldContent.usageCount + BigInt(1));
    });
  });

  // test get contents

  describe('Content getters', function () {
    it('should get all the contents', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await contentManager.addContent(15, newCid, 'title2', {value: platformFee});

      const gotContent = await contentManager.getAllContents();

      expect(gotContent.length).to.equal(2);

      expect(gotContent[0].creator).to.equal(owner.address);
      expect(gotContent[0].price).to.equal(addedPrice);
      expect(gotContent[0].usageCount).to.equal(0);
      expect(gotContent[0].title).to.equal(addedTitle);

      expect(gotContent[1].creator).to.equal(owner.address);
      expect(gotContent[1].price).to.equal(15);
      expect(gotContent[1].usageCount).to.equal(0);
      expect(gotContent[1].title).to.equal('title2');
    });

    it('should get the contents for a creator', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await contentManager.connect(user1).addContent(15, newCid, 'title2', {value: platformFee});

      const gotContent = await contentManager.getCreatorContents();

      expect(gotContent.length).to.equal(1);

      expect(gotContent[0].creator).to.equal(owner.address);
      expect(gotContent[0].price).to.equal(addedPrice);
      expect(gotContent[0].usageCount).to.equal(0);
      expect(gotContent[0].title).to.equal(addedTitle);
    });
    
  });


  // test getPlatformFee

  describe('Platform fee', function () {
    it('should get the platform fee', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      const gotPlatformFee = await contentManager.getPlatformFee();

      expect(gotPlatformFee).to.equal(platformFee);
    });


    // test setPlatformFee

    it('should set a new platform fee', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await contentManager.setPlatformFee(platformFee + 1);

      expect(await contentManager.getPlatformFee()).to.equal(platformFee + 1);
    });

    it('should not allow setting the platform fee from a non-owner account', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await expect(contentManager.connect(user1).setPlatformFee(platformFee + 1)).to.be.reverted;
    });


    it('should emit PlatformFeeChanged event after setting platform count', async function () {
      const { contentManager, platformFee, owner, user1, addedCid, addedPrice, addedTitle, newCid } = await loadFixture(deployContractAndSetVariables);

      await expect(contentManager.setPlatformFee(platformFee + 1)).to.emit(contentManager, "PlatformFeeChanged").withArgs(platformFee, platformFee + 1);
    });
  });

});