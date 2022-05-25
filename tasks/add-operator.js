task("add-operator", "Adds an operator to the LoyaltyCard contract")
  .addParam("contract", "The address of the LoylatyCard contract")
  .addParam("operator", "The address of the operator")
  .setAction(async ({ contract, operator }, { ethers }) => {
    const loyaltyCardContract = await ethers.getContractAt(
      "LoyaltyCard",
      contract
    );
    await loyaltyCardContract.addOperator(operator);
    console.log("Operator added to LoyaltyCard contract");
  });
