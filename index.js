const axios = require("axios");
const env = require("dotenv").config();

// console.log(process.env.OANDA_API_KEY)
// console.log(process.env.TEST_KEY)

const url = "https://api-fxpractice.oanda.com/v3/accounts";
const account = "101-001-5729740-002";
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

const executeOrder = () => {
  const body = {
    order: {
      units: "-250",
      instrument: "EUR_USD",
      timeInForce: "FOK",
      type: "MARKET",
      positionFill: "DEFAULT",
    },
  };
  axios({
    method: "post",
    url: `${url}/${account}/orders`,
    headers,
    data: body,
  })
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err));
};

const getPositions = () => {
  axios
    .get(`${url}/${account}/positions`, {
      headers,
    })
    .then((res) => console.log(res.data.positions))
    .catch((err) => console.log(err));
};

// getAccountIds();

// getAccountSummary();

// executeOrder();

getPositions();
