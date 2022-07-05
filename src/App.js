import { 
  useAddress, 
  useDisconnect, 
  useMetamask, 
  useNetworkMismatch, 
  ChainId, 
  useNetwork, 
  useNFTDrop, 
  useNFTBalance,
} from '@thirdweb-dev/react'

import { useState } from 'react'
import CipherCompass from './components/Cipher'

function truncateAddress(address) {
  return '${address.slice(0, 6)}...${address.slice(-4)}';
}

const App = () => {
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();
  const networkMismatched = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  const nftDrop = useNFTDrop("0x54F14aa8122512c92e396957a89BBF3bE1CBe2CE");

  const [isClaiming, setIsClaiming] = useState(false);
  const { data: balance, isLoading } = useNFTBalance(nftDrop, address, "0");

  const mintNft = async () => {
    try {

      if (!address) {
        connectWithMetamask();
        return;
      }

      if (networkMismatched) {
        switchNetwork(ChainId.Rinkeby);
        return;
      }

      setIsClaiming(true);
      await nftDrop.claim(1);
    } catch (error) {
      console.error("Failed to mint NFT", error);
    } finally {
      setIsClaiming(false);
    }

  };

  if (!address) {
    return (
      <div className="container">
        

        <button className="btn" onClick={connectWithMetamask}>
        Connect to access the Secret Content
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container">
        <h1>Checking Wallet for NFT....</h1>
      </div>
    );
  }

  if (balance > 0) {
    return (
      <>
      <div>
        <button onClick={disconnectWallet}>Disconnect Wallet</button>
        <p> Your address: {address}</p>      
      </div>
      <CipherCompass />
    </>
          );

  }

  return (
    <div className="container">
      <p className="address">

       

      {" "}
      <span className="value">{address}</span>
     
      </p>
      <button className="btn" disabled={isClaiming} onClick={mintNft}>
      {isClaiming ? "Claiming...." : "Mint NFT"}

      </button>
       <button onClick={disconnectWallet}>Disconnect Wallet</button>
      </div>
  );
}

export default App;
