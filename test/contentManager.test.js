const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('ContentManager', function () {

  async function deployContractAndSetVariables() {
    const [owner, user1, user2] = await ethers.getSigners();

    const ContentManager = await ethers.getContractFactory('ContentManager');
    const contentManager = await ContentManager.deploy(owner);

    let cid = 'bafkreibkfkqs5iax34mccrllg352slzz7x4nwkftpxe5yt5qd236gsxz4i';

    return { contentManager, owner, user1, cid};
  }

  // test deploying contract

  it('should deploy and set the owner correctly', async function () {
    const { contentManager, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await contentManager.owner()).to.equal(owner.address);
  });


  // test getContent

  it('should get the content with given CID correctly', async function () {
    const { contentManager, owner, user1, cid } = await loadFixture(deployContractAndSetVariables);

    await contentManager.addContent(10, cid);

    gotContent = await contentManager.getContent(cid);

    expect(gotContent.creator).to.equal(owner.address);
    expect(gotContent.price).to.equal(10);
    expect(gotContent.usageCount).to.equal(0);
  });

  it('should not allow getting inexistent content', async function () {
    const { contentManager, owner, user1, cid } = await loadFixture(deployContractAndSetVariables);

    await expect(contentManager.getContent(cid)).to.be.revertedWith('Content not found!');
  });

  // test addContent

  it('should save the content', async function () {
    const { contentManager, owner, user1, cid } = await loadFixture(deployContractAndSetVariables);

    await contentManager.addContent(10, cid);

    const savedContent = await contentManager.getContent(cid);

    expect(savedContent).to.not.equal(undefined);
    expect(savedContent.creator).to.equal(owner.address);
    expect(savedContent.price).to.equal(10);
    expect(savedContent.usageCount).to.equal(0);
  });

  it('should emit ContentAdded event after saving the content', async function () {
    const { contentManager, owner, user1, cid } = await loadFixture(deployContractAndSetVariables);

    await expect(contentManager.addContent(10, cid)).to.emit(contentManager, "ContentAdded").withArgs(owner, cid);
  });

  it('should not allow uploads of duplicate content', async function () {
    const { contentManager, owner, cid } = await loadFixture(deployContractAndSetVariables);

    await contentManager.addContent(10, cid);

    console.log(contentManager.contents)

    await expect(contentManager.addContent(15, cid)).to.be.revertedWith('Content is already on the platform!');
  });


  // test removeContent



});