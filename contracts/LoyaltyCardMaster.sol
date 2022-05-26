// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ILoyaltyCard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
  @title LoyaltyCardMaster is meant to be used as an operator on the Impossible Finance LoyaltyCard contract
  @notice This contract can add and redeem loyalty points for benefits associated to the loyalty card nft holders.
  @dev This contract is responsible for ensuring that benefits are actually given upon loyalty point redemption.
  If there is any on-chain logic in this regard (associated with redemption), it should executed by this contract.
 */

contract LoyaltyCardMaster is Ownable {
    ILoyaltyCard public loyaltyCard;

    constructor(address loyaltyCardAddress) {
        loyaltyCard = ILoyaltyCard(loyaltyCardAddress);
    }

    /**
      @dev Typically this would be called internally, but for this contract stub we allow the owner to call it.
     */
    function addPoints(uint256 tokenId, uint256 amount) public onlyOwner {
        loyaltyCard.addPoints(tokenId, amount);
    }

    function redeemPointsForBenefit(uint256 tokenId, uint256 amount)
        public
        onlyOwner
    {
        loyaltyCard.redeemPoints(tokenId, amount);

        // TODO logic that gives benefit to cardOwner
        // address cardOwner = IERC721(address(loyaltyCard)).ownerOf(tokenId);
    }

    // redeemPointsForBenefit2(...) -> we'd use more revealing names, but the idea is to have a separate
    // function for each benefit (makes operating this contract less prone to human error)
}
