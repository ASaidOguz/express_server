// index.js (or your main server file)

import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"; // Import dotenv
import { generateVK } from "./generate_vk_calldata.js"; // Note the .js extension for local modules
import { getProvider } from "./utils/provider.js";
import { connectAccount } from "./utils/account_connect.js";
import { buildContract } from "./utils/build_contract.js";
import { zkVerifyCall } from "./utils/zk_verify_call.js";
import { pinFile,handleUploadAndMetadata  } from "./utils/pinataIpfs.js"; // Import the pinFile function
import { mintNft } from "./utils/mintNft.js"; // Import the mintNft function
import { craftMetadataJson } from "./utils/craftMetadataJson.js";
import { byteArray } from 'starknet';
// Temporary check - add this to your file

import multer from "multer";

const upload = multer({ dest: "uploads/" });
dotenv.config(); // Call config after importing

const app = express();
const port = 3042;

app.use(express.json());
app.use(cors({
  origin: "https://escrow-app-five.vercel.app",
  credentials: true
}));

// verify zkp and if verification succesful-> mint nft---
app.post('/verify-mint', async(req, res) => {
  try {
    console.log("Req-Body:",req.body);
    const {distance,userAddress}= req.body;
    // Option 1: Round to nearest whole number -> this needed for circuit to accept the value
const roundedDistance = Math.round(distance);

    const calldata = await generateVK({x:roundedDistance,y:1});
    const contractAddress = process.env.CIRCUIT_VERIFIER_ADDRESS 
    await zkVerifyCall(getProvider('testnet'), contractAddress, calldata);
  const json =  craftMetadataJson(distance,userAddress);
  const metadataCid = await pinFile(json, process.env.PINATA_JWT);
  console.log("Metadata CID:", metadataCid);
  const cidByteArray = byteArray.byteArrayFromString(metadataCid)

  const provider = getProvider('testnet'); // or 'mainnet'
  const account = await connectAccount(provider);
  const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS; // Replace with your contract address
  const nftcontract = await buildContract(provider, nftContractAddress);
  const resp = await mintNft(nftcontract, account,cidByteArray, userAddress,provider );
  console.log("Minted NFT Response:", resp);
    res.send(`<p>https://sepolia.starkscan.co/tx/${resp.transaction_hash}</p>`);
  } catch (error) {
    console.error("Error generating VK:", error);
    res.status(500).send("Verification||Mint failed: " + error.message);
  }
});
// testing api ----->
app.get('/provider', async(req, res) => {
  const provider = getProvider('testnet'); // or 'mainnet'
  const chainid= await  provider.getChainId();
  res.send(chainid);
});
// testing api ----->
app.get('/connect-account', async(req, res) => {
  const provider =  getProvider('testnet'); // or 'mainnet'
  const account= await connectAccount(provider);
  res.send(account.address);
});
// testing api ----->
app.get('/connect-contract', async(req, res) => {
  const provider = getProvider('testnet'); // or 'mainnet'
  const contractAddress = '0x02d2a4804f83c34227314dba41d5c2f8a546a500d34e30bb5078fd36b5af2d77'; // Replace with your contract address
  const contract = await buildContract(provider, contractAddress);
  res.send(contract.address);
});

// testing api -----> tx initiation works perfectly
app.get('/initiate-tx',async(req,res)=>{
  const provider = getProvider('testnet'); // or 'mainnet'
  const account = await connectAccount(provider);
  const contractAddress = '0x02d2a4804f83c34227314dba41d5c2f8a546a500d34e30bb5078fd36b5af2d77'; // Replace with your contract address
  const contract = await buildContract(provider, contractAddress);
  // Ensure the account is connected to the contract
  contract.connect(account);
try{
 const myCall = contract.populate('increase_balance', [10]);
 const response = await contract.increase_balance(myCall.calldata);
 console.log("Transaction initiated:", response);
 await provider.waitForTransaction(response.transaction_hash);
 const bal2 = await contract.get_balance();
res.send({ balance: bal2.toString() });

}catch (error) {
  console.error("Error initiating transaction:", error);
  res.status(500).send("Transaction initiation failed: " + error.message);  
}
})

app.get('/pin-file', async (req, res) => {
  const jwt = process.env.PINATA_JWT; // Ensure you have set this in your .env file
  const json ={
  id: 3,
  name: "Mary Smith",
  email: "mary.smith@example.com",
  age: 34,
  isActive: false,
  roles: ["user"],
}

  const cid = await pinFile(json, jwt);
  console.log("CID:", cid);
  res.status(200);
});


app.post('/image-upload', upload.single('image'), async (req, res) => {
  try {
    const jwt = process.env.PINATA_JWT;
    const { name, description } = req.body;

    const result = await handleUploadAndMetadata(req.file, jwt, name, description);

    res.json({
      metadata_cid: result.metadataCid,
      metadata_uri: `ipfs://${result.metadataCid}`,
      metadata_gateway: result.gatewayUrl,
    });
  } catch (error) {
    console.error("Mint-NFT Upload Error:", error);
    res.status(500).json({ error: "Failed to upload and generate metadata" });
  }
});

function splitLongString(str, chunkSize = 31) {
    const chunks = [];
    for (let i = 0; i < str.length; i += chunkSize) {
        chunks.push(str.slice(i, i + chunkSize));
    }
    return chunks;
}
/* function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function generateToken(user) {
  return jwt.sign(user, process.env.ACCESS_SECRET_TOKEN);
} */

app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on port ${port}!`);
});
