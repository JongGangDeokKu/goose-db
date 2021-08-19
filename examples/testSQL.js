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
    create_table2:
        "CREATE TABLE GooseDB2 (ID INT, NAME VARCHAR(30), GROUP_NAME VARCHAR(30), SCHOOL VARCHAR(30))",
    insert2: [
        "INSERT INTO GooseDB2 (ID, NAME, GROUP_NAME, SCHOOL) VALUES (1, '희강', 'A', '충남대')",
        "INSERT INTO GooseDB2 (ID, NAME, GROUP_NAME, SCHOOL) VALUES (2, '성덕', 'A', '충남대')",
        "INSERT INTO GooseDB2 (ID, NAME, GROUP_NAME, SCHOOL) VALUES (3, '종현', 'B', '충남대')",
        "INSERT INTO GooseDB2 (ID, NAME, GROUP_NAME, SCHOOL) VALUES (7, '원희', 'B', '충남대')",
        "INSERT INTO GooseDB2 (ID, NAME, GROUP_NAME, SCHOOL) VALUES (8, '승훈', 'C', '충남대')",
        "INSERT INTO GooseDB2 (ID, NAME, GROUP_NAME, SCHOOL) VALUES (9, '기덕', 'C', '충남대')",
    ],
    union: "SELECT ID, NAME FROM GooseDB UNION SELECT ID, NAME FROM GooseDB2",
    delete: "DELETE FROM GooseDB WHERE GROUP_NAME = 'B'",
    update: "UPDATE GooseDB SET NAME = 'UPDATE' WHERE GROUP_NAME = 'A'",
};

module.exports.testSQL = testSQL;
