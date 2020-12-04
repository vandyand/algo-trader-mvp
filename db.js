import * as fs from "fs";

const getDB = () => {
    return JSON.parse(fs.readFileSync("db.json"));
};

const updateDB = (db) => {
    fs.writeFileSync("db.json", JSON.stringify(db));
};

export const getDefaultAccountId = () => {
    return getDB()["defaultAccountId"];
};

export const updateDefaultAccountId = (newAccountId) => {
    if (!newAccountId) {
        return;
    }
    const db = getDB();
    db["defaultAccountId"] = newAccountId;
    updateDB(db);
    console.log("new default account id:", newAccountId);
};

export const getOrdersToExecute = () => {
    return getDB()["ordersToExecute"];
};
