const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Auction Contract", function () {
    let AuctionFactory;
    let auction;
    let owner;
    let addr1;
    let addr2;

    before(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        AuctionFactory = await ethers.getContractFactory("Auction");
        auction = await AuctionFactory.deploy();
        await auction.waitForDeployment(); // ethers v6.x equivalent of `deployed`
        console.log("Auction deployed to:", auction.target);
    });

    it("Should allow owner to start an auction", async function () {
        const duration = 3600; // 1 hour
        const tx = await auction.startAuction(duration);
        await tx.wait();

        const auctionEndTime = await auction.auctionEndTime();
        const currentTime = (await ethers.provider.getBlock('latest')).timestamp;
        expect(auctionEndTime).to.equal(currentTime + duration);
    });

    it("Should allow users to place bids", async function () {
        const bidAmount = ethers.parseEther("1.0");

        const tx = await auction.connect(addr1).bid({ value: bidAmount });
        await tx.wait();

        const highestBid = await auction.highestBid();
        expect(highestBid).to.equal(bidAmount);

        const highestBidder = await auction.highestBidder();
        expect(highestBidder).to.equal(addr1.address);
    });

    it("Should allow higher bids and record pending returns", async function () {
        const bidAmount = ethers.parseEther("2.0");

        // Before bidding, check pendingReturns for addr1 is 0
        let pending = await auction.pendingReturns(addr1.address);
        expect(pending).to.equal(0);

        const tx = await auction.connect(addr2).bid({ value: bidAmount });
        await tx.wait();

        // After bidding, pendingReturns for addr1 should be 1 ether
        pending = await auction.pendingReturns(addr1.address);
        expect(pending).to.equal(ethers.parseEther("1.0"));

        const highestBid = await auction.highestBid();
        expect(highestBid).to.equal(bidAmount);

        const highestBidder = await auction.highestBidder();
        expect(highestBidder).to.equal(addr2.address);
    });

    it("Should finalize auction and mint NFT to highest bidder", async function () {
        // Fast forward time to end the auction
        await ethers.provider.send("evm_increaseTime", [3600]);
        await ethers.provider.send("evm_mine", []);

        const tx = await auction.finalizeAuction();
        await tx.wait();

        const ended = await auction.ended();
        expect(ended).to.equal(true);

        const nftOwner = await auction.ownerOf(1);
        expect(nftOwner).to.equal(addr2.address);
    });
});
