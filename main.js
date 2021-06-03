/* */
const main = async () => {

    const sql = "CREATE DATABASE TEST";
    // const sql = "DROP DATABASE TEST";
    // const sql = "";
    // const sql = "SELECT * FROM student";

    const { Parse } = require("./parser");
    sqlAst = Parse(sql);

    const { Translator } = require("./translator");
    const translator = new Translator(sqlAst);
    const ssAst = translator.translate();

    console.log(ssAst);

    const { GooseDB } = require("./ss_function");
    const { google } = require("googleapis");
    const key = require("./credentials.json");
    const gooseDB = new GooseDB(google, key, 'spreadsheetID');

    // const sql = "SELECT * WHERE A>0 AND D=1 ORDER BY C DESC";
    await gooseDB.connect();
    await gooseDB.createDB("TEST");
    // await gooseDB.dropDB('TEST');
    // const result = await gooseDB.query(sql, 0); // SELECT : 쿼리로 입력받고 translate 한거 그대로 넣어주면 됨
    // const result = await gooseDB.query([11, "new", "new", "new"], 1); // UPDATE : 쿼리로 입력받고 내부에서 VALUE를 배열로 넘겨줌
    // const spreadsheetId = await gooseDB.query("NEW-TEST2", 2); // CREATE_DB : 쿼리로 입력받고 내부에서 데이터베이스 이름만 입력받으면 됨
    // const result = await gooseDB.query(["c1", "c2", "c3", "c4"], 3); // CREATE TABLE AND COLUMN : 쿼리로 입력받고 테이블 명, 컬럼명 뽑아서 넣어주면 됨
    // console.log(result);
}

main();