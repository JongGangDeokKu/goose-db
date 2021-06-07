const { GooseDB } = require("./gooseDB.js");

const main = async () => {
    const { google } = require("googleapis");
    const key = require("./credentials.json");

    const testSQL = {
        create_database: "CREATE DATABASE GooseDB",
        drop_database: "DROP DATABASE",
        create_table:
            "CREATE TABLE GooseDB (ID INT, NAME VARCHAR(30), GROUP_NAME VARCHAR(30), SCHOOL VARCHAR(30))",
        insert: [
            "INSERT INTO GooseDB (ID, NAME, GROUP_NAME, SCHOOL) VALUES (1, '희강', 'A', '충남대')",
            "INSERT INTO GooseDB (ID, NAME, GROUP_NAME, SCHOOL) VALUES (2, '성덕', 'A', '충남대')",
            "INSERT INTO GooseDB (ID, NAME, GROUP_NAME, SCHOOL) VALUES (3, '종현', 'B', '충남대')",
            "INSERT INTO GooseDB (ID, NAME, GROUP_NAME, SCHOOL) VALUES (4, '서경', 'B', '충남대')",
            "INSERT INTO GooseDB (ID, NAME, GROUP_NAME, SCHOOL) VALUES (5, '지원', 'C', '충남대')",
            "INSERT INTO GooseDB (ID, NAME, GROUP_NAME, SCHOOL) VALUES (6, '재용', 'C', '충남대')",
        ],
        select: "SELECT * FROM GooseDB",
        delete: "DELETE FROM GooseDB WHERE GROUP_NAME = 'B'",
    };

    // DB 연결
    const gooseDB = new GooseDB();

    await gooseDB.connect(
        google,
        key
    );
    
    // 데이터베이스 생성 쿼리
    // await gooseDB.query(testSQL.create_database);

    // 데이터베이스 삭제 쿼리
    // await gooseDB.query(testSQL.drop_database);

    // 테이블 생성 쿼리
    // await gooseDB.query(testSQL.create_table);

    // 테이블 삭제 쿼리
    // await gooseDB.query(testSQL.drop_table);

    // 데이터 삽입 쿼리
    // for (let i = 0; i < testSQL.insert.length; i++) {
    //     await gooseDB.query(testSQL.insert[i]);
    // }

    // 데이터 삽입 쿼리 (배열)
    // await gooseDB.query(testSQL.insert);

    // // SELECT 쿼리
    // console.log(await gooseDB.query(testSQL.select));

    // UNION 쿼리
    // console.log(await gooseDB.query(testSQL.union));

    // DELETE 쿼리
    // await gooseDB.query(testSQL.delete);

    // UPDATE 쿼리
    // await gooseDB.query(testSQL.update);
};

main();
