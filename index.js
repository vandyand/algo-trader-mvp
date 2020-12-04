#!/usr/bin/env node
import axios from "axios";
import dotenv from "dotenv";
import yargs from "yargs";
import {getDefaultAccountId, updateDefaultAccountId} from "./db.js";


// var argv = require('yargs/yargs')(process.argv.slice(2))
var argv = yargs(process.argv.slice(2))
.usage('Usage: $0 -f [func] -a [str] -u [num] -r [num]')
.alias("f","function")
.alias("a","account-id")
.alias("u","units")
.alias("r","range")
.demandOption(['f'])
.argv;

const func = argv.f;
const accountId = argv.a || getDefaultAccountId();
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

const executeOrder = (
  body = {
    order: {
      units,
      instrument: "EUR_USD",
      // instrument: "USD_CAD",
      // instrument: "GBP_USD",
      timeInForce: "FOK",
      type: "MARKET",
      positionFill: "DEFAULT",
    },
  }
) => {
  return axios({
    method: "post",
    url: `${url}/${accountId}/orders`,
    headers,
    data: body,
  })
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((err) => console.log(err));
};

const executeTPSLOrder = (
  tp = {
    order: {
      type: "TAKE_PROFIT",
      tradeID: "",
      price: "",
    },
  },
  sl = {
    order: {
      type: "STOP_LOSS",
      tradeID: "",
      price: "",
    },
  }
) => {
  executeOrder()
  .then((res) =>{
    // console.log("########### execute res:", res.lastTransactionID, "##############")
    const tradeID = res.lastTransactionID;
    const price = Number(res.orderFillTransaction.price)
    if (Number(res.orderFillTransaction.units) >= 0) {
      tp.order.price = price + range;
      sl.order.price = price - range;
    } else {
      tp.order.price = price - range;
      sl.order.price = price + range;
    }
    tp.order.tradeID = sl.order.tradeID = tradeID;
    executeOrder(tp)
    executeOrder(sl)
  })
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

const getOrders = () => {
  axios
    .get(`${url}/${accountId}/orders`, {
      headers,
    })
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err));

}

const funcs = {
  getAccountIds,
  getAccountSummary,
  executeOrder,
  getPositions,
  getOrders,
  closeAllPositions,
  executeTPSLOrder,
  getDefaultAccountId: () => console.log(getDefaultAccountId()),
  updateDefaultAccountId: () => updateDefaultAccountId(accountId),
};

funcs[func]();
