import * as fs from 'fs';

const getDB = () => {
    return JSON.parse(fs.readFileSync("db.json"))
}

const updateDB = (db) => {
    fs.writeFileSync("db.json",JSON.stringify(db))
}

export const getDefaultAccountId = () => {
    return getDB()["default-account-id"];
}

export const updateDefaultAccountId = (newAccountId) => {
    if(!newAccountId){
        return;
    }
    const db = getDB();
    db["default-account-id"] = newAccountId;
    updateDB(db);
    console.log("new default account id:",newAccountId)
}



