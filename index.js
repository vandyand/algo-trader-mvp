const axios = require("axios");
const env = require("dotenv").config();

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
      console.log(res.data)
      return res.data;
    })
    .catch((err) => console.log(err));
};

const addTPSLOrder = ()

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

switch (func) {
  case "getAccountSummary":
    getAccountSummary();
    break;
  case "executeOrder":
    executeOrder();
    break;
  case "getPositions":
    getPositions();
    break;
  case "closeAllPositions":
    closeAllPositions();
    break;
  default:
    getAccountIds();
}
