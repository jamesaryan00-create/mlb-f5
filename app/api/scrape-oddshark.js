export default async function handler(req, res) {
  // For now, return hardcoded 2025 data
  // We'll add live scraping next
  
  const data = {
    pitchers: [
      { name: "Jack Leiter", profit: 794 },
      { name: "Merrill Kelly", profit: 701 },
      { name: "Carlos Rodon", profit: 698 },
    ],
    teams: [
      { name: "Yankees", wins: 91, losses: 50, pushes: 21, profit: 1036 },
      { name: "Brewers", wins: 79, losses: 51, pushes: 32, profit: 1695 },
    ],
  };

  res.status(200).json(data);
}