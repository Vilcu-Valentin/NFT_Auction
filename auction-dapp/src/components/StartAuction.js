import React, { useState } from 'react';

const StartAuction = ({ blockchain, refreshKey, setRefreshKey }) => {
  const { auctionContract, signer } = blockchain;
  const [duration, setDuration] = useState('');

  const startAuction = async () => {
    try {
      const userAddress = await signer.getAddress();
      const owner = await auctionContract.owner();
      if (userAddress.toLowerCase() !== owner.toLowerCase()) {
        alert('Only the owner can start the auction!');
        return;
      }

      const durationInSeconds = parseInt(duration, 10); // Convert string to integer
      if (isNaN(durationInSeconds) || durationInSeconds <= 0) {
        alert('Please enter a valid duration in seconds.');
        return;
      }

      // Randomly select a number between 1 and 100
      const randomNumber = Math.floor(Math.random() * 100) + 1;
      // Construct the tokenURI using the base IPFS path and the random number
      const baseURI = "https://ipfs.io/ipfs/QmSzBSpBxXovxULkEMupJdbgbypu4B4Qj2g6Fnpgg6zMTF/";
      const selectedTokenURI = `${baseURI}${randomNumber}.json`;

      const tx = await auctionContract.startAuction(durationInSeconds, selectedTokenURI);
      await tx.wait();
      alert(`Auction started with NFT #${randomNumber}!`);
      setRefreshKey((prev) => prev + 1); // Trigger refresh after starting auction
    } catch (error) {
      console.error('Error starting auction:', error);
      alert('Failed to start auction. See console for details.');
    }
  };

  return (
    <div className="start-auction">
      <h2>Start Auction</h2>
      <input
        type="number"
        placeholder="Duration (seconds)"
        value={duration}
        onChange={e => setDuration(e.target.value)}
      />
      {/* Removed the IPFS URI input field */}
      <button onClick={startAuction} className="button">Start Auction</button>
    </div>
  );
};

export default StartAuction;
