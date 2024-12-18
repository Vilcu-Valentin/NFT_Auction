// src/components/WithdrawFunds.js
import React, { useEffect, useState } from 'react';

const WithdrawFunds = ({ blockchain, currentAccount, refreshKey }) => { // Added refreshKey as a prop
  const { auctionContract } = blockchain;
  const [pendingReturn, setPendingReturn] = useState('0');

  const fetchPendingReturns = async () => {
    try {
      const amount = await auctionContract.pendingReturns(currentAccount);
      setPendingReturn(amount.toString());
    } catch (error) {
      console.error('Error fetching pending returns:', error);
    }
  };

  const withdraw = async () => {
    try {
      const tx = await auctionContract.withdraw();
      await tx.wait();
      alert('Withdrawal successful!');
      fetchPendingReturns(); // Refresh the pending returns after withdrawal
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      alert('Withdrawal failed!');
    }
  };

  useEffect(() => {
    if (currentAccount && auctionContract) {
      fetchPendingReturns();
    }
  }, [currentAccount, auctionContract, refreshKey]); // Added refreshKey to dependencies

  return (
    <div className="withdraw-funds">
      <h2>Withdraw Funds</h2>
      {pendingReturn === '0' ? (
        <p>You have no funds to withdraw.</p>
      ) : (
        <>
          <p>You have {pendingReturn} wei (or {Number(pendingReturn) / 1e18} ETH) available to withdraw.</p>
          <button onClick={withdraw} className="button">Withdraw</button>
        </>
      )}
    </div>
  );
};

export default WithdrawFunds;
