task("remove-operator", "Removes an operator from the LoyaltyCard contract")
  .addParam("contract", "The address of the LoylatyCard contract")
  .addParam("operator", "The address of the operator")
  .setAction(async ({ contract, operator }, { ethers }) => {
    const loyaltyCardContract = await ethers.getContractAt(
      "LoyaltyCard",
      contract
    );
    await loyaltyCardContract.removeOperator(operator);
    console.log("Operator removed form LoyaltyCard contract");
  });
