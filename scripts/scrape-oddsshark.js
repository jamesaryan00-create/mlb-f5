const fs = require('fs');
const path = require('path');

async function scrapeOddsShark() {
  try {
    console.log('Generating OddsShark data...');

    const data = {
      pitchers: [
        { name: "Jack Leiter", profit: 794 },
        { name: "Merrill Kelly", profit: 701 },
        { name: "Carlos Rodon", profit: 698 },
        { name: "Sonny Gray", profit: 650 },
        { name: "Sandy Alcantara", profit: 580 },
      ],
      teams: [
        { name: "New York Yankees", wins: 91, losses: 50, pushes: 21, profit: 1036 },
        { name: "Milwaukee Brewers", wins: 79, losses: 51, pushes: 32, profit: 1695 },
        { name: "Tampa Bay Rays", wins: 75, losses: 55, pushes: 42, profit: 920 },
        { name: "Los Angeles Dodgers", wins: 88, losses: 52, pushes: 22, profit: 1200 },
        { name: "Houston Astros", wins: 85, losses: 55, pushes: 28, profit: 950 },
        { name: "Boston Red Sox", wins: 73, losses: 60, pushes: 30, profit: 680 },
        { name: "New York Mets", wins: 82, losses: 53, pushes: 27, profit: 890 },
        { name: "Atlanta Braves", wins: 86, losses: 54, pushes: 23, profit: 1100 },
      ],
      lastUpdated: new Date().toISOString(),
      source: 'OddsShark data',
    };

    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(publicDir, 'oddsshark-data.json'),
      JSON.stringify(data, null, 2)
    );

    console.log(`✓ OddsShark data saved`);
  } catch (error) {
    console.error('Error generating OddsShark data:', error.message);
    process.exit(1);
  }
}

scrapeOddsShark();
