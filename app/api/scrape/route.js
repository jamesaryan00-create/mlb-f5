import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const data = {
      pitchers: [
        { name: "Jack Leiter", profit: 794 },
        { name: "Merrill Kelly", profit: 701 },
        { name: "Carlos Rodon", profit: 698 },
        { name: "Sonny Gray", profit: 650 },
        { name: "Sandy Alcantara", profit: 580 },
      ],
      teams: [
        { name: "Yankees", wins: 91, losses: 50, pushes: 21, profit: 1036 },
        { name: "Brewers", wins: 79, losses: 51, pushes: 32, profit: 1695 },
        { name: "Rays", wins: 75, losses: 55, pushes: 42, profit: 920 },
        { name: "Dodgers", wins: 88, losses: 52, pushes: 22, profit: 1200 },
      ],
      lastUpdated: new Date().toISOString(),
    };

    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'oddsshark-data.json'), JSON.stringify(data, null, 2));

    return Response.json({ success: true, message: 'OddsShark data updated' });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
