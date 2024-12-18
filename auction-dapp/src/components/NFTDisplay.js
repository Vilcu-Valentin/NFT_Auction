import React, { useEffect, useState } from 'react';

const NFTDisplay = ({ blockchain, currentAccount, refreshKey }) => { // Add refreshKey as a prop
  const { nftContract } = blockchain;
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [nftData, setNftData] = useState([]);

  const fetchOwnedTokens = async () => {
    try {
      const total = await nftContract.totalMinted();
      const tokens = [];
      for (let i = 1; i <= total; i++) {
        try {
          const ownerAddr = await nftContract.ownerOf(i);
          if (ownerAddr.toLowerCase() === currentAccount.toLowerCase()) {
            tokens.push(i);
          }
        } catch (err) {
          break;
        }
      }
      setOwnedTokens(tokens);
    } catch (err) {
      console.error("Error fetching owned tokens:", err);
    }
  };

  const fetchMetadata = async (tokenId) => {
    try {
      const tokenURI = await nftContract.tokenURI(tokenId);
      const metadataURL = tokenURI.startsWith('ipfs://') 
        ? tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/') 
        : tokenURI;
      const response = await fetch(metadataURL);
      const metadata = await response.json();
      const imageUrl = metadata.properties.files[0].uri.replace('ipfs://', 'https://ipfs.io/ipfs/');

      return {
        tokenId,
        name: metadata.name,
        description: metadata.description,
        imageUrl,
        attributes: metadata.attributes
      };
    } catch (error) {
      console.error(`Error fetching metadata for token ${tokenId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    if (currentAccount && nftContract) {
      fetchOwnedTokens();
    }
    // eslint-disable-next-line
  }, [nftContract, currentAccount, refreshKey]); // Add refreshKey to dependencies

  useEffect(() => {
    const loadData = async () => {
      const data = [];
      for (const tokenId of ownedTokens) {
        const meta = await fetchMetadata(tokenId);
        if (meta) {
          data.push(meta);
        }
      }
      setNftData(data);
    };
    if (ownedTokens.length > 0) {
      loadData();
    } else {
      setNftData([]); // Clear NFT data if no tokens are owned
    }
    // eslint-disable-next-line
  }, [ownedTokens, refreshKey]); // Add refreshKey to dependencies

  return (
    <div className="nft-display">
      <h2>Your NFTs</h2>
      {nftData.length === 0 ? (
        <p>You don't own any NFTs from this contract yet.</p>
      ) : (
        nftData.map(({ tokenId, name, description, imageUrl, attributes }) => (
          <div key={tokenId} className="nft-card">
            <h3>{name}</h3>
            <img src={imageUrl} alt={name} style={{ width: '200px', height: '200px' }} />
            <p>{description}</p>
            {attributes && attributes.length > 0 && (
              <ul>
                {attributes.map((attr, i) => (
                  <li key={i}><strong>{attr.trait_type}:</strong> {attr.value}</li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default NFTDisplay;
