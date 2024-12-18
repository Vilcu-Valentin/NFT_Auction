const { ethers } = require("hardhat");

async function main() {
    // Deploy the FunBombNFT contract first
    const FunBombNFT = await ethers.getContractFactory("FunBombNFT");
    const funBombNFT = await FunBombNFT.deploy();
    await funBombNFT.waitForDeployment();
    const funBombNFTAddress = await funBombNFT.getAddress();
    console.log("FunBombNFT deployed to:", funBombNFTAddress);

    // Deploy the Auction contract, passing in the NFT contract address
    const Auction = await ethers.getContractFactory("Auction");
    const auction = await Auction.deploy(funBombNFTAddress);
    await auction.waitForDeployment();
    const auctionAddress = await auction.getAddress();
    console.log("Auction deployed to:", auctionAddress);

    // Now authorize the Auction contract to mint NFTs on FunBombNFT
    // For this, we need to connect as the owner of FunBombNFT.
    // Since we just deployed it from the default account, we have ownership.
    const nftOwner = await ethers.getSigners();
    const nftOwnerSigner = nftOwner[0]; // The deployer is the first signer by default

    const funBombNFTConnected = funBombNFT.connect(nftOwnerSigner);

    const tx = await funBombNFTConnected.setAuctionContract(auctionAddress);
    await tx.wait();
    console.log("Auction contract set in FunBombNFT");

    console.log("Deployment completed successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
