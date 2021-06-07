const { Parser } = require("./parser");
const { Translator } = require("./translator.js");

class GooseDB {
    constructor() {

        this.parser = new Parser();
        this.translator = new Translator();

        this.google = null;
        this.key = null;
        this.spreadsheetId = null;
        this.client = null;
        this.api = null;
        this.drive = null;
        this.connected = false;
    }

    colNameConverter(sql, columnInfo) {
        for (const key in columnInfo) {
            sql = sql.replace(new RegExp(`\`${key}\``, "g"), columnInfo[key]);
        }

        return sql;
    }

    setSpreadsheetId(spreadsheetId) {
        this.spreadsheetId = spreadsheetId;
    }

    setKey(key) {
        this.key = key;
    }

    async initEmail() {
        const readline = require("readline");
        const fs = require("fs");

        let email = null;
        email = await new Promise((resolve) => {
            let email_re =
                /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            let rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            console.log("Input your e-mail address");
            rl.setPrompt("> ");
            rl.prompt();
            rl.on("line", (line) => {
                if (email_re.test(line)) {
                    console.log("Get Correct e-mail");
                    const data = JSON.parse(fs.readFileSync("credentials.json"));
                    data.editor_email = [line];
                    fs.writeFileSync("credentials.json", JSON.stringify(data));
                    this.key = data;
                    rl.close();
                    resolve(line);
                } else {
                    console.log(
                        "ERR:: Not e-mail regular expression\nPlease input again!"
                    );
                    rl.prompt();
                }
            });
        });
    }

    async getColumnInfo(tableName) {
        const asciiA = 65;
        const columns = new Object();

        const request = {
            spreadsheetId: this.spreadsheetId,
            range: `${tableName}!A1:1`,
        };
        const {
            data: { values },
        } = await this.api.spreadsheets.values.get(request);

        values[0].forEach((colName, idx) => {
            const disit = parseInt(idx / 26);
            const first =
                disit === 0 ? "" : String.fromCharCode(asciiA + disit - 1);
            const last = String.fromCharCode((idx % 26) + asciiA);
            columns[colName] = first + last;
        });

        return columns;
    }

    async getSheetId(tableName) {
        const request = {
            spreadsheetId: this.spreadsheetId,
        };
        const res = await this.api.spreadsheets.get(request);
        const sheets = res.data.sheets;

        for (let i = 0; i < sheets.length; i++) {
            const {
                properties: { title, sheetId },
            } = sheets[i];

            if (title === tableName)
                return sheetId;
        }
        return null;
    }

    async connect(google, key, spreadsheetId = null) {
        const chalk = require("chalk");
        const figlet = require("figlet");

        this.google = google;
        this.key = key;
        this.client = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            [
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/drive",
            ]
        );

        const result = await new Promise((resolve) => {
            this.client.authorize((err, tokens) => {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    console.log(
                        chalk.cyanBright(
                            figlet.textSync("Goose DB", {
                                horizontalLayout: "full",
                            })
                        )
                    );
                    console.log("\nConnect GooseDB successfully!\n");
                    resolve(true);
                }
            });
        });

        if (result) {
            this.api = google.sheets({
                version: "v4",
                auth: this.client,
            });

            this.drive = google.drive({
                version: "v3",
                auth: this.client,
            });

            this.spreadsheetId = spreadsheetId;
            this.connected = true;
        }

        return result;
    }

    async query(sql) {
        try {
            let sqlAst = null;
            let type = null;
            let result = null;

            if (Array.isArray(sql)) {
                sqlAst = this.parser.astify(sql[0]);
                type = sqlAst.type;
            } else {
                sqlAst = this.parser.astify(sql);
                type = sqlAst.type;
            }

            if (type === "create") {
                if (sqlAst.keyword === "database") {
                    const dbName = this.translator.create(sqlAst);

                    result = await this.createDB(dbName);
                } else if (sqlAst.keyword === "table") {
                    const { tableName, columns } =
                        this.translator.create(sqlAst);

                    result = await this.createTable(tableName, columns);
                }
            } else if (type === "insert") {
                const sqls = Array.isArray(sql) ? sql : [sql];
                const ssAsts = new Object();

                for (let i = 0; i < sqls.length; i++) {
                    const ast = this.parser.astify(sqls[i]);
                    if (ast.type !== "insert") {
                        error();
                    }
                    const tableName = ast.table[0].table;
                    const columnInfo = await this.getColumnInfo(tableName);
                    const ssAst = this.translator.insert(ast, columnInfo);

                    if (ssAsts[tableName]) {
                        ssAsts[tableName].push(ssAst.values);
                    } else {
                        ssAsts[tableName] = [ssAst.values];
                    }
                }

                for (const key in ssAsts) {
                    result = await this.insert(key, ssAsts[key]);
                }
            } else if (type === "select") {
                if (sqlAst.union !== "union") {
                    const tableName = sqlAst.from[0].table;
                    sqlAst.from = null;

                    const columnInfo = await this.getColumnInfo(tableName);

                    sql = this.parser.sqlify(sqlAst);
                    sql = this.colNameConverter(sql, columnInfo);

                    result = await this.select(tableName, sql, 1);
                } else {
                    result = await this.union(sql);
                }
            } else if (type === "delete") {
                const tableName = sqlAst.from[0].table;
                sqlAst.from = null;

                const columnInfo = await this.getColumnInfo(tableName);

                sql = this.parser.sqlify(sqlAst);
                sql = this.colNameConverter(sql, columnInfo);

                const selectQuery = sql.replace("DELETE ", "");

                result = await this.delete(tableName, selectQuery);
            }

            return result;
        } catch (err) {
            if (!this.spreadsheetId) {
                console.log("spreadsheet id is not defined.");
            } else if (!this.connected) {
                console.log("No connection with google.");
            } else {
                console.log(err);
            }
        }

        return null;
    }

    async createDB(dbName) {
        const request = {
            resource: {
                properties: {
                    title: dbName,
                },
                sheets: [
                    {
                        properties: {
                            title: "SELECT_TABLE",
                        },
                    },
                ],
            },
        };

        if (this.key.hasOwnProperty("editor_email")) {
            console.log("\nYou can access in " + this.key.editor_email);
        } else {
            console.log("\nYou must have e-mail address for accessing database!");
            await this.initEmail();
        }

        const res = await this.api.spreadsheets.create(request);
        const fileId = res.data.spreadsheetId;
        this.setSpreadsheetId(fileId);

        this.key.editor_email.forEach(async (email) => {
            await this.drive.permissions.create({
                resource: {
                    type: "user",
                    role: "writer",
                    emailAddress: email,
                },
                fileId: fileId,
                fields: "id",
            });
        });

        console.log(
            "\nCREATE DATABASE completed successfully!\nYou can access spreadsheet : https://docs.google.com/spreadsheets/d/" +
            fileId +
            "/edit"
        );

        return fileId;
    }

    async dropDB(spreadsheetId = this.spreadsheetId) {
        const res = await this.drive.files.delete({
            fileId: spreadsheetId,
        });
        console.log("\nDROP DATABASE completed successfully!");
        this.setSpreadsheetId(null);

        return res;
    }

    async createTable(tableName, columns) {
        const request = {
            spreadsheetId: this.spreadsheetId,
            requestBody: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: tableName,
                            },
                        },
                    },
                ],
            },
        };

        const res = await this.api.spreadsheets.batchUpdate(request);

        if (columns) {
            const colRes = await this.addColumn(tableName, [null, ...columns]);
            console.log("\nCREATE TABLE completed successfully!");
            return colRes;
        }

        console.log("\nCREATE TABLE completed successfully! : column is not written.");
        return res;
    }

    async dropTable(tableName) {
        const sheetId = await this.getSheetId(tableName);

        if (sheetId) {
            try {
                const request = {
                    spreadsheetId: this.spreadsheetId,
                    requestBody: {
                        requests: [
                            {
                                deleteSheet: {
                                    sheetId: sheetId,
                                },
                            },
                        ],
                    },
                };

                const res = await this.api.spreadsheets.batchUpdate(request);
                console.log("\nDROP TABLE completed successfully!");
                return res;
            } catch (err) {
                console.log(err);
            }
        }

        return null;
    }

    async addColumn(tableName, columns) {
        const request = {
            spreadsheetId: this.spreadsheetId,
            range: `${tableName}!A1`,
            valueInputOption: "USER_ENTERED",
            resource: { values: [columns] },
        };

        const res = await this.api.spreadsheets.values.update(request);
        console.log("\nADD COLUMN completed successfully!");
        return res;
    }

    async select(table, sql, option) {
        const startCol = option === 0 ? "A1" : "B1";

        const selectQuery = [[`=QUERY(${table}!${startCol}:N, "${sql}")`]];

        const updateRequest = {
            spreadsheetId: this.spreadsheetId,
            range: "SELECT_TABLE!A1",
            valueInputOption: "USER_ENTERED",
            resource: { values: selectQuery },
        };
        const selectRequest = {
            spreadsheetId: this.spreadsheetId,
            range: "SELECT_TABLE!A1:N",
        };

        await this.api.spreadsheets.values.update(updateRequest);
        const res = await this.api.spreadsheets.values.get(selectRequest);

        console.log("\nSELECT completed successfully!\nYou can see data in spreadsheet.");
        return res.data.values;
    }

    async insert(table, data) {
        data = data.map((col) => {
            col[0] = "=ROW() - 1";
            return col;
        });

        const request = {
            spreadsheetId: this.spreadsheetId,
            range: `${table}!A2`,
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            resource: {
                values: data,
            },
        };
        const res = await this.api.spreadsheets.values.append(request);
        console.log("\nINSERT completed successfully!\nYou can see data in spreadsheet.");
        return res;
    }

    async delete(table, sql) {
        const newQuery = `SELECT A ${sql}`;
        let data = await this.select(table, newQuery, 0);

        const sheetId = await this.getSheetId(table);
        const request = {
            spreadsheetId: this.spreadsheetId,
            requestBody: {
                requests: data.map((col, index) => {
                    const colNum = Number(col[0]) - index;
                    return {
                        deleteDimension: {
                            range: {
                                dimension: "ROWS",
                                sheetId: sheetId,
                                startIndex: colNum,
                                endIndex: colNum + 1,
                            },
                        },
                    };
                }),
            },
        };

        const res = await this.api.spreadsheets.batchUpdate(request);
        console.log("\nDELETE completed successfully!\nYou can see data in spreadsheet.");
        return res;
    }

    async update(table, sql) {
        // const result = await this.select(table, sql);
        // console.log(result);
        const sheetId = await this.getSheetId(table);

        const request = {
            spreadsheetId: this.spreadsheetId,
            requestBody: {
                requests: [
                    {
                        updateCells: {
                            range: {
                                startColumnIndex: 1,
                                endColumnIndex: 1000,
                                startRowIndex: 3,
                                endRowIndex: 3,
                                sheetId: sheetId,
                            },
                            rows: [
                                {
                                    values: [
                                        {
                                            userEnteredValue: {
                                                stringValue: "100",
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                ],
            },
        };

        const res = await this.api.spreadsheets.batchUpdate(request);
        console.log("\nDELETE completed successfully!\nYou can see data in spreadsheet.");
        return res;
    }

    async union(sql) {
        const splitSql = sql.split("UNION");
        const values = [];

        for (let i = 0; i < splitSql.length; i++) {
            splitSql[i] = splitSql[i].trim();
            const splitResult = await this.query(splitSql[i]);
            splitResult.splice(0, 1);

            const stack = [];
            for (let j = 0; j < splitResult.length; j++) {
                for (let k = 0; k < splitResult[j].length; k++) {
                    if (stack.includes(splitResult[j])) continue;
                    stack.push(splitResult[j][k]);
                }
            }

            const set = new Set(stack);
            values.push(...set);
        }
        const set = new Set(values);
        return [...set];
    }
}

module.exports.GooseDB = GooseDB;
