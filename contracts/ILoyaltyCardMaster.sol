// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
  @title Interface for the loyalty card use-case-specific functions 
         of the Impossible Finance LoyaltyCardMaster contract
  @author Impossible Finance
 */
interface ILoyaltyCardMaster {
    function mint(address to) external;

    function setMinter(address _minter) external;

    function setBurner(address _burner) external;

    function burn(uint256 tokenId) external;

    function totalPoints(uint256 tokenId) external;

    function currentPoints(uint256 tokenId) external;

    function addPoints(uint256 tokenId, uint256 points) external;

    function redeemPoints(uint256 tokenId, uint256 points) external;

    function isDestination(address dest) external;

    function addDestination(address destinationToAdd) external;

    function removeDestination(address destinationToRemove) external;

    function isOperator(address op) external;

    function addOperator(address operatorToAdd) external;

    function removeOperator(address operatorToRemove) external;
}
