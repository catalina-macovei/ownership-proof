import multer from 'multer';
import express from 'express';
import { Blob } from 'buffer';
import cors from 'cors'; 
import dotenv from 'dotenv';
import W3client from './W3ServiceClient.js';
import { ethers } from 'ethers';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ContentManager = require('../artifacts/contracts/ContentManager.sol/ContentManager.json');
const LicenceManager = require('../artifacts/contracts/LicenceManager.sol/LicenceManager.json');
dotenv.config();

console.log('Environment variables loaded:', {
    hasRpcUrl: !!process.env.SEPOLIA_RPC_URL,
    hasPrivateKey: !!process.env.PRIVATE_KEY,
    hasContentManagerContractAddress: !!process.env.CONTENT_MANAGER,
    hasLicenceManagerContractAddress: !!process.env.LICENCE_MANAGER
});

console.log('Contract ABI for ContentManager:', ContentManager.abi ? 'Loaded' : 'Not loaded');
console.log('ContentManager Contract Address:', process.env.CONTENT_MANAGER);

console.log('Contract ABI for LicenceManager:', LicenceManager.abi ? 'Loaded' : 'Not loaded');
console.log('LicenceManager Contract Address:', process.env.LICENCE_MANAGER);

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const privateKey = process.env.PRIVATE_KEY.startsWith('0x') 
    ? process.env.PRIVATE_KEY 
    : `0x${process.env.PRIVATE_KEY}`;

// initializare contract, load from abi
const signer = new ethers.Wallet(privateKey, provider);
const contractContent = new ethers.Contract(
    process.env.CONTENT_MANAGER,
    ContentManager.abi,
    signer
);
const contractLicence = new ethers.Contract(
    process.env.LICENCE_MANAGER,
    LicenceManager.abi,
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
application.use(express.json());

// multer este pentru file uploads
const blobStorage = multer.memoryStorage(); // Store file in memory as buffer
const upload = multer({ blobStorage });


const fetchContentData = async () => {
    const allContents = await contractContent.getAllContentDetails();
    // console.log(allContents);
};
// apelam functia
fetchContentData();

// definim temporar niste variabile price, platform fee
const price = 0;
const platformFee = 0;

// incerc sa setez platform fee
//const setPlatformFeeTx = await contract.setPlatformFee(0);
//await setPlatformFeeTx.wait();

// sa vedem daca a fost setat corect
//const currentFee = await contract.getPlatformFee();
//console.log("Current platform fee:", currentFee.toString());


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

        const price = req.body.price;
        const title = req.body.title;
        const priceFormatted = ethers.parseEther(price);

        const platformFee = await contractContent.getPlatformFee();
        const tx = await contractContent.addContent(priceFormatted, cidString, title, { value: platformFee });
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

// get all files endpoint
application.get('/api/v1/content', async (req, res) => {
    try {
        const allContents = await contractContent.getAllContentDetails();
        const formattedContent = allContents.filter(content => content[5] == true).map(content => ({
            creator: content[0],
            price: content[1].toString(),
            usageCount: content[2].toString(),
            CID: content[3],
            fileUrl: `https://${content[3]}.ipfs.w3s.link`,
            title: content[4]
        }));
        res.json(formattedContent);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error fetching content' });
    }
});

// get all files for a creator endpoint
application.get('/api/v1/my-content', async (req, res) => {
    try {
        const allContents = await contractContent.getAllContentDetails();
        const formattedContent = allContents.filter(c => c[0] == signer.address && c[5] == true).map(content => ({
            creator: content[0],
            price: content[1].toString(),
            usageCount: content[2].toString(),
            CID: content[3],
            fileUrl: `https://${content[3]}.ipfs.w3s.link`,
            title: content[4]
        }));
        res.json(formattedContent);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error fetching content' });
    }
});


// Endpoint pentru disable content 
application.post('/api/v1/disable-content', async (req, res) => {
    try {
        const { cid } = req.body;
        const tx = await contractContent.setUnavailableContent(cid);
        const receipt = await tx.wait();
        console.log('Transaction hash:', receipt.hash);
        res.status(200).json({
            message: 'Succes!!!'
        });

    } catch (error) {
        console.error('Eroare in timpul setarii continutului ca indisponibil', error);
        res.status(500).json({ message: 'Eroare in timpul setarii continutului ca indisponibil' });
    }
});

// Endpoint pentru setarea titlului
application.post('/api/v1/set-title', upload.none(), async (req, res) => {
    try {
        const cid = req.body.cid;
        const title = req.body.title;
        const tx = await contractContent.setTitle(cid, title);
        const receipt = await tx.wait();
        console.log('Transaction hash:', receipt.hash);
        res.status(200).json({
            message: 'Succes!!!'
        });

    } catch (error) {
        console.error('Eroare in timpul setarii titlului', error);
        res.status(500).json({ message: 'Eroare in timpul setarii titlului' });
    }
});

// Endpoint pentru setarea pretului 
application.post('/api/v1/set-price', upload.none(), async (req, res) => {
    try {
        const cid = req.body.cid;
        const price = req.body.price;
        const priceFormatted = ethers.parseEther(price);
        const tx = await contractContent.setPrice(cid, priceFormatted);
        const receipt = await tx.wait();
        console.log('Transaction hash:', receipt.hash);
        res.status(200).json({
            message: 'Succes!!!'
        });

    } catch (error) {
        console.error('Eroare in timpul setarii continutului ca indisponibil', error);
        res.status(500).json({ message: 'Eroare in timpul setarii continutului ca indisponibil' });
    }
});


// Endpoint pentru cumpararea licentei 
application.post('/api/v1/buy-licence', upload.none(), async (req, res) => {
    try {
        const cid = req.body.cid;
        const duration = req.body.duration * 24 * 60 * 60; // in seconds

        const content = await contractContent.getContent(cid);
        const price = content[1];

        const payTx = await contractLicence.pay(cid, { value: price });
        const payReceipt = await payTx.wait();
        console.log('Transaction hash:', payReceipt.hash);

        const licenceTx = await contractLicence.issueLicence(signer.address, cid, duration);
        const licenceReceipt = await licenceTx.wait();
        console.log('Transaction hash:', licenceReceipt.hash);

        res.status(200).json({
            message: 'Succes!!!'
        });
    } catch (error) {
        console.error('Eroare in timpul cumpararii licentei:', error);
        res.status(500).json({ message: 'Eroare in timpul cumpararii licentei' });
    }
});

// get all files for a creator endpoint
application.get('/api/v1/my-licences', async (req, res) => {
    try {
        const requestedLicences = await contractLicence.getLicencesForUser(signer.address);
        const formattedLicences = requestedLicences.map(licence => ({
            issueDate: (new Date(Number(licence[0]) * 1000)).toLocaleString(),
            expiryDate: (new Date(Number(licence[1]) * 1000)).toLocaleString(),
            CID: licence[2],
            userId: licence[3].toString(),
            isValid: licence[4]
        }));
        res.json(formattedLicences);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error fetching licences' });
    }
});

// Endpoint pentru revoke licence
application.post('/api/v1/revoke-licence', async (req, res) => {
    try {
        const { cid } = req.body;
        const tx = await contractLicence.revokeLicence(cid);
        const receipt = await tx.wait();
        console.log('Transaction hash:', receipt.hash);
        res.status(200).json({
            message: 'Succes!!!'
        });

    } catch (error) {
        console.error('Eroare in timpul revocarii licentei', error);
        res.status(500).json({ message: 'Eroare in timpul revocarii licentei' });
    }
});

// Start the server
application.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
