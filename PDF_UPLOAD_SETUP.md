# PDF Upload Feature Setup Guide

This guide will help you set up and run the PDF upload feature for medical documents in the AIBOT application.

## 📁 Project Structure

```
AIBOT/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProfileSettings.jsx    # Updated with PDF upload
│   │   │   └── PDFUpload.jsx         # New PDF upload component
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── uploads/           # PDF files storage (auto-created)
│   ├── server.js          # Express server with upload endpoint
│   └── package.json
└── PDF_UPLOAD_SETUP.md    # This file
```

## 🚀 Setup Instructions

### 1. Install Backend Dependencies

Open a terminal and navigate to the server directory:

```bash
cd server
npm install
```

This will install:
- `express` - Web framework
- `multer` - File upload middleware
- `cors` - Cross-origin resource sharing
- `nodemon` - Development server (auto-restart)

### 2. Install Frontend Dependencies (if needed)

The React frontend should already have all required dependencies. If you need to install them:

```bash
cd client
npm install
```

### 3. Start the Backend Server

From the `server` directory:

```bash
# For development (auto-restart on changes)
npm run dev

# OR for production
npm start
```

The server will start on `https://ai-health-analyst.onrender.com`

### 4. Start the Frontend

From the `client` directory:

```bash
npm run dev
```

The React app will start on `https://ai-health-analyst.vercel.app/` (Vite default)

## 🔧 How It Works

### Backend (Node.js + Express)

- **Endpoint**: `POST /api/upload-pdf`
- **File Storage**: Files are saved in `server/uploads/` with timestamped filenames
- **File Validation**: Only PDF files up to 10MB are accepted
- **CORS**: Configured to accept requests from React development server

### Frontend (React)

- **Location**: Profile Settings → Medical Info tab
- **Features**:
  - File selection with PDF-only filter
  - File size validation (10MB limit)
  - Upload progress indicator
  - Success/error messages
  - List of recently uploaded files

## 📋 API Endpoints

### Upload PDF
```
POST /api/upload-pdf
Content-Type: multipart/form-data

Body: FormData with 'pdf' field containing the file

Response:
{
  "success": true,
  "message": "PDF uploaded successfully",
  "data": {
    "filename": "2024-01-15T10-30-00-000Z_medical_report.pdf",
    "originalName": "medical_report.pdf",
    "size": 1024000,
    "uploadDate": "2024-01-15T10:30:00.000Z",
    "path": "/path/to/uploads/file.pdf"
  }
}
```

## 🧪 Testing the Feature

1. Start both backend and frontend servers
2. Navigate to Profile Settings in the app
3. Go to the "Medical Info" tab
4. Scroll down to find the "Medical Documents Upload" section
5. Select a PDF file and click "Upload PDF"
6. Check the server console and `uploads/` folder for the uploaded file

## 🔒 Security Features

- **File Type Validation**: Only PDF files are accepted
- **File Size Limit**: Maximum 10MB per file
- **Filename Sanitization**: Spaces replaced with underscores
- **Timestamped Filenames**: Prevents filename conflicts
- **Error Handling**: Comprehensive error messages for different scenarios

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Error**: Make sure the backend server is running on port 5000
2. **File Not Uploading**: Check file size (must be < 10MB) and type (must be PDF)
3. **Server Not Starting**: Ensure all dependencies are installed (`npm install`)
4. **Upload Folder Missing**: The server automatically creates the `uploads/` directory

### Error Messages:

- "Only PDF files are allowed!" - Select a PDF file
- "File too large. Maximum size is 10MB." - Choose a smaller file
- "Network error..." - Check if backend server is running

## 🔮 Future Enhancements (To Do Later)

- OCR processing of uploaded PDFs
- MongoDB integration for metadata storage
- File preview functionality
- File deletion capability
- User authentication for file access
- File categorization (reports, prescriptions, etc.)

## 📝 Notes

- Files are currently stored locally in the `uploads/` folder
- No authentication is implemented yet
- OCR and MongoDB integration are planned for future updates
- The upload feature is integrated into the existing Profile Settings component