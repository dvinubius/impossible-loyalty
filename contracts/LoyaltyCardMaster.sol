// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// TODO TBD we could also say that the owner should always automatically be allowed to mint and operate

/**
  @title Loyalty Points Cards NFTs for Impossible Finance users.
  @author Impossible Finance
  @notice Minting only allowed for specific minter
  @notice The cards are not transferrable except for whitelisted destinations.
  @notice The cards can be burned.
  @notice The cards acccumulate points which can be redeemed. Only whitelisted operators are allowed to do so.
  @notice This contract has no knowledge of particular benefits.
  @notice Benefits for redeeming loyalty points are handled entirely by operating contracts.
  @notice Benefits operators have to ensure that, when redeeming, they deduct correct point amounts and give the benefits accordingly.
 */

contract LoyaltyCardMaster is ERC721, Ownable {
    // --- MINTING / BURNING

    address public minter; // dedicated minting operator - TODO TBD ideally another contract so we can execute dedicated on-chain logic on mint
    address public burner; // dedicated burn operator - TODO TBD ideally another contract so we can execute dedicated on-chain logic on burn
    uint256 public mintCounter;
    uint256 public burnCounter; // may come in handy for statistics

    modifier onlyMinter() {
        if (msg.sender != minter) revert NotAllowedToMint();
        _;
    }
    modifier onlyExistingToken(uint256 tokenId) {
        if (!_exists(tokenId)) revert TokenDoesntExist();
        _;
    }

    error NotAllowedToMint();
    error NotAllowedToBurn();
    error TokenDoesntExist();

    // --- POINTS

    mapping(uint256 => uint256) public tokenIdToTotalPoints;
    mapping(uint256 => uint256) public tokenIdToCurrentPoints;

    event AddedPoints(uint256 tokenId, uint256 points, address operator);
    event RedeemedPoints(uint256 tokenId, uint256 points, address operator);

    error InsufficientPoints();

    // --- OPERATORS

    mapping(address => bool) whitelistedOperator;

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

    event AddedDestination(address destination);
    event RemovedDestination(address destination);

    error AlreadyWhitelistedDestination();
    error NotWhitelistedDestination();
    error NotAllowedAsDestination();

    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
    {}

    // ================= MINTING / BURNING ================= //

    /**
      @notice Mint a new card to given account
      @param to The account to mint to
     */
    function mint(address to) public onlyMinter {
        uint256 tokenId = mintCounter++; /// @dev first tokenId will be 0;
        // TODO TBD if _safeMint is necessary (I guess we only allow persons to own these cards, so I guess not)
        _mint(to, tokenId);
    }

    function setMinter(address _minter) public onlyOwner {
        minter = _minter;
    }

    function setBurner(address _burner) public onlyOwner {
        burner = _burner;
    }

    /**
        @notice Burns a token with given tokenId
        @param tokenId The id of the token to be burned.

        @dev Following OZ's pattern: _burn() can only be called by the token owner or an approved party.
            Additionally, we say that the approved party must be our burner.
     */
    function burn(uint256 tokenId) public onlyExistingToken(tokenId) {
        address spender = _msgSender();
        address owner = ERC721.ownerOf(tokenId);
        bool isOwner = spender == owner;
        bool isApprovedBurner = (isApprovedForAll(owner, spender) ||
            getApproved(tokenId) == spender) && spender == burner;
        if (!isOwner && !isApprovedBurner) revert NotAllowedToBurn();
        burnCounter++;
        _burn(tokenId);
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
        whitelistedDestination[destinationToAdd] = true;
        emit AddedDestination(destinationToAdd);
    }

    /**
      @notice Removes a destination from the whitelisted destinations
     */
    function removeDestination(address destinationToRemove) public onlyOwner {
        whitelistedDestination[destinationToRemove] = false;
        emit RemovedDestination(destinationToRemove);
    }

    // ======================= OPERATORS ================== //

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
        whitelistedOperator[operatorToAdd] = true;
        emit AddedOperator(operatorToAdd);
    }

    /**
      @notice Removes an operator from the whitelisted operators
     */
    function removeOperator(address operatorToRemove) public onlyOwner {
        whitelistedOperator[operatorToRemove] = false;
        emit RemovedOperator(operatorToRemove);
    }
}
