const axios = require("axios");
const env = require("dotenv").config();

// console.log(process.env.OANDA_API_KEY)
// console.log(process.env.TEST_KEY)

const getAccountIds = async () => {
  try {
    return await axios.get("https://api-fxpractice.oanda.com/v3/accounts", {
      headers: {
        Authorization: `Bearer ${process.env.OANDA_API_KEY}`,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const getAccountSummary = async (account_id) => {
  try {
    return await axios.get(
      `https://api-fxpractice.oanda.com/v3/accounts/${account_id}/summary`,
      {
        headers: {
          Authorization: `Bearer ${process.env.OANDA_API_KEY}`,
        },
      }
    );
  } catch (error) {
    console.error(error);
  }
};

// const executeOrder = async (orderDetails) => {
//     try {
//         return await axios.post()
//     }
// }

const callOandaFunc = async (Func, ...args) => {
    const res = await Func(...args);
    
    console.log(res.data);
};

const account_id = "101-001-5729740-002";

callOandaFunc(getAccountSummary, account_id);

// callOandaFunc(ExecuteOrder, )
