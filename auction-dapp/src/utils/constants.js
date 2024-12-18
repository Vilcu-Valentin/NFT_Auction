import { Contract, BrowserProvider } from 'ethers';
import Auction from '../contracts/Auction.json';
import FunBombNFT from '../contracts/FunBombNFT.json';

export const getBlockchain = async () => {
  if (!window.ethereum) {
    alert('Please install MetaMask!');
    throw new Error('MetaMask not detected');
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();

  // Check chainId if needed
  if (network.chainId != 1337) {
    alert('Please connect to Localhost 1337');
    throw new Error('Incorrect network');
  }

  const auctionAddress = process.env.REACT_APP_AUCTION_CONTRACT_ADDRESS;
  const nftAddress = process.env.REACT_APP_NFT_CONTRACT_ADDRESS;

  const auctionContract = new Contract(auctionAddress, Auction.abi, signer);
  const nftContract = new Contract(nftAddress, FunBombNFT.abi, signer);

  return { provider, signer, auctionContract, nftContract };
};
