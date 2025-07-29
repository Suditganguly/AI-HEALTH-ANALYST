# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# LLaMA API Integration

This project has replaced the previous Gemini API integration with a new LLaMA API integration for AI-powered document structuring and chatbot functionality.

## Environment Setup

Create a `.env` file in the `server/` directory with the following content:

```
LLAMA_API_KEY=your-llama-api-key-here
PORT=5000
```

Replace `your-llama-api-key-here` with your actual LLaMA API key.

## Backend API Endpoints

### POST /api/structure-document

Extract structured JSON data from raw medical document text.

- Request body (JSON):
  ```json
  {
    "rawText": "Full text extracted from the medical document",
    "documentName": "Optional document name"
  }
  ```

- Response (JSON):
  ```json
  {
    "success": true,
    "structured": {
      "documentName": "Example Document",
      "date": "2023-07-19",
      "reasonOfVisit": "Checkup",
      "prescribedMedicines": [
        {
          "name": "Medicine A",
          "dosage": "10mg",
          "frequency": "Twice a day",
          "duration": "7 days"
        }
      ]
    }
  }
  ```

### POST /api/chatbot

Send a prompt to the AI chatbot and receive a response.

- Request body (JSON):
  ```json
  {
    "prompt": "Your health-related question or message"
  }
  ```

- Response (JSON):
  ```json
  {
    "text": "AI-generated response text"
  }
  ```

- Handles quota limit errors with HTTP 429 status and a descriptive message.

## Testing the Integration

1. Start the backend server:
   ```bash
   cd server
   npm install
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. Use the Chatbot component in the frontend to interact with the AI assistant.

4. Test uploading medical documents and extracting structured data via the `/api/structure-document` endpoint using tools like Postman or curl.

5. Verify error handling for API quota limits by simulating multiple rapid requests.

## Notes

- Ensure your `.env` file is included in `.gitignore` to keep your API keys secure.
- The LLaMA API key is required for the backend to communicate with the AI service.

   npm run dev
  }
  }
  }
