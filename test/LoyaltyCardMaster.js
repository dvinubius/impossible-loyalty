const { expect } = require("chai");

describe("Loyalty Card Master contract", function () {
  let LoyaltyCardMaster;
  let loyaltyCardMaster;
  let owner;
  let attacker;
  let user;

  let operator1, operator2, operator3;
  let destination1, destination2, destination3;

  beforeEach(async function () {
    owner = (await ethers.getSigners())[0];
    operator1 = (await ethers.getSigners())[1];
    operator2 = (await ethers.getSigners())[2];
    operator3 = (await ethers.getSigners())[3];
    destination1 = (await ethers.getSigners())[4];
    destination2 = (await ethers.getSigners())[5];
    destination3 = (await ethers.getSigners())[6];
    attacker = (await ethers.getSigners())[9];
    user = (await ethers.getSigners())[10];
    LoyaltyCardMaster = await ethers.getContractFactory("LoyaltyCardMaster");
    loyaltyCardMaster = await LoyaltyCardMaster.deploy(
      "ImpossibleLoyaltyCard",
      "ILC"
    );
  });

  // ============= MINTING & BURNING

  it("Only allows the owner to set a minter", async function () {
    expect(
      loyaltyCardMaster.connect(attacker).setMinter(attacker.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Only allows the owner to set a burner", async function () {
    expect(
      loyaltyCardMaster.connect(attacker).setBurner(attacker.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Only allows specified minter to mint", async function () {
    expect(
      loyaltyCardMaster.connect(attacker).mint(attacker.address)
    ).to.be.revertedWith("NotAllowedToMint");
  });

  it("Allows token owner to burn", async function () {
    await loyaltyCardMaster.setMinter(owner.address);
    loyaltyCardMaster.mint(user.address);
    expect(await loyaltyCardMaster.mintCounter()).to.equal(1);
    const tokenId = 0;
    expect(await loyaltyCardMaster.connect(user).burn(tokenId))
      .to.emit(loyaltyCardMaster, "")
      .withArgs(user.address, ethers.constants.AddressZero, tokenId);
  });

  it("Allows approved burner to burn", async function () {
    await loyaltyCardMaster.setMinter(owner.address);
    loyaltyCardMaster.mint(user.address);
    expect(await loyaltyCardMaster.mintCounter()).to.equal(1);
    const tokenId = 0;
    await loyaltyCardMaster.setBurner(owner.address);
    await loyaltyCardMaster.connect(user).approve(owner.address, tokenId);
    expect(await loyaltyCardMaster.burn(tokenId))
      .to.emit(loyaltyCardMaster, "")
      .withArgs(user.address, ethers.constants.AddressZero, tokenId);
  });

  it("Prevents burning if not by token owner or approved burner", async function () {
    await loyaltyCardMaster.setMinter(owner.address);
    loyaltyCardMaster.mint(user.address);
    expect(await loyaltyCardMaster.mintCounter()).to.equal(1);
    const tokenId = 0;

    // without approval
    expect(
      loyaltyCardMaster.connect(attacker).burn(tokenId)
    ).to.be.revertedWith("NotAllowedToBurn");

    // with approval
    await loyaltyCardMaster.connect(user).approve(attacker.address, tokenId);
    expect(
      loyaltyCardMaster.connect(attacker).burn(attacker.address)
    ).to.be.revertedWith("NotAllowedToBurn");
  });

  it("Should correctly keep track of mints and burns", async function () {
    await loyaltyCardMaster.setMinter(owner.address);
    expect(await loyaltyCardMaster.mintCounter()).to.equal(0);
    expect(await loyaltyCardMaster.burnCounter()).to.equal(0);
    loyaltyCardMaster.mint(user.address);
    expect(await loyaltyCardMaster.mintCounter()).to.equal(1);
    loyaltyCardMaster.mint(user.address);
    expect(await loyaltyCardMaster.mintCounter()).to.equal(2);
    await loyaltyCardMaster.setBurner(owner.address);
    await loyaltyCardMaster.connect(user).approve(owner.address, 0);
    expect(await loyaltyCardMaster.burn(0));
    expect(await loyaltyCardMaster.burnCounter()).to.equal(1);
  });

  // ============= OPERATORS

  it("Can add and remove operators", async function () {
    expect(await loyaltyCardMaster.isOperator(operator1.address)).to.equal(
      false
    );
    await expect(loyaltyCardMaster.addOperator(operator1.address))
      .to.emit(loyaltyCardMaster, "AddedOperator")
      .withArgs(operator1.address);
    expect(await loyaltyCardMaster.isOperator(operator1.address)).to.equal(
      true
    );

    await expect(loyaltyCardMaster.removeOperator(operator1.address))
      .to.emit(loyaltyCardMaster, "RemovedOperator")
      .withArgs(operator1.address);
    expect(await loyaltyCardMaster.isOperator(operator1.address)).to.equal(
      false
    );
  });

  // ============= POINTS

  it("Newly minted card should have no total and no current points", async function () {
    await loyaltyCardMaster.setMinter(owner.address);
    await loyaltyCardMaster.mint(user.address);
    const mintedTokenId = (await loyaltyCardMaster.mintCounter()) - 1;
    expect(await loyaltyCardMaster.totalPoints(mintedTokenId)).to.equal(0);
    expect(await loyaltyCardMaster.currentPoints(mintedTokenId)).to.equal(0);
  });

  it("Should only allow operator to add and redeem points", async function () {
    await loyaltyCardMaster.setMinter(owner.address);
    await loyaltyCardMaster.mint(user.address);
    const mintedTokenId = (await loyaltyCardMaster.mintCounter()) - 1;
    await expect(
      loyaltyCardMaster.connect(attacker).addPoints(mintedTokenId, 1)
    ).to.be.revertedWith("NotAllowedToOperate");
    await expect(
      loyaltyCardMaster.connect(attacker).redeemPoints(mintedTokenId, 1)
    ).to.be.revertedWith("NotAllowedToOperate");
    await loyaltyCardMaster.addOperator(operator1.address);
    await expect(
      loyaltyCardMaster.connect(operator1).addPoints(mintedTokenId, 1)
    ).to.emit(loyaltyCardMaster, "AddedPoints");
    await expect(
      loyaltyCardMaster.connect(operator1).redeemPoints(mintedTokenId, 1)
    ).to.emit(loyaltyCardMaster, "RedeemedPoints");
  });

  it("Should correctly account points", async function () {
    await loyaltyCardMaster.setMinter(owner.address);
    await loyaltyCardMaster.mint(user.address);
    const mintedTokenId = (await loyaltyCardMaster.mintCounter()) - 1;
    await loyaltyCardMaster.addOperator(operator1.address);

    await loyaltyCardMaster.connect(operator1).addPoints(mintedTokenId, 1);
    expect(await loyaltyCardMaster.currentPoints(mintedTokenId)).to.equal(1);
    expect(await loyaltyCardMaster.totalPoints(mintedTokenId)).to.equal(1);
    await loyaltyCardMaster.connect(operator1).addPoints(mintedTokenId, 10);
    expect(await loyaltyCardMaster.currentPoints(mintedTokenId)).to.equal(11);
    expect(await loyaltyCardMaster.totalPoints(mintedTokenId)).to.equal(11);
    await loyaltyCardMaster.connect(operator1).redeemPoints(mintedTokenId, 1);
    expect(await loyaltyCardMaster.currentPoints(mintedTokenId)).to.equal(10);
    expect(await loyaltyCardMaster.totalPoints(mintedTokenId)).to.equal(11);
  });

  it("Should not be able to redeem more points than available", async function () {
    await loyaltyCardMaster.setMinter(owner.address);
    await loyaltyCardMaster.mint(user.address);
    const mintedTokenId = (await loyaltyCardMaster.mintCounter()) - 1;
    await loyaltyCardMaster.addOperator(operator1.address);
    await loyaltyCardMaster.connect(operator1).addPoints(mintedTokenId, 10);
    await expect(
      loyaltyCardMaster.connect(operator1).redeemPoints(mintedTokenId, 11)
    ).to.be.revertedWith("InsufficientPoints");
  });

  // ============= TRANSFERS

  it("Can add and remove destinations", async function () {
    expect(
      await loyaltyCardMaster.isDestination(destination1.address)
    ).to.equal(false);

    loyaltyCardMaster.addDestination(destination1.address);
    await expect(loyaltyCardMaster.addDestination(destination1.address))
      .to.emit(loyaltyCardMaster, "AddedDestination")
      .withArgs(destination1.address);
    expect(
      await loyaltyCardMaster.isDestination(destination1.address)
    ).to.equal(true);

    await expect(loyaltyCardMaster.removeDestination(destination1.address))
      .to.emit(loyaltyCardMaster, "RemovedDestination")
      .withArgs(destination1.address);
    expect(
      await loyaltyCardMaster.isDestination(destination1.address)
    ).to.equal(false);
  });

  it("Should not allow transfer to a destination that isn't whitelisted", async function () {
    await loyaltyCardMaster.setMinter(owner.address);
    await loyaltyCardMaster.mint(user.address);
    const mintedTokenId = (await loyaltyCardMaster.mintCounter()) - 1;
    let mintedTokenOwner = await loyaltyCardMaster.ownerOf(mintedTokenId);

    expect(mintedTokenOwner).to.equal(user.address);

    await loyaltyCardMaster.addOperator(operator1.address);

    expect(
      await loyaltyCardMaster.isDestination(destination1.address)
    ).to.equal(false);

    await expect(
      loyaltyCardMaster
        .connect(user)
        .transferFrom(user.address, destination1.address, mintedTokenId)
    ).to.be.revertedWith("NotAllowedAsDestination");

    await loyaltyCardMaster.addDestination(destination1.address);
    await loyaltyCardMaster
      .connect(user)
      .transferFrom(user.address, destination1.address, mintedTokenId);
    mintedTokenOwner = await loyaltyCardMaster.ownerOf(mintedTokenId);

    expect(mintedTokenOwner).to.equal(destination1.address);
  });
});
