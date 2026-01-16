# Project Directory Structure

```
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
```
