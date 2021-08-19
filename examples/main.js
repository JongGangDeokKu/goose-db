const { GooseDB } = require("../lib/gooseDB.js");
const { google } = require("googleapis");

const { testSQL } = require("../lib/testSQL.js");

const main = async () => {
    // // DB 연결
    const gooseDB = new GooseDB();
    await gooseDB.connect(google, "./keys.json", "1h2ddQGbx94G1zY2fm2uHk_Ld1Wdtjm2c26r2OrL3iwc");

    // 데이터베이스 생성 쿼리
    // await gooseDB.query(testSQL.create_database);

    // 테이블 생성 쿼리
    // await gooseDB.query(testSQL.create_table);

    // 데이터 삽입 쿼리 (배열)
    // await gooseDB.query(testSQL.insert);

    // // SELECT 쿼리
    // console.log(await gooseDB.query(testSQL.select));

    // UNION 쿼리
    // await gooseDB.query(testSQL.create_table2);
    // await gooseDB.query(testSQL.insert2);
    // console.log(await gooseDB.query(testSQL.union));

    // UPDATE 쿼리
    await gooseDB.query(testSQL.update);

    // DELETE 쿼리
    // await gooseDB.query(testSQL.delete);

    // 테이블 삭제 쿼리
    // await gooseDB.query(testSQL.drop_table);

    // 데이터베이스 삭제 쿼리
    // await gooseDB.query(testSQL.drop_database);
};

main();
