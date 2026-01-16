# JobMithra

JobMithra is a web application that facilitates job seeking and recruitment. It consists of a React frontend and a Node.js/Express backend.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js**: The runtime environment for executing JavaScript. Recommended version: v18 or higher.
- **npm**: Node Package Manager (comes with Node.js).
- **MongoDB**: The database used for the backend (if running locally, or have a connection string ready).

## Installation

### 1. Clone the repository
(If you haven't already)

### 2. Client Setup
Navigate to the root directory where the client code resides.

```bash
# Install client dependencies
npm install
```

### 3. Server Setup
Navigate to the server directory.

```bash
cd server
# Install server dependencies
npm install
```

## Running the Application

To run the full application, you need to start both the client and the server.

### Starting the Server
Open a terminal and navigate to the `server` directory:

```bash
cd server
npm start
```
The server typically runs on port 3000 (or as defined in your `.env` file).

### Starting the Client
Open a NEW terminal (keep the server running) and navigate to the root directory:

```bash
# Start the development server
npm run dev
```
The client typically runs on `http://localhost:5173`.

## Environment Variables
Ensure you have a `.env` file in the `server` directory with the necessary configurations (e.g., `MONGO_URI`, `PORT`, etc.).
