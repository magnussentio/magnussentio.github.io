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


import { useState, useEffect } from 'react'



import CipherCompass from './components/Cipher'

function truncateAddress(address) {
  return '${address.slice(0, 6)}...${address.slice(-4)}';
}

export default function App() {
  
  const url = new URL( window.location );
  const tagId = url.searchParams.get('tagId');
  const eCode = url.searchParams.get('eCode');
  const enc = url.searchParams.get('enc');
  const cmac = url.searchParams.get('cmac');


  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();
  const networkMismatched = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  const nftDrop = useNFTDrop("0x54F14aa8122512c92e396957a89BBF3bE1CBe2CE");
  

  const [runeActiveMessage, setRuneActiveMessage] = useState("Rune Inactive");
  const [isClaiming, setIsClaiming] = useState(false);
  const { data: balance, isLoading } = useNFTBalance(nftDrop, address, "0");
  const [isShown, setIsShown] = useState(false);
  
  const runeAuth = async () => {
    try {
      const authReponse = await fetch('.netlify/functions/rune-auth', {
        method: 'POST',
        body: JSON.stringify({
          tagId,
          eCode,
          enc,
          cmac,

        }),
      });
      const content = await authReponse.json();
      console.log(content);
      if (content.message === "Authentic") {
        setRuneActiveMessage("Rune Activated")
      }
    } catch(err) {
      console.error(err);
    }
    console.log("DATA ON THE MOVE");

  };

  const checkURL = async () => {
    try { 

      if ( tagId && eCode && enc && cmac ) {
          
          runeAuth();

          
          
        } else {
          
          console.error('No rune detected')
        };

  } catch (error) {
    console.log("Not sure", error);
  }
  };

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
   useEffect(() => {
    checkURL();
    
  }, []);


  if (!address) {
    return (
      <div className="container">
        
        <h3> {runeActiveMessage} </h3>
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
    const handleClick = event => {
    setIsShown(current => !current);
    
  };
    
    return (
      <>
      <div>
      <h3> {runeActiveMessage} </h3>
        <button onClick={disconnectWallet}>Disconnect Wallet</button>
        <p> Your address: {address}</p>      
      </div>


      <button onClick={handleClick}>Cipher</button>
      {isShown && <CipherCompass dataRuneActiveMessage={runeActiveMessage} />}
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

