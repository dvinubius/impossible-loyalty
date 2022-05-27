module.exports = async (hre) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("LoyaltyCardMaster", {
    from: deployer,
    args: ["ImpossibleLoyaltyCard", "ILC"],
    log: true,
  });
};
module.exports.tags = ["LoyaltyCardMaster"];
