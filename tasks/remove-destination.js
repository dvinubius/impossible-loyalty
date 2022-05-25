task(
  "remove-destination",
  "Removes a destination from the LoyaltyCard contract"
)
  .addParam("contract", "The address of the LoylatyCard contract")
  .addParam("destination", "The address of the destination")
  .setAction(async ({ contract, destination }, { ethers }) => {
    const loyaltyCardContract = await ethers.getContractAt(
      "LoyaltyCard",
      contract
    );
    await loyaltyCardContract.removeDestination(destination);
    console.log("destination removed form LoyaltyCard contract");
  });
