import multer from 'multer';
import express from 'express';
import { Blob } from 'buffer';
import cors from 'cors'; 
import dotenv from 'dotenv';
import W3client from './W3ServiceClient.js';

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
