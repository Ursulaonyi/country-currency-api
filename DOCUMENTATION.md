# Country Currency & Exchange API - DOCUMENTATION

A RESTful API that fetches country data and exchange rates, stores them in MySQL, and provides CRUD operations with image generation capabilities.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [Running Locally](#running-locally)
8. [API Endpoints](#api-endpoints)
9. [Response Format](#response-format)
10. [Testing Endpoints](#testing-endpoints)
11. [Database Schema](#database-schema)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This API provides comprehensive country information including capital cities, regions, populations, flags, currencies, and real-time exchange rates. All data is stored in MySQL for fast retrieval with support for filtering, sorting, and image generation.

**Base URL (Local):** `http://localhost:3000`

---

## 🚀 Features

- ✅ Fetch and cache country data from external APIs
- ✅ Real-time exchange rate integration
- ✅ Estimated GDP calculations based on population
- ✅ Filter countries by region and currency
- ✅ Sort results by GDP or alphabetical order
- ✅ Generate summary images for countries
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Indexed database queries for optimal performance
- ✅ Error handling and validation
- ✅ Auto-refresh metadata tracking

---

## 🛠️ Tech Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20.x | JavaScript runtime |
| **Express.js** | Latest | Web framework |
| **MySQL** | 8.0+ | Database |
| **Node Canvas** | Latest | Image generation |
| **PM2** | Latest | Process management (production) |
| **Nginx** | Latest | Reverse proxy (production) |

**External APIs:**
- RestCountries API - Country data
- Open Exchange Rate API - Exchange rates

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.x (download from https://nodejs.org)
- **npm** or **yarn** (comes with Node.js)
- **MySQL** >= 8.0 (download from https://dev.mysql.com/downloads/mysql/)
- **Git** (for cloning the repository)
- **Postman** or **curl** (for testing endpoints)

**System Requirements:**
- 512MB RAM minimum
- 100MB disk space
- Internet connection (for external API calls)

---

## 📦 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/ursulaonyi/country-currency-api.git
cd country-currency-api
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

**Dependencies installed:**
- `express` - Web framework
- `mysql2` - MySQL driver
- `dotenv` - Environment variable management
- `axios` - HTTP client for external APIs
- `canvas` - Image generation
- `cors` - Cross-Origin Resource Sharing

**To view all dependencies:**
```bash
npm list
```

### Step 3: Setup MySQL Database

**Option A: Using Command Line**

```bash
# Connect to MySQL
mysql -u root -p
```

**Run these SQL commands:**

```sql
-- Create database
CREATE DATABASE country_currency_db;

-- Create application user
CREATE USER 'country_api'@'localhost' IDENTIFIED BY 'your_secure_password_123';

-- Grant privileges
GRANT ALL PRIVILEGES ON country_currency_db.* TO 'country_api'@'localhost';
FLUSH PRIVILEGES;

-- Switch to database
USE country_currency_db;

-- Create countries table
CREATE TABLE countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    capital VARCHAR(255),
    region VARCHAR(255),
    population BIGINT NOT NULL,
    currency_code VARCHAR(10),
    exchange_rate DECIMAL(20, 6),
    estimated_gdp DECIMAL(30, 2),
    flag_url TEXT,
    last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_region (region),
    INDEX idx_currency (currency_code),
    INDEX idx_name (name)
);

-- Create metadata table
CREATE TABLE refresh_metadata (
    id INT PRIMARY KEY DEFAULT 1,
    last_refreshed_at TIMESTAMP NULL,
    total_countries INT DEFAULT 0,
    CHECK (id = 1)
);

-- Insert initial metadata
INSERT INTO refresh_metadata (id, total_countries) VALUES (1, 0);

-- Exit MySQL
EXIT;
```

**Verify tables were created:**
```bash
mysql -u country_api -p country_currency_db
SHOW TABLES;
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```bash
touch .env
```

**Add the following variables:**

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=country_api
DB_PASSWORD=your_secure_password_123
DB_NAME=country_currency_db
DB_PORT=3306

# External APIs
COUNTRIES_API_URL=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
EXCHANGE_API_URL=https://open.er-api.com/v6/latest/USD

# API Timeout (milliseconds)
API_TIMEOUT=10000
```

**Important:** 
- ⚠️ Never commit `.env` to GitHub (it's already in `.gitignore`)
- ✅ Change `DB_PASSWORD` to your actual MySQL password
- ✅ Keep `PORT=3000` for local development
- ✅ For production, change `NODE_ENV=production`

---

## ▶️ Running Locally

### Start the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

**Expected Output:**
```
==================================================
✅ Database connected successfully
✅ Server running on port 3000
🌍 Environment: development
📍 Local URL: http://localhost:3000
==================================================
```

### Verify Server is Running

```bash
# In another terminal
curl http://localhost:3000

# Response should show API information
```

---

## 📡 API Endpoints

### 1. Health Check

**Endpoint:** `GET /`

**Description:** Check if API is running

**Example:**
```bash
curl http://localhost:3000
```

**Response (200 OK):**
```json
{
  "message": "Country Currency API is running",
  "status": "active",
  "version": "1.0.0"
}
```

---

### 2. Refresh Countries Data

**Endpoint:** `POST /countries/refresh`

**Description:** Fetch all countries from external APIs and store in database

**Headers:**
```
Content-Type: application/json
```

**Example:**
```bash
curl -X POST http://localhost:3000/countries/refresh
```

**Response (200 OK):**
```json
{
  "message": "Countries refreshed successfully",
  "total_countries": 250,
  "last_refreshed_at": "2025-10-25T18:00:00Z"
}
```

**Note:** This endpoint fetches data from external APIs. First time may take 10-30 seconds.

---

### 3. Get All Countries

**Endpoint:** `GET /countries`

**Description:** Retrieve all countries with optional filters and sorting

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `region` | string | Filter by region | `?region=Africa` |
| `currency` | string | Filter by currency code | `?currency=NGN` |
| `sort` | string | Sort order | `?sort=gdp_desc` |

**Sort Options:**
- `gdp_desc` - Highest GDP first
- `gdp_asc` - Lowest GDP first
- `name_asc` - A-Z
- `name_desc` - Z-A

**Examples:**
```bash
# Get all countries
curl http://localhost:3000/countries

# Filter by region
curl http://localhost:3000/countries?region=Africa

# Filter by currency
curl http://localhost:3000/countries?currency=USD

# Sort by GDP (descending)
curl http://localhost:3000/countries?sort=gdp_desc

# Combine filters and sort
curl http://localhost:3000/countries?region=Africa&currency=NGN&sort=gdp_desc
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-25T18:00:00Z"
  },
  {
    "id": 2,
    "name": "South Africa",
    "capital": "Pretoria",
    "region": "Africa",
    "population": 59308690,
    "currency_code": "ZAR",
    "exchange_rate": 18.45,
    "estimated_gdp": 6578505450.5,
    "flag_url": "https://flagcdn.com/za.svg",
    "last_refreshed_at": "2025-10-25T18:00:00Z"
  }
]
```

---

### 4. Get Single Country

**Endpoint:** `GET /countries/:id`

**Description:** Get a specific country by ID

**Parameters:**
- `id` (integer) - Country ID

**Example:**
```bash
curl http://localhost:3000/countries/1
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-25T18:00:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Country not found",
  "status": 404
}
```

---

### 5. Get Country by Name

**Endpoint:** `GET /countries/name/:name`

**Description:** Get country by name (case-insensitive)

**Example:**
```bash
curl http://localhost:3000/countries/name/Nigeria
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-25T18:00:00Z"
}
```

---

### 6. Create Country

**Endpoint:** `POST /countries`

**Description:** Add a new country manually

**Request Body:**
```json
{
  "name": "Test Country",
  "capital": "Test City",
  "region": "Test Region",
  "population": 1000000,
  "currency_code": "TST",
  "exchange_rate": 1.0,
  "flag_url": "https://example.com/flag.svg"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/countries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Country",
    "capital": "Test City",
    "region": "Test Region",
    "population": 1000000,
    "currency_code": "TST",
    "exchange_rate": 1.0,
    "flag_url": "https://example.com/flag.svg"
  }'
```

**Response (201 Created):**
```json
{
  "id": 251,
  "name": "Test Country",
  "capital": "Test City",
  "region": "Test Region",
  "population": 1000000,
  "currency_code": "TST",
  "exchange_rate": 1.0,
  "estimated_gdp": 1000000.0,
  "flag_url": "https://example.com/flag.svg",
  "last_refreshed_at": "2025-10-25T18:00:00Z"
}
```

---

### 7. Update Country

**Endpoint:** `PUT /countries/:id`

**Description:** Update an existing country

**Parameters:**
- `id` (integer) - Country ID

**Request Body (all fields optional):**
```json
{
  "capital": "New Capital",
  "population": 220000000,
  "exchange_rate": 1700.5
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/countries/1 \
  -H "Content-Type: application/json" \
  -d '{
    "capital": "Lagos",
    "population": 220000000,
    "exchange_rate": 1700.5
  }'
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Lagos",
  "region": "Africa",
  "population": 220000000,
  "currency_code": "NGN",
  "exchange_rate": 1700.5,
  "estimated_gdp": 27600000000.0,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-25T18:00:00Z"
}
```

---

### 8. Delete Country

**Endpoint:** `DELETE /countries/:id`

**Description:** Delete a country from database

**Parameters:**
- `id` (integer) - Country ID

**Example:**
```bash
curl -X DELETE http://localhost:3000/countries/1
```

**Response (200 OK):**
```json
{
  "message": "Country deleted successfully",
  "id": 1
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Country not found",
  "status": 404
}
```

---

### 9. Get Country Image

**Endpoint:** `GET /countries/:id/image`

**Description:** Generate and download a summary image for a country

**Parameters:**
- `id` (integer) - Country ID

**Example:**
```bash
curl http://localhost:3000/countries/1/image -o country.png
```

**Response:** PNG image file with:
- Country flag
- Country name
- Capital city
- Population
- Currency code and exchange rate
- Estimated GDP

---

### 10. Get API Status

**Endpoint:** `GET /status`

**Description:** Get API and database status

**Example:**
```bash
curl http://localhost:3000/status
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected",
  "total_countries": 250,
  "last_refreshed": "2025-10-25T18:00:00Z",
  "uptime_seconds": 3600
}
```

---

## 📊 Response Format

### Successful Response Format

All successful responses follow this structure:

**GET /countries (List)**
```json
[
  {
    "id": 1,
    "name": "string",
    "capital": "string",
    "region": "string",
    "population": 0,
    "currency_code": "string",
    "exchange_rate": 0.0,
    "estimated_gdp": 0.0,
    "flag_url": "string",
    "last_refreshed_at": "ISO 8601 timestamp"
  }
]
```

**POST /countries (Create)**
```json
{
  "id": 0,
  "name": "string",
  "capital": "string",
  "region": "string",
  "population": 0,
  "currency_code": "string",
  "exchange_rate": 0.0,
  "estimated_gdp": 0.0,
  "flag_url": "string",
  "last_refreshed_at": "ISO 8601 timestamp"
}
```

### Error Response Format

```json
{
  "error": "Error message",
  "status": 400,
  "details": "Additional details (optional)"
}
```

**HTTP Status Codes:**
- `200` - OK (successful GET, PUT, DELETE)
- `201` - Created (successful POST)
- `400` - Bad Request (invalid input)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error (database or server issue)

---

## 🧪 Testing Endpoints

### Using curl (Command Line)

#### Test 1: Health Check
```bash
curl http://localhost:3000
```

#### Test 2: Refresh Data
```bash
curl -X POST http://localhost:3000/countries/refresh
```

#### Test 3: Get All Countries
```bash
curl http://localhost:3000/countries
```

#### Test 4: Get Specific Country
```bash
curl http://localhost:3000/countries/1
```

#### Test 5: Filter by Region
```bash
curl "http://localhost:3000/countries?region=Africa"
```

#### Test 6: Sort by GDP
```bash
curl "http://localhost:3000/countries?sort=gdp_desc"
```

#### Test 7: Get Country Image
```bash
curl http://localhost:3000/countries/1/image -o country.png
```

### Using Postman

1. **Open Postman** (download from https://www.postman.com/downloads/)

2. **Create New Request:**
   - Click "New" → "HTTP Request"
   - Set URL: `http://localhost:3000/countries/refresh`
   - Set Method: `POST`
   - Click "Send"

3. **Expected Response:**
```json
{
  "message": "Countries refreshed successfully",
  "total_countries": 250,
  "last_refreshed_at": "2025-10-25T18:00:00Z"
}
```

### Using JavaScript/Fetch

```javascript
// Health check
fetch('http://localhost:3000')
  .then(res => res.json())
  .then(data => console.log(data));

// Get all countries
fetch('http://localhost:3000/countries')
  .then(res => res.json())
  .then(data => console.log(data));

// Create new country
fetch('http://localhost:3000/countries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Country',
    capital: 'Test City',
    region: 'Test Region',
    population: 1000000,
    currency_code: 'TST',
    exchange_rate: 1.0,
    flag_url: 'https://example.com/flag.svg'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 🗄️ Database Schema

### Countries Table

```sql
CREATE TABLE countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    capital VARCHAR(255),
    region VARCHAR(255),
    population BIGINT NOT NULL,
    currency_code VARCHAR(10),
    exchange_rate DECIMAL(20, 6),
    estimated_gdp DECIMAL(30, 2),
    flag_url TEXT,
    last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_region (region),
    INDEX idx_currency (currency_code),
    INDEX idx_name (name)
);
```

**Column Descriptions:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Unique identifier |
| `name` | VARCHAR(255) | Country name (unique) |
| `capital` | VARCHAR(255) | Capital city |
| `region` | VARCHAR(255) | Geographic region |
| `population` | BIGINT | Population count |
| `currency_code` | VARCHAR(10) | ISO 4217 currency code |
| `exchange_rate` | DECIMAL(20,6) | Exchange rate to USD |
| `estimated_gdp` | DECIMAL(30,2) | Estimated GDP (population × rate) |
| `flag_url` | TEXT | URL to flag image |
| `last_refreshed_at` | TIMESTAMP | Last update timestamp |

### Refresh Metadata Table

```sql
CREATE TABLE refresh_metadata (
    id INT PRIMARY KEY DEFAULT 1,
    last_refreshed_at TIMESTAMP NULL,
    total_countries INT DEFAULT 0,
    CHECK (id = 1)
);
```

---

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete AWS EC2 deployment instructions including:

- EC2 instance setup
- MySQL configuration
- Node.js installation
- PM2 process management
- Nginx reverse proxy
- Domain setup (DuckDNS)
- SSL/HTTPS configuration
- Monitoring and troubleshooting

---

## 🐛 Troubleshooting

### Issue: Cannot Connect to Database

**Solution:**
```bash
# 1. Check MySQL is running
sudo systemctl status mysql

# 2. Verify .env credentials
cat .env

# 3. Test connection manually
mysql -u country_api -p country_currency_db

# 4. Check if database and tables exist
mysql -u country_api -p -e "USE country_currency_db; SHOW TABLES;"
```

### Issue: Port 3000 Already in Use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### Issue: External API Timeout

**Solution:**
```bash
# Check internet connectivity
ping google.com

# Increase timeout in .env
API_TIMEOUT=30000

# Restart server
npm start
```

### Issue: Node Canvas Build Fails

**Solution:**
```bash
# Linux/Mac
npm install --build-from-source canvas

# Install dependencies first
sudo apt-get install -y libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

### Issue: 404 Not Found Errors

**Solution:**
```bash
# 1. Ensure data is refreshed
curl -X POST http://localhost:3000/countries/refresh

# 2. Verify country exists
curl http://localhost:3000/countries

# 3. Check country ID
curl http://localhost:3000/countries/1
```

---

## 📝 Project Structure

```
country-currency-api/
├── src/
│   ├── app.js                 # Main Express app
│   ├── routes/
│   │   └── countries.js       # Country routes
│   ├── controllers/
│   │   └── countriesCtrl.js   # Business logic
│   ├── database/
│   │   └── config.js          # MySQL configuration
│   └── utils/
│       ├── imageGenerator.js  # Image generation
│       └── externalApis.js    # External API calls
├── .env                        # Environment variables (not in git)
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies
├── README.md                  # Quick start
├── DOCUMENTATION.md           # This file
├── DEPLOYMENT.md              # Deployment guide
└── .github/
    └── workflows/
        └── ci.yml            # CI/CD pipeline
```

---

## 📚 Additional Resources

- **Express.js Documentation:** https://expressjs.com/
- **MySQL Documentation:** https://dev.mysql.com/doc/
- **Node Canvas:** https://github.com/Automattic/node-canvas
- **REST API Best Practices:** https://restfulapi.net/
- **HTTP Status Codes:** https://httpwg.org/specs/rfc7231.html#status.codes

---

## ✅ Pre-Submission Checklist

Before submitting, verify:

- [ ] Server runs without errors: `npm start`
- [ ] Database connects successfully
- [ ] All endpoints return correct responses
- [ ] `/countries/refresh` populates data
- [ ] Filtering works (`?region=Africa`)
- [ ] Sorting works (`?sort=gdp_desc`)
- [ ] Image generation works: `/countries/1/image`
- [ ] CRUD operations work (Create, Read, Update, Delete)
- [ ] `.env` is NOT in Git
- [ ] `README.md` is complete
- [ ] `DOCUMENTATION.md` is complete
- [ ] Code is pushed to public GitHub repo
- [ ] Server is deployed and accessible online

---

## 🎉 Ready to Deploy?

Once all tests pass locally:

1. Deploy to AWS EC2 (see [DEPLOYMENT.md](./DEPLOYMENT.md))
2. Get your public URL (e.g., `https://yourname-country-api.duckdns.org`)
3. Test all endpoints on live server
4. Submit to Slack channel with your deployment URL

---

**Questions?** Check troubleshooting section or review the complete deployment guide.

Good luck! 🚀