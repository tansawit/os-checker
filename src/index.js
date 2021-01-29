const { Obi } = require('@bandprotocol/bandchain.js');
const axios = require('axios').default;
const delay = require('delay');
const { makeRequest } = require('./band');
const { getPrices } = require('./iex');

const rpcURL = 'https://rpc.bandchain.org';
const symbols = [
  'AAPL',
  'GOOGL',
  'TSLA',
  'NFLX',
  'QQQ',
  'TWTR',
  'BABA',
  'IAU',
  'SLV',
  'USO',
  'VIXY',
  'AMZN',
  'MSFT',
  'FB',
  'GS',
  'ABNB',
  'GME',
  'AMC',
];
const multiplier = 1000000000;
const input = {
  symbols,
  multiplier,
};

const obi = new Obi('{symbols:[string],multiplier:u64}/{rates:[u64]}');

async function getRequestResult(requestID) {
  const res = await axios.get(`${rpcURL}/oracle/requests/${requestID}`);
  const responsePacketData = res.data.result.result.response_packet_data;
  if (responsePacketData.resolve_status == 1) {
    const requestResult = decodeResult(responsePacketData.result);
    return requestResult;
  }
}

function decodeResult(encodedResult) {
  const result = obi.decodeOutput(Buffer.from(encodedResult, 'base64'));
  return result;
}

(async () => {
  const encodedInput = obi.encodeInput(input);
  const requestID = await makeRequest(encodedInput);
  console.log(`Request ID: ${requestID}`);
  await delay(20000);
  let osResult = (await getRequestResult(requestID)).rates;
  for (let i = 0; i < osResult.length; i++) {
    osResult[i] = Number(osResult[i]);
  }
  let dsResult = await getPrices(symbols);
  for (let i = 0; i < symbols.length; i++) {
    console.log(
      `Symbol: ${symbols[i]} IEXCloud: ${dsResult[i] / 1e9} Oracle Script: ${
        osResult[i] / 1e9
      } Difference: ${(((osResult[i] - dsResult[i]) / dsResult[i]) * 100).toFixed(2)}%`
    );
  }
})();
