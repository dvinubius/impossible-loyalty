// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

// TODO TBD we could also say that the owner should always automatically be allowed to mint and operate

/**
  @title Loyalty Points Cards NFTs for Impossible Finance users
  @notice Minting only allowed for specific minter
  @notice The cards are not transferrable except for whitelisted destinations.
  @notice The cards acccumulate points which can be redeemed. Only whitelisted operators are allowed to do so.
  @notice This contract has no knowledge of particular benefits.
  @notice Benefits for redeeming loyalty points are handled entirely by operating contracts.
  @notice Benefits operators have to ensure that, when redeeming, they deduct correct point amounts and give the benefits accordingly.
 */

contract LoyaltyCard is ERC721, Ownable {
    // --- MINTING

    address public minter; // dedicated minting operator - TODO TBD if this is the right way to go. could also be just contract owner for simplicity
    uint256 public supply; // used as mint counter

    modifier onlyMinter() {
        if (msg.sender != minter) revert NotAllowedToMint();
        _;
    }

    modifier onlyExistingToken(uint256 tokenId) {
        // TODO TBD could also use conditino   tokenId < supply   if we are sure we'll never burn them
        if (!_exists(tokenId)) revert TokenDoesntExist();
        _;
    }

    error NotAllowedToMint();
    error TokenDoesntExist();

    // --- POINTS

    mapping(uint256 => uint256) public tokenIdToTotalPoints;
    mapping(uint256 => uint256) public tokenIdToCurrentPoints;

    event AddedPoints(uint256 tokenId, uint256 points, address operator);
    event RedeemedPoints(uint256 tokenId, uint256 points, address operator);

    error InsufficientPoints();

    // --- OPERATORS

    mapping(address => bool) whitelistedOperator;
    address[] operators; // ordering not guaranteed

    modifier onlyOperator() {
        if (!whitelistedOperator[msg.sender]) revert NotAllowedToOperate();
        _;
    }

    event AddedOperator(address operator);
    event RemovedOperator(address operator);

    error AlreadyWhitelistedOperator();
    error NotWhitelistedOperator();
    error NotAllowedToOperate();

    // --- TRANSFERS

    mapping(address => bool) whitelistedDestination;
    address[] destinations; // ordering not guaranteed

    event AddedDestination(address destination);
    event RemovedDestination(address destination);

    error AlreadyWhitelistedDestination();
    error NotWhitelistedDestination();
    error NotAllowedAsDestination();

    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
    {}

    // ======================= MINTING ===================== //

    /**
      @notice Mint a new card to given account
      @param to The account to mint to
     */
    function mint(address to) public onlyMinter {
        uint256 tokenId = supply++; /// @dev first tokenId will be 0;
        // TODO TBD if _safeMint is necessary (I guess we only allow persons to own these cards, so I guess not)
        _mint(to, tokenId);
    }

    function setMinter(address _minter) public onlyOwner {
        minter = _minter;
    }

    // ======================= POINTS ====================== //

    /**
      @notice Retrieve total number of points this card has accumulated historically
      @param tokenId The tokenId of the card
     */
    function totalPoints(uint256 tokenId)
        public
        view
        onlyExistingToken(tokenId)
        returns (uint256)
    {
        return tokenIdToTotalPoints[tokenId];
    }

    /**
      @notice Retrieve current number of points this card has
      @param tokenId The tokenId of the card
     */
    function currentPoints(uint256 tokenId)
        public
        view
        onlyExistingToken(tokenId)
        returns (uint256)
    {
        return tokenIdToCurrentPoints[tokenId];
    }

    /**
      @notice Add loyalty points to a given card
      @param tokenId The loyalty card to add points to
      @param points Number of points to add
     */
    function addPoints(uint256 tokenId, uint256 points) public onlyOperator {
        tokenIdToTotalPoints[tokenId] += points;
        tokenIdToCurrentPoints[tokenId] += points;
        emit AddedPoints(tokenId, points, msg.sender);
    }

    /**
      @notice Redeem loyalty points from a card
      @param tokenId The loyalty card to redeem points from
      @param points Number of points to redeem
     */
    function redeemPoints(uint256 tokenId, uint256 points) public onlyOperator {
        if (points > tokenIdToCurrentPoints[tokenId])
            revert InsufficientPoints();
        tokenIdToCurrentPoints[tokenId] -= points;
        emit RedeemedPoints(tokenId, points, msg.sender);
    }

    // ======================= TRANSFERS ================== //

    /**
      @dev Override the ERC721 default in order to block transfers to non-whitelisted destinations
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        if (!whitelistedDestination[to]) revert NotAllowedAsDestination();
        super._transfer(from, to, tokenId);
    }

    /**
      @notice Returns all whitelisted destinations. 
      
      Ordering of the result may differ in time due to add/remove operations.
     */
    function getDestinations() public view returns (address[] memory dests) {
        dests = new address[](destinations.length);
        for (uint256 i = 0; i < destinations.length; i++) {
            dests[i] = destinations[i];
        }
    }

    /**
      @notice Returns whether given address may be receiver of tokens via transfer
      @param dest Address to check
     */
    function isDestination(address dest) public view returns (bool) {
        return whitelistedDestination[dest];
    }

    /**
      @notice Adds a destination to the whitelisted destinations
    */
    function addDestination(address destinationToAdd) public onlyOwner {
        if (whitelistedDestination[destinationToAdd])
            revert AlreadyWhitelistedDestination();
        whitelistedDestination[destinationToAdd] = true;
        destinations.push(destinationToAdd);
        emit AddedDestination(destinationToAdd);
    }

    /**
      @notice Removes a destination from the whitelisted destinations
      @dev The ordering is not preserved
     */
    function removeDestination(address destinationToRemove) public onlyOwner {
        if (!whitelistedDestination[destinationToRemove])
            revert NotWhitelistedDestination();
        whitelistedDestination[destinationToRemove] = false;

        for (uint256 i = 0; i < destinations.length; i++) {
            if (destinations[i] == destinationToRemove) {
                if (i < destinations.length - 1) {
                    // put last destination into its place
                    address last = destinations[destinations.length - 1];
                    destinations[i] = last;
                    destinations.pop();
                    break;
                } else {
                    // just remove it
                    destinations.pop();
                }
            }
        }
        emit RemovedDestination(destinationToRemove);
    }

    // ======================= OPERATORS ================== //

    /**
      @notice Returns all whitelisted operators. Ordering of the result may differ in time due to add/remove operations.
     */
    function getOperators() public view returns (address[] memory ops) {
        ops = new address[](operators.length);
        for (uint256 i = 0; i < operators.length; i++) {
            ops[i] = operators[i];
        }
    }

    /**
      @notice Returns whether given address may operate
      @param op Address to check
     */
    function isOperator(address op) public view returns (bool) {
        return whitelistedOperator[op];
    }

    /**
      @notice Adds an operator to the whitelisted operators
     */
    function addOperator(address operatorToAdd) public onlyOwner {
        if (whitelistedOperator[operatorToAdd])
            revert AlreadyWhitelistedOperator();
        whitelistedOperator[operatorToAdd] = true;
        operators.push(operatorToAdd);
        emit AddedOperator(operatorToAdd);
    }

    /**
      @notice Removes an operator from the whitelisted operators
      @dev The ordering is not preserved
     */
    function removeOperator(address operatorToRemove) public onlyOwner {
        if (!whitelistedOperator[operatorToRemove])
            revert NotWhitelistedOperator();
        whitelistedOperator[operatorToRemove] = false;

        for (uint256 i = 0; i < operators.length; i++) {
            if (operators[i] == operatorToRemove) {
                if (i < operators.length - 1) {
                    // put last operator into its place
                    address last = operators[operators.length - 1];
                    operators[i] = last;
                    operators.pop();
                    break;
                } else {
                    // just remove it
                    operators.pop();
                }
            }
        }
        emit RemovedOperator(operatorToRemove);
    }
}
