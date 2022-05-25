module.exports = async (hre) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("LoyaltyCard", {
    from: deployer,
    args: ["ImpossibleLoyaltyCard", "ILC"],
    log: true,
  });
};
module.exports.tags = ["LoyaltyCard"];
