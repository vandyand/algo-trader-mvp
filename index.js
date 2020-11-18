const axios = require("axios");
const env = require("dotenv").config();

// console.log(process.env.OANDA_API_KEY)
// console.log(process.env.TEST_KEY)

const url = "https://api-fxpractice.oanda.com/v3/accounts";
const account = "101-001-5729740-002";

const getAccountIds = async () => {
  try {
    return await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.OANDA_API_KEY}`,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const getAccountSummary = async () => {
  try {
    return await axios.get(
      `${url}/${account}/summary`,
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

const callOandaFunc = async (Func, ...args) => {
    const res = await Func(...args);
    
    console.log(res.data);
};


callOandaFunc(getAccountSummary, account_id);

// callOandaFunc(ExecuteOrder, )
