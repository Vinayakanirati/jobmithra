# JobMithra

JobMithra is a web application that facilitates job seeking and recruitment. It consists of a React frontend and a Node.js/Express backend.
## directory structure
jobmithra/
│
├─ .git/                     # Git repository (if you use version control)
├─ .gitignore                # Files/folders to ignore in Git
├─ README.md                 # Project overview & setup instructions
├─ requirements.txt          # Python dependencies (or package.json for Node)
├─ LICENSE                   # License file (optional)
│
├─ jobmithra/                # Core Python package / shared library
│   ├─ __init__.py
│   ├─ models/               # Data models / ORM definitions
│   ├─ utils/                # Helper utilities
│   └─ ...                   # Other package modules
│
├─ server/                   # Backend / API server
│   ├─ .env                  # Environment variables (you already have this)
│   ├─ app.py                # Main entry‑point (Flask/Django/FastAPI, etc.)
│   ├─ config/               # Configuration files
│   ├─ routes/               # API route handlers
│   ├─ static/               # Static assets served by the backend
│   └─ templates/            # Server‑side HTML templates (if any)
│
├─ client/                   # Front‑end application (React, Vue, etc.)
│   ├─ public/               # Public assets (index.html, favicon, etc.)
│   ├─ src/                  # Source code
│   │   ├─ assets/           # Images, fonts, icons
│   │   ├─ components/       # Reusable UI components
│   │   ├─ pages/            # Page‑level components / routes
│   │   ├─ hooks/            # Custom React hooks (if using React)
│   │   ├─ styles/           # Global CSS / design tokens
│   │   └─ index.js          # Application entry point
│   └─ package.json          # Front‑end dependencies & scripts
│
├─ docs/                     # Documentation (design docs, API specs, etc.)
│   └─ architecture.md
│
├─ tests/                    # Automated tests
│   ├─ unit/                 # Unit tests
│   ├─ integration/          # Integration / end‑to‑end tests
│   └─ conftest.py           # PyTest fixtures (if using PyTest)
│
└─ scripts/                  # Helper scripts (setup, migrations, etc.)
    └─ init_db.sh
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
