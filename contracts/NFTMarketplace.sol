// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NFTMarketplace {
    struct NFT {
        uint id;
        string name;
        string description;
        uint price;
        address payable owner;
        string imageUrl;
        bool isForSale;
    }

    NFT[] public nfts;
    uint public nftCount = 0;

    // List a new NFT for sale
    function listNFT(string memory _name, string memory _description, uint _price, string memory _imageUrl) public {
        require(_price > 0, "Price must be greater than 0");
        nfts.push(NFT(nftCount, _name, _description, _price, payable(msg.sender), _imageUrl, true)); // Set isForSale to true
        nftCount++;
    }

    // Buy an NFT
    function buyNFT(uint _nftId) public payable {
        NFT storage nft = nfts[_nftId];
        require(nft.isForSale, "NFT is not for sale");
        require(msg.value == nft.price, "Incorrect price");

        // Transfer ownership
        address payable previousOwner = nft.owner;
        nft.owner = payable(msg.sender);
        nft.isForSale = false; // The NFT is no longer for sale after purchase

        // Transfer payment to the previous owner
        previousOwner.transfer(msg.value);
    }

    // Fetch all NFTs
    function getNFTs() public view returns (NFT[] memory) {
        return nfts;
    }
}
