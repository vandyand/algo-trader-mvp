import axios from "axios";
import { getOrdersToExecute } from "./db.js";
import yargs from "yargs";
import dotenv from "dotenv";
import { getDefaultAccountId, updateDefaultAccountId } from "./db.js";


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

const createMarketOrderObj = (instrument = "EUR_USD", units = 0) => {
  return {
    order: {
      units,
      instrument,
      type: "MARKET",
      timeInForce: "FOK",
      positionFill: "DEFAULT",
    },
  };
};

const createTPSLOrderObj = (type, price, tradeID) => {
  return {
    order: {
      type,
      tradeID,
      price,
    },
  };
};

export const executeOrder = (order) => {
  return axios({
    method: "post",
    url: `${url}/${accountId}/orders`,
    headers,
    data: order,
  })
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((err) => console.log(err));
};

export const executeRangedOrder = (marketOrder, range) => {
  executeOrder(marketOrder).then((res) => {
    const marketPrice = Number(res.orderFillTransaction.price);
    const tpOrder = createTPSLOrderObj(
      "TAKE_PROFIT",
      Number(res.orderFillTransaction.units) > 0
        ? (marketPrice + range).toFixed(5)
        : (marketPrice - range).toFixed(5),
      res.lastTransactionID
    );
    const slOrder = createTPSLOrderObj(
      "STOP_LOSS",
      Number(res.orderFillTransaction.units) > 0
        ? (marketPrice - range).toFixed(5)
        : (marketPrice + range).toFixed(5),
      res.lastTransactionID
    );
    executeOrder(tpOrder);
    executeOrder(slOrder);
  });
};

export const executeDBOrders = () => {
  getOrdersToExecute().map((orderToExecute) => {
    const marketOrder = createMarketOrderObj(
      orderToExecute.instrument,
      orderToExecute.units
    );
    executeRangedOrder(marketOrder, orderToExecute.range);
  });
};
