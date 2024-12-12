import multer from 'multer';
import express from 'express';
import { Blob } from 'buffer';
import cors from 'cors'; 
import dotenv from 'dotenv';
import W3client from './W3ServiceClient.js';
import { ethers } from 'ethers';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const LicenseManager = require('../artifacts/contracts/ContentManager.sol/ContentManager.json');
dotenv.config();

console.log('Environment variables loaded:', {
    hasRpcUrl: !!process.env.SEPOLIA_RPC_URL,
    hasPrivateKey: !!process.env.PRIVATE_KEY,
    hasContractAddress: !!process.env.CONTENT_MANAGER
});

console.log('Contract ABI:', LicenseManager.abi ? 'Loaded' : 'Not loaded');
console.log('Contract Address:', process.env.CONTENT_MANAGER);

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const privateKey = process.env.PRIVATE_KEY.startsWith('0x') 
    ? process.env.PRIVATE_KEY 
    : `0x${process.env.PRIVATE_KEY}`;

// initializare contract, load from abi
const signer = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(
    process.env.CONTENT_MANAGER,
    LicenseManager.abi,
    signer
);

// initializare express application
const application = express();
const port = 8000;
dotenv.config();

// initializare W3client si Web3.Storage client cu instanta Singleton
const w2client = new W3client();  
await w2client.init();

// cors este un middleware
application.use(cors());

// multer este pentru file uploads
const blobStorage = multer.memoryStorage(); // Store file in memory as buffer
const upload = multer({ blobStorage });

// definim temporar niste variabile price, platform fee
const price = 10;
const platformFee = 2;

// incerc sa setez platform fee
const setPlatformFeeTx = await contract.setPlatformFee(2);
await setPlatformFeeTx.wait();

// sa vedem daca a fost setat corect
const currentFee = await contract.getPlatformFee();
console.log("Current platform fee:", currentFee.toString());


// Endpoint pentru upload 
application.post('/api/v1/authorship-proof', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // convertire buff in Blob
        const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

        const uploadOptions = {}; 

        const cid = await w2client.client.uploadFile(fileBlob, uploadOptions);
    
        const cidString = cid.toString(); 

        const tx = await contract.addContent(price, cidString, { value: platformFee });
        const receipt = await tx.wait();
        console.log('Transaction hash:', receipt.hash);

        // afis CID -> pentru checkup
        console.log('Fisier incarcat cu succes-> CID:', cid);
        res.status(200).json({
            message: 'Succes!!!',
            cid: cid
        });
    } catch (error) {
        console.error('Eroare in timpul incarcarii:', error);
        res.status(500).json({ message: 'Eroare in timpul incarcarii in Web3.Storage' });
    }
});



// Start the server
application.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
