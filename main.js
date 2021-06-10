const { GooseDB } = require("./gooseDB.js");
const { google } = require("googleapis");
const key = require("./credentials.json");

const { testSQL } = require("./testSQL.js");

const main = async () => {
    // // DB 연결
    const gooseDB = new GooseDB();
    await gooseDB.connect(google, key, "");
};

main();
