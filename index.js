#!/usr/bin/env node
const axios = require("axios");
const env = require("dotenv").config();
// var argv = require('yargs/yargs')(process.argv.slice(2))
//     .usage('Usage: $0 -w [num] -h [num]')
//     .demandOption(['w','h'])
//     .argv;

// console.log("The area is:", argv.w * argv.h);



const clArgs = process.argv.slice(2);
let func = clArgs.length > 0 ? clArgs[0] : "getAccountIds";
// let account = "101-001-5729740-010";
let account = "101-001-5729740-002";
let units = "0";

if (clArgs.length > 1) {
  if (clArgs[1].length == 19) {
    account = clArgs[1];
  } else {
    units = clArgs[1];
  }
}
if (clArgs.length > 2 && units == "0") {
  units = clArgs[2];
}

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
    .get(`${url}/${account}/summary`, {
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
  axios({
    method: "post",
    url: `${url}/${account}/orders`,
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
  const orderRes = executeOrder()

  console.log("########### execute orderRes:",orderRes,"##############")
  
};

const getPositions = () => {
  return axios
    .get(`${url}/${account}/openPositions`, {
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

funcs = {
  "getAccountSummary":
    () => getAccountSummary(),
  "executeOrder":
    () => executeOrder(),
  "getPositions":
    () => getPositions(),
  "closeAllPositions":
    () => closeAllPositions(),
  "executeTPSLOrder":
    () => executeTPSLOrder(),
  "getAccountIds":
    () => getAccountIds(),
}

console.log(funcs['test'])

funcs[func]();

// switch (func) {
//   case "getAccountSummary":
//     getAccountSummary();
//     break;
//   case "executeOrder":
//     executeOrder();
//     break;
//   case "getPositions":
//     getPositions();
//     break;
//   case "closeAllPositions":
//     closeAllPositions();
//     break;
//   case "executeTPSLOrder":
//     executeTPSLOrder();
//     break;
//   default:
//     getAccountIds();
// }
