task("add-operator", "Adds an operator to the LoyaltyCardMaster contract")
  .addParam("contract", "The address of the LoyaltyCardMaster contract")
  .addParam("operator", "The address of the operator")
  .setAction(async ({ contract, operator }, { ethers }) => {
    const loyaltyCardMasterContract = await ethers.getContractAt(
      "LoyaltyCardMaster",
      contract
    );
    await loyaltyCardMasterContract.addOperator(operator);
    console.log("Operator added to LoyaltyCardMaster contract");
  });
