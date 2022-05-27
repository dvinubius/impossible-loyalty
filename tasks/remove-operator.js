task(
  "remove-operator",
  "Removes an operator from the LoyaltyCardMaster contract"
)
  .addParam("contract", "The address of the LoyaltyCardMaster contract")
  .addParam("operator", "The address of the operator")
  .setAction(async ({ contract, operator }, { ethers }) => {
    const loyaltyCardMasterContract = await ethers.getContractAt(
      "LoyaltyCardMaster",
      contract
    );
    await loyaltyCardMasterContract.removeOperator(operator);
    console.log("Operator removed form LoyaltyCardMaster contract");
  });
