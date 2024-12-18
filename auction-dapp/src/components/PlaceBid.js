import React, { useState } from 'react';
import { parseUnits } from 'ethers'; // Updated import for ethers v6

const PlaceBid = ({ blockchain }) => {
  const { auctionContract } = blockchain;
  const [bidAmount, setBidAmount] = useState('');
  const [unit, setUnit] = useState('ether'); // Default unit set to 'ether'
  const [isSubmitting, setIsSubmitting] = useState(false); // To handle button state

  const units = [
    { label: 'Wei', value: 'wei' },
    { label: 'Gwei', value: 'gwei' },
    { label: 'Ether', value: 'ether' },
    // Add more units if needed
  ];

  const placeBid = async () => {
    if (!bidAmount || isNaN(bidAmount)) {
      alert('Please enter a valid bid amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      const value = parseUnits(bidAmount, unit); // Updated usage for ethers v6
      const tx = await auctionContract.bid({ value });
      await tx.wait();
      alert('Bid placed successfully!');
      setBidAmount('');
      setUnit('ether'); // Reset to default unit if desired
    } catch (error) {
      console.error('Error placing bid:', error);
      alert('Failed to place bid. Please check the console for more details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="place-bid">
      <h2>Place a Bid</h2>
      <div className="input-group">
        <input
          type="number"
          min="0"
          step="any"
          placeholder={`Bid Amount (${unit.toUpperCase()})`}
          value={bidAmount}
          onChange={e => setBidAmount(e.target.value)}
        />
        <select
          value={unit}
          onChange={e => setUnit(e.target.value)}
        >
          {units.map(u => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </div>
      <button onClick={placeBid} disabled={isSubmitting}>
        {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
      </button>
    </div>
  );
};

export default PlaceBid;
