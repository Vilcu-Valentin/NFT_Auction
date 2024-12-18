// src/components/AuctionStatus.js
import React, { useEffect, useState } from 'react';
import { formatEther } from 'ethers';

const AuctionStatus = ({ blockchain, refreshKey }) => {
  const { auctionContract } = blockchain;
  const [highestBid, setHighestBid] = useState('0');
  const [highestBidder, setHighestBidder] = useState('0x0');
  const [auctionEndTime, setAuctionEndTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [currentNFT, setCurrentNFT] = useState(null); // New state for current NFT

  const fetchAuctionDetails = async () => {
    try {
      const [bid, bidder, endTime] = await Promise.all([
        auctionContract.highestBid(),
        auctionContract.highestBidder(),
        auctionContract.auctionEndTime(),
      ]);
      setHighestBid(formatEther(bid));
      setHighestBidder(bidder);
      setAuctionEndTime(Number(endTime));
      calculateTimeRemaining(Number(endTime));

      // Fetch currentTokenURI only if auction is active
      const currentTime = Math.floor(Date.now() / 1000);
      if (endTime > currentTime && !await auctionContract.ended()) {
        // Assuming currentTokenURI is public
        const tokenURI = await auctionContract.currentTokenURI();
        await fetchCurrentNFTMetadata(tokenURI);
      } else {
        setCurrentNFT(null); // No active auction
      }
    } catch (error) {
      console.error('Error fetching auction details:', error);
    }
  };

  const calculateTimeRemaining = (endTime) => {
    const now = Math.floor(Date.now() / 1000);
    const secondsRemaining = endTime - now;

    if (endTime === 0) {
      setTimeRemaining('No active auction');
      return;
    }

    if (secondsRemaining <= 0) {
      setTimeRemaining('Auction ended');
      return;
    }

    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;
    setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
  };

  const fetchCurrentNFTMetadata = async (tokenURI) => {
    try {
      // Convert IPFS URI to a gateway URL if necessary
      const metadataURL = tokenURI.startsWith('ipfs://') 
        ? tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/') 
        : tokenURI;

      const response = await fetch(metadataURL);
      if (!response.ok) {
        throw new Error('Failed to fetch NFT metadata');
      }
      const metadata = await response.json();

      // Extract image URI and convert to gateway URL
      const imageURI = metadata.properties?.files[0]?.uri || metadata.image;
      const imageUrl = imageURI.startsWith('ipfs://') 
        ? imageURI.replace('ipfs://', 'https://ipfs.io/ipfs/') 
        : imageURI;

      setCurrentNFT({
        name: metadata.name,
        description: metadata.description,
        imageUrl,
        attributes: metadata.attributes,
      });
    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
      setCurrentNFT(null);
    }
  };

  useEffect(() => {
    fetchAuctionDetails();
    const interval = setInterval(() => {
      calculateTimeRemaining(auctionEndTime);
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [auctionEndTime, refreshKey]); // Add refreshKey to dependencies

  useEffect(() => {
    if (!auctionContract) return;

    const onNewBid = (bidder, amount) => {
      setHighestBid(formatEther(amount));
      setHighestBidder(bidder);
    };

    const onAuctionEnded = (winner, amount) => {
      setTimeRemaining('Auction ended');
      fetchAuctionDetails(); // Fetch latest details after auction ends
    };

    const onAuctionStarted = (endTime, tokenURI) => {
      setAuctionEndTime(Number(endTime));
      setTimeRemaining('');
      fetchAuctionDetails(); // Fetch latest details when auction starts
      fetchCurrentNFTMetadata(tokenURI); // Fetch and set current NFT metadata
    };

    // Listen to AuctionStarted
    auctionContract.on('AuctionStarted', onAuctionStarted);

    // Listen to existing events
    auctionContract.on('NewBid', onNewBid);
    auctionContract.on('AuctionEnded', onAuctionEnded);

    return () => {
      auctionContract.off('NewBid', onNewBid);
      auctionContract.off('AuctionEnded', onAuctionEnded);
      auctionContract.off('AuctionStarted', onAuctionStarted);
    };
  }, [auctionContract]);

  return (
    <div className="auction-status">
      <h2>Auction Status</h2>
      <div className="status-details">
        <p><strong>Highest Bid:</strong> {highestBid} ETH</p>
        <p><strong>Highest Bidder:</strong> {highestBidder}</p>
        <p className="timer"><strong>Time Remaining:</strong> {timeRemaining}</p>
      </div>

      {currentNFT && (
        <div className="current-nft">
          <h3>Current NFT for Auction</h3>
          <img src={currentNFT.imageUrl} alt={currentNFT.name} style={{ width: '200px', height: '200px' }} />
          <p><strong>Name:</strong> {currentNFT.name}</p>
          <p><strong>Description:</strong> {currentNFT.description}</p>
          {currentNFT.attributes && currentNFT.attributes.length > 0 && (
            <ul>
              {currentNFT.attributes.map((attr, index) => (
                <li key={index}><strong>{attr.trait_type}:</strong> {attr.value}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AuctionStatus;
