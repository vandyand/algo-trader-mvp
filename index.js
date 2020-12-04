#!/usr/bin/env node
import axios from "axios";
import dotenv from "dotenv";
import yargs from "yargs";
import { getDefaultAccountId, updateDefaultAccountId } from "./db.js";
import { executeOrder, executeDBOrders} from "./orders.js";


// var argv = require('yargs/yargs')(process.argv.slice(2))
var argv = yargs(process.argv.slice(2))
  .usage('Usage: $0 -f [func] -a [str] -i [str] -u [num] -r [num]')
  .alias("f", "function")
  .alias("a", "account-id")
  .alias("i", "instrument")
  .alias("u", "units")
  .alias("r", "range")
  .demandOption(['f'])
  .argv;

const func = argv.f;
const accountId = argv.a || getDefaultAccountId();
const instrument = argv.i || 'EUR_USD';
const units = Number(argv.u) || 0;
const range = Number(argv.r) || 0;

const env = dotenv.config();
const url = "https://api-fxpractice.oanda.com/v3/accounts";
const headers = {
  Authorization: `Bearer ${process.env.OANDA_API_KEY}`,
  "Content-Type": "application/json",
};

const getAccountIds = () => {
  axios
    .get(url, { headers })
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err));
};

const getAccountSummary = () => {
  axios
    .get(`${url}/${accountId}/summary`, {
      headers,
    })
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err));
};

const getPositions = () => {
  return axios
    .get(`${url}/${accountId}/openPositions`, {
      headers,
    })
    .then((res) => {
      console.log(res.data.positions);
      return res.data.positions;
    })
    .catch((err) => console.log(err));
};

const closeAllPositions = () => {
  getPositions().then((positions) => {
    positions.map((position) => {
      const units = Number(position.long.units) + Number(position.short.units);
      if (units != 0) {
        executeOrder({
          order: {
            units: units * -1,
            instrument: position.instrument,
            timeInForce: "FOK",
            type: "MARKET",
            positionFill: "DEFAULT",
          },
        });
      }
    });
  });
};

const getOandaOrders = () => {
  axios
    .get(`${url}/${accountId}/orders`, {
      headers,
    })
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err));
}

const getOandaTrades = () => {
  axios
    .get(`${url}/${accountId}/trades`, {
      headers,
    })
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err));
}

const funcs = {
  getAccountIds,
  getAccountSummary,
  executeDBOrders,
  getPositions,
  getOandaOrders,
  getOandaTrades,
  closeAllPositions,
  getDefaultAccountId: () => console.log(getDefaultAccountId()),
  updateDefaultAccountId: () => updateDefaultAccountId(accountId),
};

funcs[func]();
