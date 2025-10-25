const axios = require('axios');
require('dotenv').config();

const TIMEOUT = parseInt(process.env.API_TIMEOUT) || 30000;

class ExternalApiService {
    async fetchCountries() {
        try {
            console.log('📡 Fetching countries from RestCountries API...');
            console.log('   URL:', process.env.COUNTRIES_API_URL);
            
            const response = await axios.get(process.env.COUNTRIES_API_URL, {
                timeout: TIMEOUT
            });
            
            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Invalid response format');
            }
            
            console.log(`✅ Fetched ${response.data.length} countries`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('❌ Error fetching countries:');
            console.error('   Message:', error.message);
            console.error('   Code:', error.code);
            if (error.response) {
                console.error('   Status:', error.response.status);
            }
            return { 
                success: false, 
                error: 'Could not fetch data from RestCountries API' 
            };
        }
    }

    async fetchExchangeRates() {
        try {
            console.log('📡 Fetching exchange rates...');
            console.log('   URL:', process.env.EXCHANGE_API_URL);
            
            const response = await axios.get(process.env.EXCHANGE_API_URL, {
                timeout: TIMEOUT
            });
            
            console.log('   Response received');
            console.log('   Result:', response.data.result);
            
            if (!response.data.rates) {
                console.error('   No rates object in response!');
                console.error('   Response keys:', Object.keys(response.data));
                throw new Error('No rates found in API response');
            }
            
            const rateCount = Object.keys(response.data.rates).length;
            console.log(`✅ Fetched ${rateCount} exchange rates`);
            
            return { success: true, data: response.data.rates };
        } catch (error) {
            console.error('❌ Error fetching exchange rates:');
            console.error('   Message:', error.message);
            console.error('   Code:', error.code);
            if (error.response) {
                console.error('   Status:', error.response.status);
                console.error('   Data:', error.response.data);
            }
            return { 
                success: false, 
                error: 'Could not fetch data from Exchange Rate API' 
            };
        }
    }
}

module.exports = new ExternalApiService();