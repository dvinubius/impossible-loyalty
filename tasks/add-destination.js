task(
  "add-destination",
  "Adds a transfer destination to the LoyaltyCardMaster contract"
)
  .addParam("contract", "The address of the LoyatyCard contract")
  .addParam("destination", "The address of the destination")
  .setAction(async ({ contract, destination }, { ethers }) => {
    const loyaltyCardMasterContract = await ethers.getContractAt(
      "LoyaltyCardMaster",
      contract
    );
    await loyaltyCardMasterContract.addDestination(destination);
    console.log("Destination added to LoyaltyCardMaster contract");
  });
