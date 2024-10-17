import './App.css';
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { Button, TextField, Typography, Card, CardContent, CardMedia } from '@mui/material';
import NFTMarketplaceABI from './NFTMarketplaceABI.json'; // Replace with your ABI file

const CONTRACT_ADDRESS = '0x8F6636b2CB02488d52F93dF3f0357fdEEba07b77'; // Replace with your contract address

function App() {
  const [account, setAccount] = useState("");
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Keeping image URL as input
  const [nfts, setNfts] = useState([]);
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);

  // Initialize web3 and connect to the smart contract
  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      const nftContract = new web3Instance.eth.Contract(NFTMarketplaceABI, CONTRACT_ADDRESS);
      setContract(nftContract);
    }
  }, []);

  // Connect MetaMask wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("User denied account access");
      }
    } else {
      alert("MetaMask not detected. Please install MetaMask.");
    }
  };

  // List a new NFT by calling the smart contract
  const handleListNFT = async (e) => {
    e.preventDefault();
    if (nftName && nftDescription && price && imageUrl && contract && account) {
      const priceInWei = web3.utils.toWei(price, 'ether');
      await contract.methods.listNFT(nftName, nftDescription, priceInWei, imageUrl)
        .send({ from: account });
      alert('NFT Listed Successfully');
      fetchNFTs(); // Refresh the NFTs displayed in the marketplace
    } else {
      alert("Please fill in all fields and connect your wallet.");
    }
  };

  // Buy an NFT by calling the smart contract
  const handleBuyNFT = async (nftId, priceInWei) => {
    try {
      await contract.methods.buyNFT(nftId).send({ from: account, value: priceInWei });
      alert("NFT purchased successfully!");
      fetchNFTs(); // Refresh the marketplace after purchase
    } catch (error) {
      console.error("Error buying NFT: ", error);
    }
  };

  // Fetch all listed NFTs from the smart contract
  const fetchNFTs = async () => {
    if (contract) {
      const nfts = await contract.methods.getNFTs().call();
      setNfts(nfts);
    }
  };

  // Fetch NFTs after contract is set
  useEffect(() => {
    if (contract) {
      fetchNFTs();
    }
  }, [contract]);

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom style={{ color: '#fff', marginBottom: '20px', animation: 'fadeIn 2s' }}>
        NFT Marketplace
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={connectWallet}
        style={{ marginBottom: '20px', backgroundColor: '#5A67D8', transition: 'background-color 0.3s', fontWeight: 'bold' }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#434190'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#5A67D8'}
      >
        {account ? `Connected: ${account.substring(0, 6)}...` : "Connect Wallet"}
      </Button>

      <Typography variant="h5" gutterBottom style={{ color: '#fff', marginBottom: '20px' }}>
        Upload your NFT to the marketplace
      </Typography>
      <form onSubmit={handleListNFT} style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', animation: 'fadeIn 1.5s' }}>
        <TextField
          label="NFT Name"
          variant="outlined"
          value={nftName}
          onChange={(e) => setNftName(e.target.value)}
          required
          sx={{ backgroundColor: '#fff', borderRadius: '5px' }}
        />
        <TextField
          label="Description"
          variant="outlined"
          value={nftDescription}
          onChange={(e) => setNftDescription(e.target.value)}
          required
          sx={{ backgroundColor: '#fff', borderRadius: '5px' }}
        />
        <TextField
          label="Price (ETH)"
          variant="outlined"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          sx={{ backgroundColor: '#fff', borderRadius: '5px' }}
        />
        <TextField
          label="Image URL"
          variant="outlined"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
          sx={{ backgroundColor: '#fff', borderRadius: '5px' }}
        />
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          style={{ backgroundColor: '#ED64A6', fontWeight: 'bold', transition: 'background-color 0.3s' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#D53F8C'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#ED64A6'}
        >
          List NFT
        </Button>
      </form>

      <Typography variant="h5" gutterBottom style={{ color: '#fff', animation: 'fadeIn 2s' }}>
        Marketplace
      </Typography>
      <div className="marketplace" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
        {nfts.length > 0 ? nfts.map((nft, index) => (
          <Card key={index} style={{ maxWidth: 345, transition: 'transform 0.3s', animation: 'fadeInUp 1s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <CardMedia
              component="img"
              alt={nft.name}
              height="140"
              image={nft.imageUrl}
              style={{ borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}
            />
            <CardContent style={{ backgroundColor: '#fff' }}>
              <Typography gutterBottom variant="h5" component="div">
                {nft.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                {nft.description}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Price: {web3.utils.fromWei(nft.price, 'ether')} ETH
              </Typography>
              {nft.owner.toLowerCase() !== account.toLowerCase() && nft.isForSale ? (
                <Button variant="contained" color="secondary" style={{ backgroundColor: '#F56565', transition: 'background-color 0.3s' }}
                  onClick={() => handleBuyNFT(nft.id, nft.price)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#C53030'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#F56565'}>
                  Buy NFT
                </Button>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  {nft.owner.toLowerCase() === account.toLowerCase() ? "You own this NFT" : "Not for sale"}
                </Typography>
              )}
            </CardContent>
          </Card>
        )) : <Typography variant="body2" style={{ color: '#fff' }}>No NFTs listed yet</Typography>}
      </div>
    </div>
  );
}

export default App;
