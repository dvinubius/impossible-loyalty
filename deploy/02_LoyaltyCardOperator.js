module.exports = async (hre) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const loyaltyCardMasterContract = await deployments.get("LoyaltyCardMaster");

  await deploy("LoyaltyCardOperator", {
    from: deployer,
    args: [loyaltyCardMasterContract.address],
    log: true,
  });
};
module.exports.tags = ["LoyaltyCardOperator"];
