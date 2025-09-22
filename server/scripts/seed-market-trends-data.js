const { pool } = require('./src/config/database.js');

// Comprehensive market trends data seeding script
const seedMarketTrendsData = async () => {
  try {
    console.log('🌱 Starting market trends data seeding...');

    // Clear existing data
    await pool.query('DELETE FROM price_trends');
    console.log('✅ Cleared existing price trends data');

    // Define regions and woredas
    const regions = [
      { name: 'Addis Ababa', woredas: ['Bole', 'Kirkos', 'Nifas Silk-Lafto', 'Kolfe Keranio', 'Arada'] },
      { name: 'Oromia', woredas: ['Jimma', 'Nekemte', 'Shashemene', 'Adama', 'Bishoftu'] },
      { name: 'Amhara', woredas: ['Bahir Dar', 'Gondar', 'Dessie', 'Debre Markos', 'Woldia'] },
      { name: 'Tigray', woredas: ['Mekelle', 'Axum', 'Adigrat', 'Shire', 'Humera'] },
      { name: 'SNNPR', woredas: ['Hawassa', 'Arba Minch', 'Dilla', 'Wolaita Sodo', 'Jinka'] },
      { name: 'Sidama', woredas: ['Hawassa', 'Yirgalem', 'Aleta Wondo', 'Dale', 'Bona'] },
      { name: 'Harari', woredas: ['Harar', 'Dire Dawa'] },
      { name: 'Dire Dawa', woredas: ['Dire Dawa'] },
      { name: 'Gambela', woredas: ['Gambela', 'Itang', 'Agnwa'] },
      { name: 'Afar', woredas: ['Semera', 'Asayita', 'Dubti', 'Afambo', 'Ewa'] }
    ];

    // Define crops with their base prices and seasonal patterns
    const crops = [
      { name: 'teff', basePrice: 85, volatility: 0.15, seasonalPeak: 7, seasonalLow: 1 },
      { name: 'wheat', basePrice: 45, volatility: 0.12, seasonalPeak: 7, seasonalLow: 1 },
      { name: 'barley', basePrice: 38, volatility: 0.10, seasonalPeak: 7, seasonalLow: 1 },
      { name: 'maize', basePrice: 32, volatility: 0.18, seasonalPeak: 7, seasonalLow: 1 },
      { name: 'coffee', basePrice: 320, volatility: 0.08, seasonalPeak: 7, seasonalLow: 12 },
      { name: 'sorghum', basePrice: 28, volatility: 0.14, seasonalPeak: 7, seasonalLow: 1 },
      { name: 'chickpea', basePrice: 65, volatility: 0.11, seasonalPeak: 7, seasonalLow: 1 },
      { name: 'lentil', basePrice: 58, volatility: 0.13, seasonalPeak: 7, seasonalLow: 1 },
      { name: 'fava_bean', basePrice: 55, volatility: 0.09, seasonalPeak: 7, seasonalLow: 1 },
      { name: 'sesame', basePrice: 120, volatility: 0.16, seasonalPeak: 7, seasonalLow: 1 }
    ];

    // Generate data for the last 2 years
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2025-01-01');
    const dataPoints = [];

    for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
      const currentDate = new Date(date);
      const month = currentDate.getMonth() + 1;
      const dayOfYear = Math.floor((currentDate - new Date(currentDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

      for (const region of regions) {
        for (const woreda of region.woredas) {
          for (const crop of crops) {
            // Calculate seasonal price variation
            const seasonalFactor = calculateSeasonalFactor(month, crop.seasonalPeak, crop.seasonalLow);
            
            // Add random market volatility
            const volatilityFactor = 1 + (Math.random() - 0.5) * crop.volatility;
            
            // Regional price variation (urban vs rural)
            const regionalFactor = region.name === 'Addis Ababa' ? 1.15 : 
                                 region.name === 'Oromia' ? 1.05 : 
                                 region.name === 'Amhara' ? 1.08 : 1.0;
            
            // Calculate final price
            const price = Math.round(crop.basePrice * seasonalFactor * volatilityFactor * regionalFactor * 100) / 100;
            
            // Add some data gaps (not every day has data)
            if (Math.random() > 0.3) { // 70% chance of having data
              dataPoints.push({
                crop: crop.name,
                region: region.name,
                woreda: woreda,
                date: currentDate.toISOString().split('T')[0],
                avg_price: price,
                currency: 'ETB'
              });
            }
          }
        }
      }
    }

    // Insert data in batches
    const batchSize = 1000;
    for (let i = 0; i < dataPoints.length; i += batchSize) {
      const batch = dataPoints.slice(i, i + batchSize);
      const values = batch.map(point => 
        `('${point.crop}', '${point.region}', '${point.woreda}', '${point.date}', ${point.avg_price}, '${point.currency}')`
      ).join(',');
      
      await pool.query(`
        INSERT INTO price_trends (crop, region, woreda, date, avg_price, currency) 
        VALUES ${values}
        ON DUPLICATE KEY UPDATE avg_price = VALUES(avg_price)
      `);
      
      console.log(`📊 Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dataPoints.length / batchSize)}`);
    }

    console.log(`✅ Successfully seeded ${dataPoints.length} price trend records`);
    console.log('🎉 Market trends data seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding market trends data:', error);
    throw error;
  }
};

// Helper function to calculate seasonal price factors
function calculateSeasonalFactor(month, peakMonth, lowMonth) {
  const distanceToPeak = Math.min(
    Math.abs(month - peakMonth),
    Math.abs(month - peakMonth + 12),
    Math.abs(month - peakMonth - 12)
  );
  
  const distanceToLow = Math.min(
    Math.abs(month - lowMonth),
    Math.abs(month - lowMonth + 12),
    Math.abs(month - lowMonth - 12)
  );
  
  // Peak price is 1.3x base, low price is 0.8x base
  const peakFactor = 1.3;
  const lowFactor = 0.8;
  
  if (distanceToPeak === 0) return peakFactor;
  if (distanceToLow === 0) return lowFactor;
  
  // Interpolate between peak and low
  const totalDistance = distanceToPeak + distanceToLow;
  const peakWeight = distanceToLow / totalDistance;
  const lowWeight = distanceToPeak / totalDistance;
  
  return peakWeight * peakFactor + lowWeight * lowFactor;
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedMarketTrendsData()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedMarketTrendsData };
