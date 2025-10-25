const db = require('../config/database');
const externalApiService = require('../services/externalApiService');
const imageGenerator = require('../utils/imageGenerator');

class CountryController {
    // POST /countries/refresh
    async refreshCountries(req, res) {
        try {
            console.log('🔄 Starting refresh process...');
            
            // Fetch data from external APIs
            const countriesResult = await externalApiService.fetchCountries();
            const ratesResult = await externalApiService.fetchExchangeRates();

            // Check if either API failed
            if (!countriesResult.success) {
                return res.status(503).json({
                    error: 'External data source unavailable',
                    details: countriesResult.error
                });
            }

            if (!ratesResult.success) {
                return res.status(503).json({
                    error: 'External data source unavailable',
                    details: ratesResult.error
                });
            }

            const countries = countriesResult.data;
            const exchangeRates = ratesResult.data;

            console.log(`📊 Processing ${countries.length} countries...`);

            // Process each country
            const connection = await db.getConnection();
            
            try {
                await connection.beginTransaction();

                let processedCount = 0;

                for (const country of countries) {
                    let currencyCode = null;
                    let exchangeRate = null;
                    let estimatedGdp = null;

                    // Handle currency
                    if (country.currencies && country.currencies.length > 0) {
                        currencyCode = country.currencies[0].code;
                        exchangeRate = exchangeRates[currencyCode] || null;

                        // Calculate estimated GDP
                        if (exchangeRate !== null) {
                            const randomMultiplier = Math.random() * (2000 - 1000) + 1000;
                            estimatedGdp = (country.population * randomMultiplier) / exchangeRate;
                        }
                    } else {
                        // Empty currencies array
                        estimatedGdp = 0;
                    }

                    // Check if country exists (case-insensitive)
                    const [existing] = await connection.execute(
                        'SELECT id FROM countries WHERE LOWER(name) = LOWER(?)',
                        [country.name]
                    );

                    if (existing.length > 0) {
                        // Update existing country
                        await connection.execute(
                            `UPDATE countries SET 
                                capital = ?, 
                                region = ?, 
                                population = ?, 
                                currency_code = ?, 
                                exchange_rate = ?, 
                                estimated_gdp = ?, 
                                flag_url = ?,
                                last_refreshed_at = NOW()
                             WHERE id = ?`,
                            [
                                country.capital || null,
                                country.region || null,
                                country.population,
                                currencyCode,
                                exchangeRate,
                                estimatedGdp,
                                country.flag || null,
                                existing[0].id
                            ]
                        );
                    } else {
                        // Insert new country
                        await connection.execute(
                            `INSERT INTO countries 
                                (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                            [
                                country.name,
                                country.capital || null,
                                country.region || null,
                                country.population,
                                currencyCode,
                                exchangeRate,
                                estimatedGdp,
                                country.flag || null
                            ]
                        );
                    }

                    processedCount++;
                    if (processedCount % 50 === 0) {
                        console.log(`   Processed ${processedCount}/${countries.length} countries...`);
                    }
                }

                // Update metadata
                const [countResult] = await connection.execute(
                    'SELECT COUNT(*) as total FROM countries'
                );
                
                await connection.execute(
                    'UPDATE refresh_metadata SET last_refreshed_at = NOW(), total_countries = ? WHERE id = 1',
                    [countResult[0].total]
                );

                await connection.commit();
                console.log('✅ Database updated successfully');

                // Generate summary image
                console.log('🎨 Generating summary image...');
                const [topCountries] = await connection.execute(
                    'SELECT name, estimated_gdp FROM countries WHERE estimated_gdp IS NOT NULL ORDER BY estimated_gdp DESC LIMIT 5'
                );

                const [metadata] = await connection.execute(
                    'SELECT total_countries, last_refreshed_at FROM refresh_metadata WHERE id = 1'
                );

                await imageGenerator.generateSummaryImage({
                    totalCountries: metadata[0].total_countries,
                    topCountries: topCountries,
                    lastRefreshed: metadata[0].last_refreshed_at
                });

                res.json({
                    message: 'Countries refreshed successfully',
                    total_countries: metadata[0].total_countries,
                    last_refreshed_at: metadata[0].last_refreshed_at
                });

            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }

        } catch (error) {
            console.error('❌ Refresh error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    }

    // GET /countries
    async getAllCountries(req, res) {
        try {
            const { region, currency, sort } = req.query;

            let query = 'SELECT * FROM countries WHERE 1=1';
            const params = [];

            // Apply filters
            if (region) {
                query += ' AND region = ?';
                params.push(region);
            }

            if (currency) {
                query += ' AND currency_code = ?';
                params.push(currency);
            }

            // Apply sorting
            if (sort) {
                switch (sort) {
                    case 'gdp_desc':
                        query += ' ORDER BY estimated_gdp DESC';
                        break;
                    case 'gdp_asc':
                        query += ' ORDER BY estimated_gdp ASC';
                        break;
                    case 'name_asc':
                        query += ' ORDER BY name ASC';
                        break;
                    case 'name_desc':
                        query += ' ORDER BY name DESC';
                        break;
                    default:
                        query += ' ORDER BY name ASC';
                }
            } else {
                query += ' ORDER BY name ASC';
            }

            const [countries] = await db.execute(query, params);
            res.json(countries);

        } catch (error) {
            console.error('❌ Get all countries error:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    }

    // GET /countries/:name
    async getCountryByName(req, res) {
        try {
            const { name } = req.params;

            const [countries] = await db.execute(
                'SELECT * FROM countries WHERE LOWER(name) = LOWER(?)',
                [name]
            );

            if (countries.length === 0) {
                return res.status(404).json({
                    error: 'Country not found'
                });
            }

            res.json(countries[0]);

        } catch (error) {
            console.error('❌ Get country error:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    }

    // DELETE /countries/:name
    async deleteCountry(req, res) {
        try {
            const { name } = req.params;

            const [result] = await db.execute(
                'DELETE FROM countries WHERE LOWER(name) = LOWER(?)',
                [name]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Country not found'
                });
            }

            // Update total count in metadata
            const [countResult] = await db.execute(
                'SELECT COUNT(*) as total FROM countries'
            );
            
            await db.execute(
                'UPDATE refresh_metadata SET total_countries = ? WHERE id = 1',
                [countResult[0].total]
            );

            res.json({
                message: 'Country deleted successfully'
            });

        } catch (error) {
            console.error('❌ Delete country error:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    }

    // GET /status
    async getStatus(req, res) {
        try {
            const [metadata] = await db.execute(
                'SELECT total_countries, last_refreshed_at FROM refresh_metadata WHERE id = 1'
            );

            res.json({
                total_countries: metadata[0].total_countries,
                last_refreshed_at: metadata[0].last_refreshed_at
            });

        } catch (error) {
            console.error('❌ Get status error:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    }

    // GET /countries/image
    async getSummaryImage(req, res) {
        try {
            const path = require('path');
            const fs = require('fs').promises;
            
            const imagePath = path.join(__dirname, '../../cache/summary.png');

            try {
                await fs.access(imagePath);
                res.sendFile(imagePath);
            } catch (error) {
                res.status(404).json({
                    error: 'Summary image not found'
                });
            }

        } catch (error) {
            console.error('❌ Get image error:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    }
}

module.exports = new CountryController();