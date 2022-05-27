task(
  "remove-destination",
  "Removes a destination from the LoyaltyCardMaster contract"
)
  .addParam("contract", "The address of the LoyaltyCardMaster contract")
  .addParam("destination", "The address of the destination")
  .setAction(async ({ contract, destination }, { ethers }) => {
    const loyaltyCardMasterContract = await ethers.getContractAt(
      "LoyaltyCardMaster",
      contract
    );
    await loyaltyCardMasterContract.removeDestination(destination);
    console.log("destination removed form LoyaltyCardMaster contract");
  });
