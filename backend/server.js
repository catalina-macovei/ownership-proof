import multer from 'multer';
import express from 'express';
import { Blob } from 'buffer';
import cors from 'cors';
import dotenv from 'dotenv';
import W3client from './W3ServiceClient.js';
import { ethers } from 'ethers';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ContentManager = require('../frontend/src/artifacts/contracts/ContentManager.sol/ContentManager.json');
const LicenceManager = require('../frontend/src/artifacts/contracts/LicenceManager.sol/LicenceManager.json');
dotenv.config();

const application = express();
const port = 8000;

const getSigner = () => {
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
}

const contractsMiddleware = async (req, res, next) => {
    const signer = getSigner();
    const contracts = getContracts(signer);
    req.signer = signer;
    req.contracts = contracts;
    next();
};

const w2client = new W3client();
await w2client.init();

application.use(cors());
application.use(express.json());

const blobStorage = multer.memoryStorage();
const upload = multer({ blobStorage });

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

application.post('/api/v1/authorship-proof', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        const cid = await w2client.client.uploadFile(fileBlob, {});
        const cidString = cid.toString();
        
        res.status(200).json({ message: 'Success!', cid: cidString });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload error' });
    }
});

application.get('/api/v1/content', contractsMiddleware, async (req, res) => {
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

application.get('/api/v1/fee', contractsMiddleware, async (req, res) => {
    try {
        const fee = await req.contracts.contentContract.getPlatformFee({gasLimit: 300000 });
        res.json(fee.toString());
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error fetching platform fee' });
    }
});

application.post('/api/v1/content-by-cid', contractsMiddleware, async (req, res) => {
    try {
        const cid = req.body.contentCid;

        const content = await req.contracts.contentContract.getContent(cid, {gasLimit: 300000 });
        if (!content) {
            return res.status(404).json({ message: 'Content not found.' });
        }

        const formattedContent = {
            creator: content[0],
            price: content[1].toString(),
            usageCount: content[2].toString(),
            CID: content[3],
            fileUrl: `https://${content[3]}.ipfs.w3s.link`,
            title: content[4]
        };
        res.json(formattedContent);

    } catch (error) {
        console.error('Error fetching content:', error);

        // Enhanced error handling
        const errorMessage = error.reason || 'Error fetching content';
        res.status(500).json({ message: errorMessage });
    }
});


application.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
