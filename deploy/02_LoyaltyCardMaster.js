module.exports = async (hre) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const loyaltyCardContract = await deployments.get("LoyaltyCard");

  await deploy("LoyaltyCardMaster", {
    from: deployer,
    args: [loyaltyCardContract.address],
    log: true,
  });
};
module.exports.tags = ["LoyaltyCardMaster"];
