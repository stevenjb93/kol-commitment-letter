import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs/promises';
import config from './config/config';
import FileStore from './services/FileStore';

const app = express();
const fileStore = new FileStore(path.join(__dirname, '..', config.uploadDir));

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Ensure upload directory exists
fs.mkdir(config.uploadDir, { recursive: true }).catch(console.error);

// Routes
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const document = await fileStore.createDocument(
      req.file.originalname,
      req.file.filename
    );

    res.json({
      message: 'File uploaded successfully',
      documentId: document.id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

app.post('/api/documents/:id/sign', async (req, res) => {
  try {
    const { id } = req.params;
    const { signatureData } = req.body;

    const document = await fileStore.getDocument(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const pdfPath = path.join(config.uploadDir, document.fileName);
    const pdfBytes = await fs.readFile(pdfPath);
    
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Convert base64 signature to bytes
    const signatureBytes = Buffer.from(signatureData.split(',')[1], 'base64');
    
    // Embed the signature
    const signatureImage = await pdfDoc.embedPng(signatureBytes);
    
    // Add signature to the document
    const { width, height } = firstPage.getSize();
    firstPage.drawImage(signatureImage, {
      x: width - 250,
      y: 50,
      width: 200,
      height: 100,
    });

    // Save the signed PDF
    const signedPdfBytes = await pdfDoc.save();
    const signedFileName = `signed-${document.fileName}`;
    await fs.writeFile(path.join(config.uploadDir, signedFileName), signedPdfBytes);

    // Update document status
    await fileStore.updateDocument(id, {
      signedFileName,
      status: 'signed'
    });

    res.json({
      message: 'Document signed successfully',
      signedDocumentUrl: `/api/documents/${id}/download`,
    });
  } catch (error) {
    console.error('Signing error:', error);
    res.status(500).json({ error: 'Error signing document' });
  }
});

app.get('/api/documents/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const document = await fileStore.getDocument(id);
    
    if (!document || !document.signedFileName) {
      return res.status(404).json({ error: 'Signed document not found' });
    }

    const filePath = path.join(config.uploadDir, document.signedFileName);
    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Error downloading file' });
  }
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
}); 