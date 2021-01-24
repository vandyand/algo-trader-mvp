#!/usr/bin/env node
import axios from "axios";
import yargs from "yargs";
import {
  getDefaultAccountId,
  updateDefaultAccountId,
  getBaseUrl,
  getHeaders,
} from "./db.js";
import { executeOrder, executeDBOrders } from "./orders.js";

var argv = yargs(process.argv.slice(2))
  .usage("Usage: $0 -f [func] -a [str] -i [str] -u [num]")
  .alias("f", "function")
  .alias("a", "account-id")
  .alias("i", "instruments")
  .alias("u", "units")
  .demandOption(["f"]).argv;

const func = argv.f;
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
};

const getOandaTrades = () => {
  axios
    .get(`${url}/${accountId}/trades`, {
      headers,
    })
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err));
};

const getPrice = (instruments) => {
  axios
    .get(`${url}/${accountId}/pricing?instruments=${instruments}`, {
      headers,
    })
    .then((res) => console.log(res.data))
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
  getPrice: () => getPrice(instruments),
  updateDefaultAccountId: () => updateDefaultAccountId(accountId),
};

funcs[func]();
