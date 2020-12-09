import * as fs from "fs";
import dotenv from "dotenv";
const env = dotenv.config();

const getDb = () => {
    return JSON.parse(fs.readFileSync("db.json"));
};

const updateDb = (db) => {
    fs.writeFileSync("db.json", JSON.stringify(db));
};

export const getDefaultAccountId = () => {
    return getDb()["defaultAccountId"];
};

export const updateDefaultAccountId = (newAccountId) => {
    if (!newAccountId) {
        return;
    }
    const db = getDb();
    db["defaultAccountId"] = newAccountId;
    updateDb(db);
    console.log("new default account id:", newAccountId);
};

export const getOrdersToExecute = () => {
    return getDb()["ordersToExecute"];
};

export const getBaseUrl = () => {
    return getDb()["baseUrl"]
}

export const getHeaders = () => {
    return {
        Authorization: `Bearer ${process.env.OANDA_API_KEY}`,
        "Content-Type": "application/json",
    }
}