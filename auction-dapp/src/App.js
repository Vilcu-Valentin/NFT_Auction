import React, { useEffect, useState } from 'react';
import { getBlockchain } from './utils/constants';
import AuctionStatus from './components/AuctionStatus';
import PlaceBid from './components/PlaceBid';
import FinalizeAuction from './components/FinalizeAuction';
import NFTDisplay from './components/NFTDisplay';
import StartAuction from './components/StartAuction';
import DisplayOwner from './components/DisplayOwner';
import WithdrawFunds from './components/WithdrawFunds';
import './App.css'; // Import the CSS

function App() {
  const [blockchain, setBlockchain] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const initBlockchain = async () => {
      try {
        const { provider, signer, auctionContract, nftContract } = await getBlockchain();
        setBlockchain({ provider, signer, auctionContract, nftContract });
        const address = await signer.getAddress();
        setCurrentAccount(address);

        if (window.ethereum) {
          window.ethereum.on('accountsChanged', async (accounts) => {
            const newAccount = accounts[0] || null;
            setCurrentAccount(newAccount);

            if (newAccount) {
              const { provider, signer, auctionContract, nftContract } = await getBlockchain();
              setBlockchain({ provider, signer, auctionContract, nftContract });
              // Trigger a refreshKey increment to refresh data for the new account
              setRefreshKey((prev) => prev + 1);
            } else {
              setBlockchain(null);
            }
          });

          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });
        }
      } catch (error) {
        console.error('Failed to connect to blockchain:', error);
      }
    };

    initBlockchain();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const newAccount = accounts[0];
        setCurrentAccount(newAccount);

        const { provider, signer, auctionContract, nftContract } = await getBlockchain();
        setBlockchain({ provider, signer, auctionContract, nftContract });
        // Trigger a refresh on connect
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error('User rejected the request:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  // Listen to auction contract events and refresh the UI on each event
  useEffect(() => {
    if (!blockchain || !blockchain.auctionContract) return;

    const { auctionContract } = blockchain;

    const handleNewBid = (bidder, amount) => {
      console.log("NewBid event detected:", bidder, amount.toString());
      setRefreshKey((prev) => prev + 1);
    };

    const handleAuctionEnded = (winner, amount) => {
      console.log("AuctionEnded event detected:", winner, amount.toString());
      setRefreshKey((prev) => prev + 1);
    };

    const handleWithdrawal = (bidder, amount) => {
      console.log("Withdrawal event detected:", bidder, amount.toString());
      setRefreshKey((prev) => prev + 1);
    };

    const handleAuctionStarted = (endTime, tokenURI) => {
      console.log("AuctionStarted event detected:", endTime, tokenURI);
      setRefreshKey((prev) => prev + 1);
    };

    auctionContract.on('NewBid', handleNewBid);
    auctionContract.on('AuctionEnded', handleAuctionEnded);
    auctionContract.on('Withdrawal', handleWithdrawal);
    auctionContract.on('AuctionStarted', handleAuctionStarted); // Listen to AuctionStarted

    return () => {
      // Cleanup on unmount
      auctionContract.off('NewBid', handleNewBid);
      auctionContract.off('AuctionEnded', handleAuctionEnded);
      auctionContract.off('Withdrawal', handleWithdrawal);
      auctionContract.off('AuctionStarted', handleAuctionStarted);
    };
  }, [blockchain]);

  return (
    <div className="App">
      <header>
        <div className="header-container">
          <div className="logo">
            <h1>Fun Bomb Auction</h1>
          </div>
          {currentAccount ? (
            <p>Connected: {currentAccount}</p>
          ) : (
            <button onClick={connectWallet} className="button">Connect MetaMask</button>
          )}
        </div>
      </header>
      <div className="container">
        {blockchain && currentAccount ? (
          <div>
            <DisplayOwner blockchain={blockchain} refreshKey={refreshKey} />
            <StartAuction blockchain={blockchain} refreshKey={refreshKey} setRefreshKey={setRefreshKey}/>
            <AuctionStatus blockchain={blockchain} refreshKey={refreshKey} />
            <PlaceBid blockchain={blockchain} refreshKey={refreshKey} />
            <WithdrawFunds blockchain={blockchain} currentAccount={currentAccount} refreshKey={refreshKey} />
            <FinalizeAuction blockchain={blockchain} refreshKey={refreshKey} setRefreshKey={setRefreshKey}/>
            <NFTDisplay blockchain={blockchain} currentAccount={currentAccount} refreshKey={refreshKey} />
          </div>
        ) : (
          <p>Please connect your wallet to interact with the auction.</p>
        )}
      </div>
      <div className="credits">
        &copy; 2024 Fun Bomb Auction. All rights reserved.
      </div>
    </div>
  );
}

export default App;
