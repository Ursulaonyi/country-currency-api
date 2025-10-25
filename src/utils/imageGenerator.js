const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const path = require('path');

class ImageGenerator {
    async generateSummaryImage(data) {
        try {
            const { totalCountries, topCountries, lastRefreshed } = data;

            // Create canvas
            const width = 800;
            const height = 600;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#1e3c72');
            gradient.addColorStop(1, '#2a5298');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Title
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Country Currency Summary', width / 2, 60);

            // Total Countries
            ctx.font = 'bold 24px Arial';
            ctx.fillText(`Total Countries: ${totalCountries}`, width / 2, 120);

            // Top 5 Countries Header
            ctx.font = 'bold 22px Arial';
            ctx.fillText('Top 5 Countries by Estimated GDP', width / 2, 180);

            // Top 5 Countries List
            ctx.font = '18px Arial';
            ctx.textAlign = 'left';
            let yPos = 220;
            
            topCountries.forEach((country, index) => {
                const gdp = country.estimated_gdp 
                    ? `$${(country.estimated_gdp / 1000000).toFixed(2)}M`
                    : 'N/A';
                
                ctx.fillText(
                    `${index + 1}. ${country.name} - ${gdp}`,
                    100,
                    yPos
                );
                yPos += 40;
            });

            // Last Refreshed
            ctx.textAlign = 'center';
            ctx.font = '16px Arial';
            ctx.fillStyle = '#cccccc';
            const refreshDate = lastRefreshed ? new Date(lastRefreshed).toUTCString() : 'Never';
            ctx.fillText(
                `Last Refreshed: ${refreshDate}`,
                width / 2,
                height - 30
            );

            // Save image
            const buffer = canvas.toBuffer('image/png');
            const imagePath = path.join(__dirname, '../../cache/summary.png');
            await fs.writeFile(imagePath, buffer);

            console.log('✅ Summary image generated successfully');
            return imagePath;
        } catch (error) {
            console.error('❌ Error generating image:', error.message);
            throw error;
        }
    }
}

module.exports = new ImageGenerator();