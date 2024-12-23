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

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

const getSigner = (account) => {
    // Instead of using provider.getSigner(), create a new wallet instance
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    return wallet;
};

const getContracts = (signer) => {
    return {
        contentContract: new ethers.Contract(
            process.env.CONTENT_MANAGER,
            ContentManager.abi,
            signer
        ),
        licenceContract: new ethers.Contract(
            process.env.LICENCE_MANAGER,
            LicenceManager.abi,
            signer
        )
    };
};

const application = express();
const port = 8000;

const w2client = new W3client();
await w2client.init();

application.use(cors());
application.use(express.json());

const blobStorage = multer.memoryStorage();
const upload = multer({ blobStorage });

const authMiddleware = async (req, res, next) => {
    const authToken = req.headers.authorization?.split(' ')[1];
    if (!authToken || !global.authenticatedAccount) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    const signer = getSigner(global.authenticatedAccount);
    const contracts = getContracts(signer);
    req.signer = signer;
    req.contracts = contracts;
    next();
};

application.post('/api/auth', async (req, res) => {
    try {
        const { account, signature, message } = req.body;
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() === account.toLowerCase()) {
            const token = Buffer.from(`${account}-${Date.now()}`).toString('base64');
            global.authenticatedAccount = account;
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
});

application.post('/api/v1/authorship-proof', authMiddleware, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        const cid = await w2client.client.uploadFile(fileBlob, {});
        const cidString = cid.toString();
        
        const price = req.body.price;
        const title = req.body.title;
        const priceFormatted = ethers.parseEther(price);
        
        const platformFee = await req.contracts.contentContract.getPlatformFee();
        const tx = await req.contracts.contentContract.addContent(priceFormatted, cidString, title, { value: platformFee });
        
        res.status(200).json({ message: 'Success!', cid: cid });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload error' });
    }
});

application.get('/api/v1/content', authMiddleware, async (req, res) => {
    try {
        const allContents = await req.contracts.contentContract.getAllContentDetails();
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

application.get('/api/v1/my-content', authMiddleware, async (req, res) => {
    try {
        const allContents = await req.contracts.contentContract.getAllContentDetails();
        const formattedContent = allContents
            .filter(c => c[0].toLowerCase() === global.authenticatedAccount.toLowerCase() && c[5] == true)
            .map(content => ({
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

application.post('/api/v1/disable-content', authMiddleware, async (req, res) => {
    try {
        const { cid } = req.body;
        const tx = await req.contracts.contentContract.setUnavailableContent(cid);
        res.status(200).json({ message: 'Success!' });
    } catch (error) {
        console.error('Error disabling content:', error);
        res.status(500).json({ message: 'Error disabling content' });
    }
});

application.post('/api/v1/set-title', authMiddleware, upload.none(), async (req, res) => {
    try {
        const { cid, title } = req.body;
        const tx = await req.contracts.contentContract.setTitle(cid, title);
        res.status(200).json({ message: 'Success!' });
    } catch (error) {
        console.error('Error setting title:', error);
        res.status(500).json({ message: 'Error setting title' });
    }
});

application.post('/api/v1/set-price', authMiddleware, upload.none(), async (req, res) => {
    try {
        const { cid, price } = req.body;
        const priceFormatted = ethers.parseEther(price);
        const tx = await req.contracts.contentContract.setPrice(cid, priceFormatted);
        res.status(200).json({ message: 'Success!' });
    } catch (error) {
        console.error('Error setting price:', error);
        res.status(500).json({ message: 'Error setting price' });
    }
});


application.post('/api/v1/buy-licence', authMiddleware, upload.none(), async (req, res) => {
    try {
        const { cid, duration } = req.body;

        // Validate input
        if (!cid || !duration || isNaN(duration) || duration <= 0) {
            return res.status(400).json({ message: 'Invalid request parameters.' });
        }

        const durationInSeconds = duration * 24 * 60 * 60;

        // Fetch content and validate price
        const content = await req.contracts.contentContract.getContent(cid);
        if (!content) {
            return res.status(404).json({ message: 'Content not found.' });
        }

        const price = content[1];
        if (!price || price <= 0) {
            return res.status(400).json({ message: 'Invalid price for content.' });
        }

        // Process payment
        const payTx = await req.contracts.licenceContract.pay(cid, { value: price });
        await payTx.wait(); // Wait for transaction confirmation

        // Issue licence
        const licenceTx = await req.contracts.licenceContract.issueLicence(global.authenticatedAccount, cid, durationInSeconds);
        await licenceTx.wait(); // Wait for transaction confirmation

        // Success response
        res.status(200).json({ message: 'License successfully purchased.' });
    } catch (error) {
        console.error('Error buying license:', error);

        // Enhanced error handling
        const errorMessage = error.reason || 'Error buying license';
        res.status(500).json({ message: errorMessage });
    }
});


application.get('/api/v1/my-licences', authMiddleware, async (req, res) => {
    try {
        const requestedLicences = await req.contracts.licenceContract.getLicencesForUser(global.authenticatedAccount);
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

application.post('/api/v1/revoke-licence', authMiddleware, async (req, res) => {
    try {
        const { cid } = req.body;
        const tx = await req.contracts.licenceContract.revokeLicence(cid);
        res.status(200).json({ message: 'Success!' });
    } catch (error) {
        console.error('Error revoking license:', error);
        res.status(500).json({ message: 'Error revoking license' });
    }
});

application.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
