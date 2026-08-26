const CATEGORY_KEYWORDS = {
  streetlight: ['streetlight', 'street light', 'lamp', 'light out', 'bulb', 'lighting', 'dark street'],
  garbage: ['garbage', 'trash', 'waste', 'bin', 'rubbish', 'dump', 'overflow'],
  road: ['road', 'pothole', 'street', 'pavement', 'sidewalk', 'traffic', 'broken road', 'crack'],
  water: ['water', 'leak', 'flood', 'flooding', 'pipe', 'drain', 'sewage'],
};

function suggestCategory(text) {
  if (!text) return null;

  const lowerText = text.toLowerCase();
  const scores = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[category] = keywords.filter((kw) => lowerText.includes(kw)).length;
  }

  const bestMatch = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  return bestMatch[1] > 0 ? bestMatch[0] : null;
}

module.exports = { suggestCategory };