// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ILoyaltyCardMaster.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
  @title LoyaltyCardOperator is meant to be used as an operator on the Impossible Finance LoyaltyCardMaster contract
  @notice This contract can add and redeem loyalty points for benefits associated to the loyalty card nft holders.
  @dev This contract is responsible for ensuring that benefits are actually given upon loyalty point redemption.
  If there is any on-chain logic in this regard (associated with redemption), it should executed by this contract.
 */

contract LoyaltyCardOperator is Ownable {
    ILoyaltyCardMaster public loyaltyCardMaster;

    constructor(address loyaltyCardMasterAddress) {
        loyaltyCardMaster = ILoyaltyCardMaster(loyaltyCardMasterAddress);
    }

    /**
      @dev Typically this would be called internally, but for this contract stub we allow the owner to call it.
     */
    function addPoints(uint256 tokenId, uint256 amount) public onlyOwner {
        loyaltyCardMaster.addPoints(tokenId, amount);
    }

    function redeemPointsForBenefit(uint256 tokenId, uint256 amount)
        public
        onlyOwner
    {
        loyaltyCardMaster.redeemPoints(tokenId, amount);

        // TODO logic that gives benefit to cardOwner
        // address cardOwner = IERC721(address(loyaltyCardMaster)).ownerOf(tokenId);
    }

    // redeemPointsForBenefit2(...) -> we'd use more revealing names, but the idea is to have a separate
    // function for each benefit (makes operating this contract less prone to human error)
}
