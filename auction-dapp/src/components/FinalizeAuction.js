import React from 'react';

const FinalizeAuction = ({ blockchain }) => {
  const { auctionContract, signer } = blockchain;

  const finalizeAuction = async () => {
    try {
      const userAddress = await signer.getAddress();
      const owner = await blockchain.auctionContract.owner();
      if (userAddress.toLowerCase() !== owner.toLowerCase()) {
        alert('Only the owner can finalize the auction!');
        return;
      }

      const tx = await blockchain.auctionContract.finalizeAuction();
      await tx.wait();
      alert('Auction finalized!');
    } catch (error) {
      console.error('Error finalizing auction:', error);
    }
  };

  return (
    <div className="finalize-auction">
      <h2>Finalize Auction</h2>
      <button onClick={finalizeAuction} className="button">Finalize</button>
    </div>
  );
};

export default FinalizeAuction;
