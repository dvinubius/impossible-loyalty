const { expect } = require("chai");

describe("Loyalty Card contract", function () {
  let LoyaltyCard;
  let loyaltyCard;
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
    LoyaltyCard = await ethers.getContractFactory("LoyaltyCard");
    loyaltyCard = await LoyaltyCard.deploy("ImpossibleLoyaltyCard", "ILC");
  });

  // ============= MINTING

  it("Only allows the owner to set a minter", async function () {
    expect(
      loyaltyCard.connect(attacker).setMinter(attacker.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Only allows specified minter to mint", async function () {
    expect(
      loyaltyCard.connect(attacker).mint(attacker.address)
    ).to.be.revertedWith("NotAllowedToMint");
  });

  it("Should correctly keep track of the supply", async function () {
    await loyaltyCard.setMinter(owner.address);
    expect(await loyaltyCard.supply()).to.equal(0);
    loyaltyCard.mint(user.address);
    expect(await loyaltyCard.supply()).to.equal(1);
    loyaltyCard.mint(user.address);
    expect(await loyaltyCard.supply()).to.equal(2);
  });

  // ============= OPERATORS

  it("After deployment there should be no whitelisted operators", async function () {
    const operators = await loyaltyCard.getOperators();
    expect(operators.length).to.equal(0);
  });

  it("Can add and remove operators with consistent retrieval", async function () {
    expect(await loyaltyCard.isOperator(operator1.address)).to.equal(false);
    expect(await loyaltyCard.isOperator(operator1.address)).to.equal(false);
    expect(await loyaltyCard.isOperator(operator1.address)).to.equal(false);

    let operators;

    await expect(loyaltyCard.addOperator(operator1.address)).to.emit(
      loyaltyCard,
      "AddedOperator"
    );
    operators = await loyaltyCard.getOperators();
    expect(operators.length).to.equal(1);
    expect(await loyaltyCard.isOperator(operator1.address)).to.equal(true);
    loyaltyCard.addOperator(operator2.address);
    loyaltyCard.addOperator(operator3.address);
    operators = await loyaltyCard.getOperators();
    expect(operators.length).to.equal(3);
    expect(await loyaltyCard.isOperator(operator1.address)).to.equal(true);
    expect(await loyaltyCard.isOperator(operator1.address)).to.equal(true);
    await expect(loyaltyCard.removeOperator(operator1.address)).to.emit(
      loyaltyCard,
      "RemovedOperator"
    );
    operators = await loyaltyCard.getOperators();
    expect(operators.length).to.equal(2);
    expect(await loyaltyCard.isOperator(operator1.address)).to.equal(false);
  });

  // ============= POINTS

  it("Newly minted card should have no total and no current points", async function () {
    await loyaltyCard.setMinter(owner.address);
    await loyaltyCard.mint(user.address);
    const mintedTokenId = (await loyaltyCard.supply()) - 1;
    expect(await loyaltyCard.totalPoints(mintedTokenId)).to.equal(0);
    expect(await loyaltyCard.currentPoints(mintedTokenId)).to.equal(0);
  });

  it("Should only allow operator to add and redeem points", async function () {
    await loyaltyCard.setMinter(owner.address);
    await loyaltyCard.mint(user.address);
    const mintedTokenId = (await loyaltyCard.supply()) - 1;
    await expect(
      loyaltyCard.connect(attacker).addPoints(mintedTokenId, 1)
    ).to.be.revertedWith("NotAllowedToOperate");
    await expect(
      loyaltyCard.connect(attacker).redeemPoints(mintedTokenId, 1)
    ).to.be.revertedWith("NotAllowedToOperate");
    await loyaltyCard.addOperator(operator1.address);
    await expect(
      loyaltyCard.connect(operator1).addPoints(mintedTokenId, 1)
    ).to.emit(loyaltyCard, "AddedPoints");
    await expect(
      loyaltyCard.connect(operator1).redeemPoints(mintedTokenId, 1)
    ).to.emit(loyaltyCard, "RedeemedPoints");
  });

  it("Should correctly account points", async function () {
    await loyaltyCard.setMinter(owner.address);
    await loyaltyCard.mint(user.address);
    const mintedTokenId = (await loyaltyCard.supply()) - 1;
    await loyaltyCard.addOperator(operator1.address);

    await loyaltyCard.connect(operator1).addPoints(mintedTokenId, 1);
    expect(await loyaltyCard.currentPoints(mintedTokenId)).to.equal(1);
    expect(await loyaltyCard.totalPoints(mintedTokenId)).to.equal(1);
    await loyaltyCard.connect(operator1).addPoints(mintedTokenId, 10);
    expect(await loyaltyCard.currentPoints(mintedTokenId)).to.equal(11);
    expect(await loyaltyCard.totalPoints(mintedTokenId)).to.equal(11);
    await loyaltyCard.connect(operator1).redeemPoints(mintedTokenId, 1);
    expect(await loyaltyCard.currentPoints(mintedTokenId)).to.equal(10);
    expect(await loyaltyCard.totalPoints(mintedTokenId)).to.equal(11);
  });

  it("Should not be able to redeem more points than available", async function () {
    await loyaltyCard.setMinter(owner.address);
    await loyaltyCard.mint(user.address);
    const mintedTokenId = (await loyaltyCard.supply()) - 1;
    await loyaltyCard.addOperator(operator1.address);
    await loyaltyCard.connect(operator1).addPoints(mintedTokenId, 10);
    await expect(
      loyaltyCard.connect(operator1).redeemPoints(mintedTokenId, 11)
    ).to.be.revertedWith("InsufficientPoints");
  });

  // ============= TRANSFERS

  it("After deployment there should be no whitelisted destinations", async function () {
    const destinations = await loyaltyCard.getDestinations();
    expect(destinations.length).to.equal(0);
  });

  it("Can add and remove destination with consistent retrieval", async function () {
    expect(await loyaltyCard.isDestination(destination1.address)).to.equal(
      false
    );
    expect(await loyaltyCard.isDestination(destination2.address)).to.equal(
      false
    );

    let destinations;

    await expect(loyaltyCard.addDestination(destination1.address)).to.emit(
      loyaltyCard,
      "AddedDestination"
    );
    destinations = await loyaltyCard.getDestinations();
    expect(destinations.length).to.equal(1);
    expect(await loyaltyCard.isDestination(destination1.address)).to.equal(
      true
    );
    loyaltyCard.addDestination(destination2.address);
    loyaltyCard.addDestination(destination3.address);
    destinations = await loyaltyCard.getDestinations();
    expect(destinations.length).to.equal(3);
    expect(await loyaltyCard.isDestination(destination1.address)).to.equal(
      true
    );
    expect(await loyaltyCard.isDestination(destination1.address)).to.equal(
      true
    );

    await expect(loyaltyCard.removeDestination(destination1.address)).to.emit(
      loyaltyCard,
      "RemovedDestination"
    );
    destinations = await loyaltyCard.getDestinations();
    expect(destinations.length).to.equal(2);
    expect(await loyaltyCard.isDestination(destination1.address)).to.equal(
      false
    );
  });

  it("Should not allow a transfer destination that isn't whitelisted", async function () {
    await loyaltyCard.setMinter(owner.address);
    await loyaltyCard.mint(user.address);
    const mintedTokenId = (await loyaltyCard.supply()) - 1;
    let mintedTokenOwner = await loyaltyCard.ownerOf(mintedTokenId);

    expect(mintedTokenOwner).to.equal(user.address);

    await loyaltyCard.addOperator(operator1.address);

    expect(await loyaltyCard.isDestination(destination1.address)).to.equal(
      false
    );

    await expect(
      loyaltyCard
        .connect(user)
        .transferFrom(user.address, destination1.address, mintedTokenId)
    ).to.be.revertedWith("NotAllowedAsDestination");

    await loyaltyCard.addDestination(destination1.address);
    await loyaltyCard
      .connect(user)
      .transferFrom(user.address, destination1.address, mintedTokenId);
    mintedTokenOwner = await loyaltyCard.ownerOf(mintedTokenId);

    expect(mintedTokenOwner).to.equal(destination1.address);
  });
});
