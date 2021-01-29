const axios = require('axios').default;
const { Client, Wallet, Transaction, Message } = require('@bandprotocol/bandchain.js');
const { PrivateKey } = Wallet;
const { MsgRequest } = Message;

const rpcURL = 'https://rpc.bandchain.org';
const client = new Client(rpcURL);

const privKey = PrivateKey.fromMnemonic(
  'subject economy equal whisper turn boil guard giraffe stick retreat wealth card only buddy joy leave genuine resemble submit ghost top polar adjust avoid'
);
const pubKey = privKey.toPubkey();
const addr = pubKey.toAddress();

async function makeRequest(input) {
  const account = await client.getAccount(addr);
  const chainID = await client.getChainID();
  const oracleScriptID = 9;
  const calldata = Buffer.from(input, 'hex');
  const askCount = 16;
  const minCount = 10;
  const clientID = 'test';

  // Form transaction
  const t = new Transaction()
    .withMessages(new MsgRequest(oracleScriptID, calldata, askCount, minCount, clientID, addr))
    .withAccountNum(account.accountNumber)
    .withSequence(account.sequence)
    .withChainID(chainID)
    .withGas(5000000)
    .withMemo('bandchain.js example');
  const rawData = t.getSignData();
  // Sign transaction
  const signature = privKey.sign(rawData);
  const rawTx = t.getTxData(signature, pubKey);
  // Send transaction
  const res = await client.sendTxBlockMode(rawTx);
  // Retrieve the requestID
  return res.log[0].events[2].attributes[0].value;
}

module.exports = {
  makeRequest,
};
