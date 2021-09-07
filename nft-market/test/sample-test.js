const axios = require('axios')

describe("NFTMarket", function() {
  it("Should interact with the token contract", async function() {


    const Market = await ethers.getContractFactory("NFTMarket");
    const market = await Market.deploy();
    await market.deployed()
    const marketAddress = market.address; 
    
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed()
    const nftContractAddress = nft.address;

    await nft.createToken("a")
    await nft.createToken("b")
    await nft.createToken("c")

    const [user0, user1, user2, user3] = await ethers.getSigners();
    const userAddress0 = await user0.getAddress();
    console.log(userAddress0);
    const balance = await nft.balanceOf(userAddress0);

    await market.createMarketItem(nftContractAddress, 1, 1000);
    await market.connect(user1).createMarketItem(nftContractAddress, 1, 1000);

    console.log(balance.toNumber());
  });
})