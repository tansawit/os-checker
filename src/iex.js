const axios = require('axios').default;

async function getPrices(symbols) {
  const res = await axios.post(
    'https://asia-southeast2-price-caching.cloudfunctions.net/query-price',
    (data = { source: 'iex', symbols: symbols })
  );
  const prices = await res.data;
  const multiplier = '0'.repeat(9);
  for (let index = 0; index < prices.length; index++) {
    prices[index] = parseFloat(prices[index]) * 1e9;
  }
  return prices;
}

module.exports = {
  getPrices,
};
