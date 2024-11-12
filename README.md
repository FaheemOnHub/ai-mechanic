# Vehicle Diagnostic Assistant with Semantic Search for OBD-II Codes
# How-it-works
![image](https://github.com/user-attachments/assets/67ec2cfd-9782-486a-91b4-aac50c16c6d6)
# DEMO
# Problem-Statement-1: 
I am experiencing issues with my clutch switch on a 2012 Honda Civic. The car doesn’t start unless I press the clutch, even though it used to start without pressing the clutch pedal (OBD Codes: P0704)
# Solution:
<img width="609" alt="Screenshot 2024-11-12 at 8 27 41 PM" src="https://github.com/user-attachments/assets/e7b6a704-49cc-4a93-9143-25e2b12678e4">

This project is a **vehicle diagnostic assistant** powered by **semantic search techniques** to process **OBD-II (On-Board Diagnostics) codes**. The assistant helps users troubleshoot automotive issues by analyzing their vehicle problems, matching them with relevant OBD-II codes, and providing detailed diagnostics, including possible causes and solutions. The system also integrates image recognition to analyze vehicle-related images for additional diagnostic insights.

## Features

- **Cosine Semantic Search**: Uses cosine similarity to compare user inputs (text and image descriptions) with OBD-II code embeddings, providing the most relevant diagnostic information.
- **Image Processing**: Allows users to upload images related to vehicle issues, which are processed and analyzed to provide context-specific diagnostic recommendations.
- **Natural Language Processing (NLP)**: Leverages OpenAI’s GPT model to generate human-readable diagnostic reports, including explanations, causes, symptoms, and recommended solutions.
- **OBD-II Code Database**: A  database stores nearly 1000 OBD-II codes, along with their meanings, causes, symptoms, and embeddings, to facilitate fast and accurate semantic search.
- **Azure AI Integration**: Uses Azure’s AI services to generate text embeddings and process vehicle-related images for enhanced diagnostics.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI & NLP**: OpenAI API, Azure AI Inference
- **Image Processing**: Multer (for handling file uploads)
- **Cosine Similarity**: Used for embedding comparison and semantic search
- **Environment Variables**: dotenv for managing environment variables

## Installation

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/vehicle-diagnostic-assistant.git
cd vehicle-diagnostic-assistant
```

2. Install Dependencies
Make sure you have Node.js installed. Then, install the required dependencies:

```bash

npm install
3. Set Up Environment Variables
Create a .env file in the root directory and define the following environment variables:
```
env
```bash
GITHUB_TOKEN=your_github_token
MONGODB_URI=your_mongodb_connection_string
AZURE_API_KEY=your_azure_api_key
PORT=3000
GITHUB_TOKEN: Your GitHub token for API access.
MONGODB_URI: Your MongoDB connection URI.
AZURE_API_KEY: Your Azure API key for embedding and AI inference.
```
PORT: The port the server will run on (default is 3000).
4. Run the Application
Start the server:

```bash

npm start
```
The server will run at http://localhost:3000.

Endpoints
1. GET /
Returns a status message indicating the server is running.

2. GET /run-batch
Triggers a batch process to embed and insert OBD-II codes into the database.

3. POST /query-with-image
Accepts an image file and user input to analyze the image and provide diagnostic recommendations based on both image content and text.




