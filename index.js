#!/usr/bin/env node
import axios from "axios";
import yargs from "yargs";
import _ from "lodash";
import {
  getDefaultAccountId,
  updateDefaultAccountId,
  getBaseUrl,
  getHeaders,
  getTargetPricesFromDb,
} from "./db.js";
import {
  createMarketOrderObj,
  executeOrder,
  executeDBOrders,
} from "./orders.js";

var argv = yargs(process.argv.slice(2))
  .usage("Usage: $0 -f [func] -a [str] -i [str] -u [num]")
  .alias("f", "function")
  .alias("a", "account-id")
  .alias("i", "instruments")
  .alias("u", "units").argv;

const func = argv.f || "getAccountIds";
const accountId = argv.a || getDefaultAccountId();
const instruments = argv.i || null;

const url = getBaseUrl();
const headers = getHeaders();

const getAccountIds = () => {
  axios
    .get(process.env.URL, { headers })
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
      // console.log(res.data.positions);
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
};

const getOandaTrades = () => {
  axios
    .get(`${url}/${accountId}/trades`, {
      headers,
    })
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err));
};

const getPrices = (instruments) => {
  return axios
    .get(`${url}/${accountId}/pricing?instruments=${instruments}`, {
      headers,
    })
    .then((res) => {
      console.log(res.data);
      return res.data.prices;
    })
    .catch((err) => console.log(err));
};

const trackingSystem = (instruments) => {
  const targetPrices = getTargetPricesFromDb();
  getPrices(instruments)
    .then((prices) => {
      getPositions()
        .then((positions) => {
          const mergedPrices = prices
            .map((priceObj) =>
              _.assignIn(
                priceObj,
                targetPrices.find(
                  (targetPrice) =>
                    priceObj.instrument === targetPrice.instrument
                ),
                positions.find(
                  (position) => priceObj.instrument === position.instrument
                )
              )
            )
            .filter((priceObj) => priceObj.targetPrice)
            .map((priceObj) => {
              const spread = priceObj.closeoutAsk - priceObj.closeoutBid;
              const midPrice = Number(priceObj.closeoutBid) + spread / 2;
              const diff = priceObj.targetPrice - midPrice;
              const currentPosSize = priceObj.long
                ? Number(priceObj.long.units) + Number(priceObj.short.units)
                : 0;
              const targetPosSize = (diff * 100000).toFixed(0);
              const units = targetPosSize - currentPosSize;
              executeOrder(createMarketOrderObj(priceObj.instrument, units));
              return {
                ...priceObj,
                spread,
                midPrice,
                diff,
                currentPosSize,
                targetPosSize,
              };
            });

          console.log(mergedPrices);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

const funcs = {
  closeAllPositions,
  executeDBOrders,
  getAccountIds,
  getAccountSummary,
  getDefaultAccountId: () => console.log(getDefaultAccountId()),
  getOandaOrders,
  getOandaTrades,
  getPositions,
  getPrices: () => getPrices(instruments),
  trackingSystem: () => trackingSystem(instruments),
  updateDefaultAccountId: () => updateDefaultAccountId(accountId),
};

funcs[func]();
