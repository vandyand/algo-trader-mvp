import axios from "axios";
import { getOrdersToExecute, getDefaultAccountId, getBaseUrl, getHeaders } from "./db.js";

const accountId = getDefaultAccountId();
const url = getBaseUrl();
const headers = getHeaders();

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
