const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { createCanvas, loadImage } = require('canvas');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
require('dotenv').config();

// Firebase Admin SDK
const admin = require('firebase-admin');
let db, bucket;
let firebaseInitialized = false;

// IMPORTANT: The server requires a serviceAccountKey.json file to connect to Firebase.
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  // Check for the required Storage Bucket environment variable
  if (!process.env.FIREBASE_STORAGE_BUCKET) {
    console.error('❌ FIREBASE_STORAGE_BUCKET environment variable not set.');
    console.error('Firebase Storage features will be disabled. Add it to your .env file (e.g., your-project-id.appspot.com).');
  } else {
    try {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
      db = admin.firestore();
      bucket = admin.storage().bucket(); // Get a reference to the default storage bucket
      firebaseInitialized = true;
      console.log('✅ Firebase Admin SDK initialized successfully (Firestore & Storage).');
    } catch (e) {
      console.error('❌ Error initializing Firebase Admin SDK. Is your serviceAccountKey.json valid?', e.message);
    }
  }
} else {
  console.warn('⚠️ WARNING: serviceAccountKey.json not found.');
  console.warn('Firebase features (Firestore, Storage) are disabled.');
  console.warn('API routes that rely on Firebase will return an error.');
  console.warn('To enable Firebase, download your service account key and place it in the /server directory.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Load environment variables from .env
require('dotenv').config();

// Warn if Llama API keys are missing
if (!process.env.LLAMA_API_KEY || !process.env.LLAMA_API_URL) {
  console.warn('Warning: LLAMA_API_KEY or LLAMA_API_URL is undefined. Make sure your .env file is loaded correctly and contains these variables.');
  console.warn('Note: This implementation assumes an OpenAI-compatible API for Llama (e.g., from Groq, Together.ai, etc.).');
}

// --- CORS Configuration ---
// This setup allows requests from your deployed Vercel frontend and local development servers.

const allowedOrigins = [
  'https://ai-health-analyst.vercel.app', // Your Vercel frontend URL (no trailing slash)
  'http://localhost:3000',
  'http://localhost:5173', // Vite default dev port
  'http://localhost:4173'  // Vite preview port
];

// For extra flexibility, you can still use an environment variable for other origins.
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests if the origin is in our list or if there's no origin (like for Postman or server-to-server).
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS error: The origin '${origin}' was blocked.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // This is important for sending cookies or auth headers
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create timestamped filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const originalName = file.originalname.replace(/\s+/g, '_'); // Replace spaces with underscores
    const filename = `${timestamp}_${originalName}`;
    cb(null, filename);
  }
});

// File filter to accept only PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed!'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'AIBOT Server is running!' });
});

// List uploaded files endpoint
app.get('/api/uploaded-files', (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        success: true,
        files: [],
        message: 'No uploads directory found'
      });
    }

    const files = fs.readdirSync(uploadsDir);
    const fileDetails = files.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename: filename,
        originalName: filename.split('_').slice(1).join('_'), // Remove timestamp prefix
        size: stats.size,
        uploadDate: stats.birthtime,
        path: filePath
      };
    });

    res.json({
      success: true,
      files: fileDetails,
      count: files.length,
      uploadDirectory: uploadsDir
    });

  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({
      success: false,
      message: 'Error reading uploaded files'
    });
  }
});

/**
 * Extracts text from a given file (PDF or image) using digital parsing and OCR fallbacks.
 * @param {object} file - The file object from Multer.
 * @returns {Promise<{extractedText: string, usedOcr: boolean, ocrError: Error|null}>}
 */
async function extractTextFromFile(file) {
  const filePath = file.path;
  let extractedText = '';
  let usedOcr = false;
  let ocrError = null;
  const fileType = file.mimetype;

  try {
    if (fileType === 'application/pdf') {
      // 1. Try digital text extraction first (fastest)
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text.trim();
      } catch (err) {
        // Ignore parsing errors, will fall back to OCR
        extractedText = '';
      }

      // 2. If no text, fall back to OCR (for scanned PDFs)
      if (!extractedText) {
        try {
          usedOcr = true;
          const data = new Uint8Array(fs.readFileSync(filePath));
          const pdf = await pdfjsLib.getDocument({ data }).promise;
          // Process only the first page for speed. Can be extended to loop all pages.
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = createCanvas(viewport.width, viewport.height);
          const context = canvas.getContext('2d');
          const renderContext = { canvasContext: context, viewport: viewport };
          await page.render(renderContext).promise;
          const imageBuffer = canvas.toBuffer();
          
          const ocrResult = await Tesseract.recognize(imageBuffer, 'eng');
          extractedText = ocrResult.data.text.trim();
        } catch (err) {
          ocrError = err;
          extractedText = '';
        }
      }
    } else if (fileType.startsWith('image/')) {
      // 3. OCR for standard image files
      try {
        usedOcr = true;
        const imageBuffer = fs.readFileSync(filePath);
        const ocrResult = await Tesseract.recognize(imageBuffer, 'eng');
        extractedText = ocrResult.data.text.trim();
      } catch (err) {
        ocrError = err;
        extractedText = '';
      }
    }
  } catch (err) {
    ocrError = err;
    extractedText = '';
  }

  return { extractedText, usedOcr, ocrError };
}

// New endpoint to upload, extract, and structure data in one go
app.post('/api/upload-and-structure', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded.' });
  }

  const filePath = req.file.path;

  try {
    // 1. Extract raw text from the uploaded file
    const { extractedText, ocrError } = await extractTextFromFile(req.file);

    if (!extractedText) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract text from the file.',
        details: ocrError ? ocrError.message : 'The file might be empty or unreadable.'
      });
    }

    // 2. Format the prompt for the Llama API as requested
    const prompt = `You are a data-cleaning assistant. Given raw OCR-extracted text, your task is to structure it in clean JSON. Text: ${extractedText}`;

    // 3. Send the extracted text to the Llama API
    const llamaResponse = await fetch(process.env.LLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.LLAMA_MODEL_NAME || "meta-llama/llama-3-8b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2, // Lower temperature for more deterministic JSON output
        response_format: { type: "json_object" } // Request JSON output if supported
      })
    });

    if (!llamaResponse.ok) {
      const errorBody = await llamaResponse.text();
      throw new Error(`Llama API request failed with status ${llamaResponse.status}: ${errorBody}`);
    }

    const llamaData = await llamaResponse.json();
    const modelText = llamaData.choices[0].message.content;

    // 4. Parse the JSON response from Llama
    let structuredData;
    try {
      structuredData = JSON.parse(modelText);
    } catch (parseError) {
      console.error('Failed to parse Llama response as JSON:', modelText);
      // If parsing fails, send back the raw text from the model as a fallback
      return res.status(500).json({
        success: false,
        error: 'Failed to parse the structured data from the AI model.',
        rawResponse: modelText
      });
    }

    // 5. Send the structured data back to the frontend
    res.json({ success: true, structuredData });

  } catch (error) {
    console.error('Error in /api/upload-and-structure:', error);
    res.status(500).json({ success: false, error: 'An internal server error occurred.', details: error.message });
  } finally {
    // 6. Clean up the uploaded file to save space
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

// --- Firestore-backed API Endpoints ---

// Middleware to check if Firebase is initialized
const requireFirebase = (req, res, next) => {
  if (!firebaseInitialized) {
    return res.status(503).json({ error: 'Firebase is not configured on the server. Please check server logs.' });
  }
  next();
};

// Helper to find a user document by email
const findUserByEmail = async (email) => {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).limit(1).get();
  if (snapshot.empty) {
    return null;
  }
  return snapshot.docs[0];
};

// Users API
app.get('/api/users', requireFirebase, async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/users/role', requireFirebase, async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ error: 'Email and role are required.' });
  try {
    const userDoc = await findUserByEmail(email);
    if (!userDoc) return res.status(404).json({ error: 'User not found' });
    await userDoc.ref.update({ role });
    res.json({ success: true, message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

app.put('/api/users/status', requireFirebase, async (req, res) => {
  const { email, status } = req.body;
  if (!email || !status) return res.status(400).json({ error: 'Email and status are required.' });
  try {
    const userDoc = await findUserByEmail(email);
    if (!userDoc) return res.status(404).json({ error: 'User not found' });
    await userDoc.ref.update({ status });
    res.json({ success: true, message: 'User status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// --- Document Processing and Structuring Workflow ---

/**
 * @route POST /api/process-document
 * @description Uploads a file, extracts text, sends to Llama for structuring,
 * saves the structured JSON to Firestore, and returns it.
 */
app.post('/api/process-document', upload.array('files', 10), requireFirebase, async (req, res) => {
  // 1. Validate the request
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, error: 'No files were uploaded.' });
  }
  const { userEmail } = req.body;
  if (!userEmail) {
    return res.status(400).json({ success: false, error: 'User email is required to associate the document.' });
  }

  const allResults = [];

  try {
    for (const file of req.files) {
      const filePath = file.path;
      let structuredData = {};
      let success = false;
      let errorMessage = '';

      try {
        // 2. Extract raw text from the uploaded file (PDF or Image)
        const { extractedText, ocrError } = await extractTextFromFile(file);

        if (!extractedText) {
          throw new Error(ocrError ? `Extraction failed: ${ocrError.message}` : 'Could not extract any text from the provided file.');
        }

        // 3. Send the raw text to the Llama API for structuring (raw text is not stored)
        const prompt = `You are a medical record structuring assistant. Convert this unstructured OCR text into structured JSON data containing patient name, age, gender, date, diagnosis, prescribed medicines, and follow-up instructions. Here is the text:\n\n${extractedText}`;

        const llamaResponse = await fetch(process.env.LLAMA_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.LLAMA_API_KEY}` },
          body: JSON.stringify({
            model: process.env.LLAMA_MODEL_NAME || "meta-llama/llama-3-8b-instruct",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            response_format: { type: "json_object" }
          })
        });

        if (!llamaResponse.ok) {
          throw new Error(`Llama API request failed with status ${llamaResponse.status}: ${await llamaResponse.text()}`);
        }

        const llamaData = await llamaResponse.json();
        const modelText = llamaData.choices[0].message.content;

        // 4. Parse the structured JSON from the Llama response
        structuredData = JSON.parse(modelText);
        console.log(`[OK] Structured data received for ${file.originalname}`);

        // 5. Save the structured data to Firestore
        const docToSave = {
          ...structuredData,
          userEmail: userEmail,
          originalFilename: file.originalname,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('structured_documents').add(docToSave);
        console.log(`[OK] Saved to Firestore with ID: ${docRef.id}`);
        
        success = true;
        structuredData.id = docRef.id; // Add the new ID to the returned data

      } catch (fileError) {
        errorMessage = fileError.message;
        console.error(`Error processing file ${file.originalname}:`, fileError);
      } finally {
        // 7. Clean up the temporary uploaded file
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      allResults.push({
        success,
        originalFilename: file.originalname,
        data: structuredData,
        error: errorMessage || undefined
      });
    }

    // 6. Return the results for all processed files
    res.status(200).json({ success: true, results: allResults });

  } catch (error) {
    console.error('Error in /api/process-document workflow:', error);
    res.status(500).json({ success: false, error: 'An internal server error occurred during document processing.', details: error.message });
  }
});

// Articles API
app.get('/api/articles', requireFirebase, async (req, res) => {
  try {
    const articlesSnapshot = await db.collection('articles').orderBy('date', 'desc').get();
    const articles = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

app.post('/api/articles', requireFirebase, async (req, res) => {
  try {
    const newArticle = { ...req.body, createdAt: admin.firestore.FieldValue.serverTimestamp() };
    const docRef = await db.collection('articles').add(newArticle);
    res.status(201).json({ id: docRef.id, ...newArticle });
  } catch (error) {
    console.error('Error adding article:', error);
    res.status(500).json({ error: 'Failed to add article' });
  }
});

app.put('/api/articles/:id', requireFirebase, async (req, res) => {
  try {
    const articleRef = db.collection('articles').doc(req.params.id);
    await articleRef.update({ ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    res.json({ success: true, message: 'Article updated' });
  } catch (error) {
    console.error(`Error updating article ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

app.delete('/api/articles/:id', requireFirebase, async (req, res) => {
  try {
    await db.collection('articles').doc(req.params.id).delete();
    res.json({ success: true, message: 'Article deleted' });
  } catch (error) {
    console.error(`Error deleting article ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

/**
 * @route GET /api/documents/user/:email
 * @description Fetches all structured documents for a specific user.
 */
app.get('/api/documents/user/:email', requireFirebase, async (req, res) => {
  try {
    const { email } = req.params;
    console.log(`[DEBUG] Fetching documents for userEmail: ${email}`);
    // Simplified query to avoid needing a composite index. Sorting is done on the server.
    const snapshot = await db.collection('structured_documents').where('userEmail', '==', email).get();
    let documents = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`[DEBUG] Document ID: ${doc.id}, Data:`, data);
      return { id: doc.id, ...data };
    });

    // Sort documents by createdAt date, descending
    documents.sort((a, b) => {
      const dateA = a.createdAt?._seconds || 0;
      const dateB = b.createdAt?._seconds || 0;
      return dateB - dateA;
    });

    console.log(`[DEBUG] Total documents fetched: ${documents.length}`);

    res.json({ success: true, documents });
  } catch (error) {
    console.error(`Error fetching documents for ${req.params.email}:`, error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Appointments API
app.get('/api/appointments', requireFirebase, async (req, res) => {
  try {
    const snapshot = await db.collection('appointments').orderBy('createdAt', 'desc').get();
    const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.get('/api/appointments/user/:email', requireFirebase, async (req, res) => {
  try {
    const userEmail = req.params.email;
    // Simplified query to avoid needing a composite index. Sorting is done on the server.
    const snapshot = await db.collection('appointments').where('patientEmail', '==', userEmail).get();
    let appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort appointments by date, descending
    appointments.sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : 0;
      const dateB = b.date ? new Date(b.date) : 0;
      return dateB - dateA;
    });

    res.json(appointments); // Keeping original response format for compatibility with useUser context
  } catch (error) {
    console.error(`Error fetching appointments for ${req.params.email}:`, error);
    res.status(500).json({ error: 'Failed to fetch user appointments' });
  }
});

app.post('/api/appointments', requireFirebase, async (req, res) => {
  try {
    const newAppointment = { ...req.body, createdAt: admin.firestore.FieldValue.serverTimestamp() };
    const docRef = await db.collection('appointments').add(newAppointment);
    res.status(201).json({ id: docRef.id, ...newAppointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

app.put('/api/appointments/:id', requireFirebase, async (req, res) => {
  try {
    const appointmentRef = db.collection('appointments').doc(req.params.id);
    await appointmentRef.update({ ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    res.json({ success: true, message: 'Appointment updated' });
  } catch (error) {
    console.error(`Error updating appointment ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

app.delete('/api/appointments/:id', requireFirebase, async (req, res) => {
  try {
    await db.collection('appointments').doc(req.params.id).delete();
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    console.error(`Error deleting appointment ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Chatbot proxy endpoint (using Llama API)
app.post('/api/chatbot', async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt in request body.' });
  }
  if (!process.env.LLAMA_API_KEY || !process.env.LLAMA_API_URL) {
    return res.status(500).json({ error: 'Llama API key or URL not configured on server. Check .env file and server logs for details.' });
  }
  try {
    const llamaResponse = await fetch(process.env.LLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.LLAMA_MODEL_NAME || "meta-llama/llama-3-8b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      })
    });

    if (!llamaResponse.ok) {
      if (llamaResponse.status === 429) {
        return res.status(429).json({
          error: 'You have exceeded your Llama API quota. Please wait and try again later, or upgrade your plan.',
          details: await llamaResponse.text()
        });
      }
      const errorBody = await llamaResponse.text();
      throw new Error(`Llama API request failed with status ${llamaResponse.status}: ${errorBody}`);
    }

    const llamaData = await llamaResponse.json();
    // The structure of the response depends on the Llama API provider.
    // A common pattern is response.choices[0].message.content
    const text = llamaData.choices[0].message.content;
    res.json({ text });
  } catch (err) {
    console.error('Llama API error:', err);
    res.status(500).json({ error: 'Failed to fetch from Llama API', details: err.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  if (error.message === 'Only PDF files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only PDF files are allowed!'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.get('/api/debug/structured-documents', requireFirebase, async (req, res) => {
  try {
    const snapshot = await db.collection('structured_documents').limit(10).get();
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, documents });
  } catch (error) {
    console.error('Error fetching structured documents for debug:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch structured documents for debug' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Upload directory: ${uploadsDir}`);
});
