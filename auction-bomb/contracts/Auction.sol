// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFunBombNFT {
    function mintNFT(address to, string memory tokenURI) external;
}

contract Auction {
    uint256 public auctionEndTime;
    address payable public highestBidder;
    uint256 public highestBid;
    bool public ended;

    address public owner;
    mapping(address => uint256) public pendingReturns;
    string public currentTokenURI; 
    IFunBombNFT public nftContract;

    event NewBid(address indexed bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);
    event Withdrawal(address indexed bidder, uint256 amount);
    // Add AuctionStarted event
    event AuctionStarted(uint256 endTime, string tokenURI);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier auctionActive() {
        require(block.timestamp < auctionEndTime, "Auction already ended");
        _;
    }

    modifier auctionEndedCheck() {
        require(block.timestamp >= auctionEndTime, "Auction still ongoing");
        require(!ended, "Auction has already been finalized");
        _;
    }

    constructor(address _nftContract) {
        owner = msg.sender;
        nftContract = IFunBombNFT(_nftContract);
    }

    function startAuction(uint256 _duration, string memory _tokenURI) external onlyOwner {
        require(auctionEndTime == 0 || block.timestamp >= auctionEndTime, "Auction already active");
        auctionEndTime = block.timestamp + _duration;
        highestBid = 0;
        highestBidder = payable(address(0));
        ended = false;
        currentTokenURI = _tokenURI;
        emit AuctionStarted(auctionEndTime, _tokenURI); // Emit the event
    }

    function bid() external payable auctionActive {
        require(msg.value > highestBid, "Bid not high enough");

        // Check how much time is left
        uint256 timeLeft = auctionEndTime > block.timestamp ? (auctionEndTime - block.timestamp) : 0;

        // If less than 30 seconds remain, extend the auction by setting it to 60 seconds from now
        if (timeLeft < 30) {
            auctionEndTime = block.timestamp + 60;
            emit AuctionStarted(auctionEndTime, currentTokenURI); // Emit the event if auction is extended
        }

        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid;
        }

        highestBid = msg.value;
        highestBidder = payable(msg.sender);

        emit NewBid(msg.sender, msg.value);
    }

    function withdraw() external returns (bool) {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "No funds to withdraw");

        pendingReturns[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            pendingReturns[msg.sender] = amount;
            return false;
        }

        emit Withdrawal(msg.sender, amount);
        return true;
    }

    function finalizeAuction() external auctionEndedCheck onlyOwner {
        ended = true;
        if (highestBidder != address(0)) {
            // Mint the NFT in the separate NFT contract
            nftContract.mintNFT(highestBidder, currentTokenURI);
        }
        emit AuctionEnded(highestBidder, highestBid);
    }
}
