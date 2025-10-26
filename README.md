# Country Currency & Exchange API

A RESTful API that fetches country data and exchange rates, stores them in MySQL, and provides CRUD operations with image generation.

## 🚀 Features

- Fetch and cache country data from external APIs
- Real-time exchange rate integration  
- Estimated GDP calculations
- Filter by region and currency
- Sort by GDP or name
- Summary image generation
- Full CRUD operations

## 🛠️ Tech Stack

- **Runtime:** Node.js 20.x
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **Image Generation:** Node Canvas
- **External APIs:** RestCountries API, Exchange Rate API

## 📋 Prerequisites

- Node.js >= 18.x
- MySQL >= 8.0
- npm or yarn

## 🔧 Local Setup

### 1. Clone Repository
```bash
git clone https://github.com/ursulaonyi/country-currency-api.git
cd country-currency-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup MySQL Database
```sql
CREATE DATABASE country_currency_db;
USE country_currency_db;

-- Run the SQL schema from database setup section
```

### 4. Configure Environment Variables

Create `.env` file in root:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=country_currency_db
DB_PORT=3306

COUNTRIES_API_URL=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
EXCHANGE_API_URL=https://open.er-api.com/v6/latest/USD
API_TIMEOUT=10000
```

### 5. Start Server
```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

Server will run at: `http://localhost:3000`

## 📡 API Endpoints

### POST /countries/refresh
Fetch and cache all countries with exchange rates.

**Response:**
```json
{
  "message": "Countries refreshed successfully",
  "total_countries": 250,
  "last_refreshed_at": "2025-10-25T10:30:00.000Z"
}
```

### GET /countries
Get all countries with optional filters and sorting.

**Query Parameters:**
- `region` - Filter by region (e.g., `?region=Africa`)
- `currency` - Filter by currency code (e.g., `?currency=NGN`)
- `sort` - Sort results (`gdp_desc`, `gdp_asc`, `name_asc`, `name_desc`)

**Example:**
```bash
GET /countries?region=Africa&sort=gdp_desc
```

**Response:**
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
  }
]
```

### GET /countries/:name
Get a specific country by name.

**Example:**
```bash
GET /countries/Nigeria
```

**Response:**
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

### DELETE /countries/:name
Delete a country record.

**Example:**
```bash
DELETE /countries/Nigeria
```

**Response:**
```json
{
  "message": "Country deleted successfully"
}
```

### GET /status
Get API status and metadata.

**Response:**
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-25T18:00:00Z"
}
```

### GET /countries/image
Get generated summary image.

**Response:** PNG image file

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "currency_code": "is required"
  }
}
```

### 404 Not Found
```json
{
  "error": "Country not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

### 503 Service Unavailable
```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from RestCountries API"
}
```

## 🗄️ Database Schema

### countries table
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

### refresh_metadata table
```sql
CREATE TABLE refresh_metadata (
    id INT PRIMARY KEY DEFAULT 1,
    last_refreshed_at TIMESTAMP NULL,
    total_countries INT DEFAULT 0,
    CHECK (id = 1)
);
```

## 🧪 Testing

### Manual Testing

1. Start the server:
```bash
npm run dev
```

2. Test refresh:
```bash
curl -X POST http://localhost:3000/countries/refresh
```

3. Test queries:
```bash
# Get all countries
curl http://localhost:3000/countries

# Filter by region
curl http://localhost:3000/countries?region=Africa

# Get specific country
curl http://localhost:3000/countries/Nigeria

# Get status
curl http://localhost:3000/status

# Get image
curl http://localhost:3000/countries/image --output summary.png
```

## 📁 Project Structure
```
country-currency-api/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── controllers/
│   │   └── countryController.js # Business logic
│   ├── routes/
│   │   └── countryRoutes.js     # API routes
│   ├── services/
│   │   └── externalApiService.js # External API calls
│   ├── utils/
│   │   └── imageGenerator.js    # Image generation utility
│   └── app.js                   # Express app setup
├── cache/
│   └── summary.png              # Generated summary image
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

## 🚀 Deployment

### Deploy to AWS EC2
See DEPLOYMENT.md for detailed deployment instructions.

Quick steps:
1. Push code to GitHub
2. SSH into EC2 instance
3. Clone repository
4. Install dependencies
5. Setup MySQL database
6. Configure environment variables
7. Start with PM2

## 🔒 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development or production |
| DB_HOST | Database host | localhost |
| DB_USER | Database user | root |
| DB_PASSWORD | Database password | your_password |
| DB_NAME | Database name | country_currency_db |
| DB_PORT | Database port | 3306 |
| COUNTRIES_API_URL | RestCountries API URL | See .env.example |
| EXCHANGE_API_URL | Exchange Rate API URL | See .env.example |
| API_TIMEOUT | API timeout (ms) | 10000 |

## 📝 Business Logic

### Currency Handling

- If country has multiple currencies, only the first is stored
- If currencies array is empty:
  - currency_code = null
  - exchange_rate = null
  - estimated_gdp = 0
- If currency not found in exchange rates:
  - exchange_rate = null
  - estimated_gdp = null

### GDP Calculation
```javascript
estimated_gdp = (population × random(1000-2000)) ÷ exchange_rate
```
- Random multiplier regenerated on each refresh
- Set to `null` if exchange rate unavailable
- Set to `0` if no currency

### Update vs Insert
- Countries matched by name (case-insensitive)
- Existing countries are updated (including new random GDP)
- New countries are inserted

## 👤 Author

Your Name - [GitHub](https://github.com/ursulaonyi)

## 📄 License

MIT License - see LICENSE file for details