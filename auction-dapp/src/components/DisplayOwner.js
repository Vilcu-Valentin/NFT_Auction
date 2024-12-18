import React, { useEffect, useState } from 'react';

const DisplayOwner = ({ blockchain }) => {
  const { contract } = blockchain;
  const [owner, setOwner] = useState('');

  useEffect(() => {
    const fetchOwner = async () => {
        const contractOwner = await blockchain.auctionContract.owner();
        setOwner(contractOwner);
      };      
    fetchOwner();
  }, [contract]);

  return (
    <div className="display-owner">
      <h2>Contract Owner</h2>
      <p>{owner}</p>
    </div>
  );
};

export default DisplayOwner;
