task(
  "add-destination",
  "Adds a transfer destination to the LoyaltyCard contract"
)
  .addParam("contract", "The address of the LoylatyCard contract")
  .addParam("destination", "The address of the destination")
  .setAction(async ({ contract, destination }, { ethers }) => {
    const loyaltyCardContract = await ethers.getContractAt(
      "LoyaltyCard",
      contract
    );
    await loyaltyCardContract.addDestination(destination);
    console.log("Destination added to LoyaltyCard contract");
  });
