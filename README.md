# Country Currency & Exchange API - README

A RESTful API that fetches country data and exchange rates, stores them in MySQL, and provides CRUD operations with image generation capabilities.

**Base URL:** `http://localhost:3000`

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- MySQL >= 8.0
- npm or yarn
- Git

### 1. Clone Repository

```bash
git clone https://github.com/ursulaonyi/country-currency-api.git
cd country-currency-api
```

### 2. Install Dependencies

```bash
npm install
```

**Dependencies installed:**
- `express` - Web framework
- `mysql2` - MySQL database driver
- `dotenv` - Environment variable management
- `axios` - HTTP client for external APIs
- `canvas` - Image generation library
- `cors` - Cross-Origin Resource Sharing

**View all dependencies:**
```bash
npm list
```

### 3. Setup MySQL Database

```bash
# Connect to MySQL
mysql -u root -p
```

**Run these SQL commands:**

```sql
CREATE DATABASE country_currency_db;
CREATE USER 'country_api'@'localhost' IDENTIFIED BY 'your_password_123';
GRANT ALL PRIVILEGES ON country_currency_db.* TO 'country_api'@'localhost';
FLUSH PRIVILEGES;
USE country_currency_db;

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

CREATE TABLE refresh_metadata (
    id INT PRIMARY KEY DEFAULT 1,
    last_refreshed_at TIMESTAMP NULL,
    total_countries INT DEFAULT 0,
    CHECK (id = 1)
);

INSERT INTO refresh_metadata (id, total_countries) VALUES (1, 0);

EXIT;
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=country_api
DB_PASSWORD=your_password_123
DB_NAME=country_currency_db
DB_PORT=3306

# External APIs
COUNTRIES_API_URL=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
EXCHANGE_API_URL=https://open.er-api.com/v6/latest/USD

# API Timeout (milliseconds)
API_TIMEOUT=10000
```

**⚠️ Important:**
- Never commit `.env` to Git (already in `.gitignore`)
- Change `DB_PASSWORD` to your actual MySQL password
- Keep `PORT=3000` for local development

### 5. Run Locally

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

**Expected output:**
```
==================================================
✅ Database connected successfully
✅ Server running on port 3000
🌍 Environment: development
📍 Local URL: http://localhost:3000
==================================================
```

---

## 📡 Quick API Test

```bash
# Health check
curl http://localhost:3000

# Refresh countries data
curl -X POST http://localhost:3000/countries/refresh

# Get all countries
curl http://localhost:3000/countries

# Filter by region
curl "http://localhost:3000/countries?region=Africa"

# Get specific country
curl http://localhost:3000/countries/1
```

**Expected Response:**
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

## 📚 Full Documentation

For complete API reference, all endpoints, testing guide, database schema, and troubleshooting:

👉 See **[DOCUMENTATION.md](./DOCUMENTATION.md)**

---

## 🛠️ Tech Stack

- Node.js 20.x
- Express.js
- MySQL 8.0+
- Node Canvas
- RestCountries API
- Open Exchange Rate API

---

## 📋 Features

- ✅ Fetch and cache country data
- ✅ Real-time exchange rates
- ✅ Filter by region and currency
- ✅ Sort by GDP or name
- ✅ Generate country images
- ✅ Full CRUD operations
- ✅ Estimated GDP calculations

---

## 🐛 Common Issues

**Database connection failed?**
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify .env credentials match your setup
cat .env
```

**Port 3000 already in use?**
```bash
lsof -i :3000
kill -9 <PID>
```

**More issues?** See [DOCUMENTATION.md](./DOCUMENTATION.md#troubleshooting)

---

## 📝 Next Steps

1. ✅ Install: `npm install`
2. ✅ Setup MySQL (see Step 3 above)
3. ✅ Configure `.env` (see Step 4 above)
4. ✅ Run: `npm start`
5. ✅ Test: `curl http://localhost:3000/countries`
6. 📖 Read [DOCUMENTATION.md](./DOCUMENTATION.md) for complete API reference
7. 🚀 Deploy: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📄 License

MIT License - See LICENSE file for details

---

**Good luck!** 🚀