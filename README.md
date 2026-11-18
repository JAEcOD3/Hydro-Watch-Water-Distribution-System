# HydroWatch
## Intelligent Water Distribution and Leak Detection System

### 1. Project Description

HydroWatch is a water distribution monitoring and leak detection system designed to simulate how water moves through reservoirs, pipelines, and distribution stations.

The application monitors the water distribution network, identifies pipeline failures, calculates water shortages, and searches for alternative routes when a pipeline becomes unavailable.

### 2. Required Software

The following software is required to run HydroWatch:

- **Node.js:** Runs the backend application.
- **npm:** Installs and manages Node.js dependencies.
- **PostgreSQL 14 or later:** Stores the water distribution system's data.
- **pgAdmin 4:** Provides a graphical interface for managing the PostgreSQL database (optional).
- **Visual Studio Code:** Recommended for viewing and editing project files.
- **Web Browser:** Google Chrome, Microsoft Edge, or another modern browser.

### 3. Technologies and Dependencies

HydroWatch uses:

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- PostgreSQL
- pg (node-postgres)
- CORS
- dotenv

### 4. Installation Instructions

**Step 1: Install the required software**

Install Node.js and PostgreSQL on your computer.

Verify that Node.js and npm are installed by opening a terminal and entering:

```bash
node -v
npm -v
```

**Step 2: Download the project**

Download or extract the HydroWatch project folder onto your computer.

Open the project folder in Visual Studio Code.

**Step 3: Install project dependencies**

Open a terminal in the main project directory and run:

```bash
npm install
```

If the dependencies are not already listed in the project's package configuration, install them with:

```bash
npm install express pg cors dotenv
npm install --save-dev nodemon
```

### 5. Database Configuration

HydroWatch uses PostgreSQL to store its water distribution information.

**Step 1: Create the database**

Open pgAdmin or the PostgreSQL command-line tool.

Create a database named:

```sql
CREATE DATABASE water_distribution;
```

**Step 2: Configure the database connection**

The backend uses environment variables to connect to PostgreSQL.

Create a `.env` file in the location expected by the backend database configuration.

Example:

```env
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRESQL_PASSWORD
DB_HOST=localhost
DB_PORT=5432
DB_NAME=water_distribution
```

Replace `YOUR_POSTGRESQL_PASSWORD` with the password configured during PostgreSQL installation.

**Step 3: Set up the database tables**

Run the SQL schema and data initialization files included with the project against the `water_distribution` database.

These files create and populate the tables needed by HydroWatch, including reservoirs, distribution stations, pipelines, consumers, and network equipment.

### 6. Execution Steps

**Step 1: Open the project folder**

Open the main `water-distribution` folder in Visual Studio Code.

**Step 2: Start the backend server**

Open a terminal in the main project directory and run:

```bash
node backend/src/server.js
```

The backend runs at:

```text
http://localhost:5000
```

The API base address is:

```text
http://localhost:5000/api
```

**Step 3: Open the frontend**

Open the frontend `index.html` file in a web browser.

If you use the VS Code Live Server extension, you can right-click `frontend/index.html` and select **Open with Live Server**.

**Step 4: Use the application**

Once the backend and frontend are running and the database is configured, the HydroWatch dashboard can retrieve network information and display the water distribution system.

### 7. Important Notes

- PostgreSQL must be running before starting the application.
- The database must be created and initialized before using the dashboard.
- The backend must remain running while using the frontend.
- The `.env` file contains database credentials and should not be uploaded publicly.
- Do not share your actual PostgreSQL password.
- The project must include its SQL database setup files so another person can recreate the database.

### 8. Project Structure

```text
water-distribution/
│
├── backend/
│   └── src/
│       ├── algorithms/
│       ├── config/
│       ├── routes/
│       └── server.js
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

### 9. Project Information

**Project Name:** HydroWatch

**Project Type:** Intelligent Water Distribution and Leak Detection System

**Backend:** Node.js and Express.js

**Database:** PostgreSQL

**Frontend:** HTML, CSS, and JavaScript
