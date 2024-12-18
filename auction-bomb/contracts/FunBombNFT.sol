// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract FunBombNFT is ERC721URIStorage {
    address public owner;
    address public auctionContract;
    uint256 private tokenIdCounter;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAuctionContract() {
        require(msg.sender == auctionContract, "Only auction contract can mint");
        _;
    }

    constructor() ERC721("FunBombNFT", "BOMB") {
        owner = msg.sender;
    }

    function setAuctionContract(address _auctionContract) external onlyOwner {
        auctionContract = _auctionContract;
    }

    function mintNFT(address to, string memory tokenURI) external onlyAuctionContract {
        tokenIdCounter++;
        _mint(to, tokenIdCounter);
        _setTokenURI(tokenIdCounter, tokenURI);
    }

    function totalMinted() external view returns (uint256) {
        return tokenIdCounter;
    }
}
