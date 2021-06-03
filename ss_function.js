class GooseDB {
    constructor(google, key, spreadsheetId) {
        this.google = google;
        this.key = key;
        this.spreadsheetId = spreadsheetId;
        this.client = null;
        this.connected = false;
    }
    async connect() {
        const chalk = require('chalk');
        const figlet = require('figlet');

        this.client = new this.google.auth.JWT(
            this.key.client_email,
            null,
            this.key.private_key,
            [
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/drive",
            ]
        );
        this.api = this.google.sheets({ version: "v4", auth: this.client });
        const result = await new Promise((resolve) => {
            this.client.authorize((err, tokens) => {
                if (err) {
                    console.log(err);
                    resolve(false);
                } else {
                    console.log(
                        chalk.cyanBright(
                            figlet.textSync('Goose DB', { horizontalLayout: 'full' })
                        )
                    );
                    resolve(true);
                }
            });

        });
        this.connected = result;
    }
    async getSheets(){
        const request = {
            spreadsheetId: this.spreadsheetId,
            ranges: [],
            includeGridData: false,
            auth: this.client,
          };
        
          try {
            return (await this.api.spreadsheets.get(request)).data.sheets;
          } catch (err) {
            console.error(err);
          }
    }
    setSpreadsheetId(spreadsheetId) {
        this.spreadsheetId = spreadsheetId;
    }
    setKey(key) {
        this.key = key;
    }
    async createDB(dbName) {
        const request = {
            resource: {
                properties: {
                    title: dbName
                },
                sheets: [
                    {
                        properties: {
                            title: 'select table'
                        }
                    }
                ]
            }
        };
        if (this.key.hasOwnProperty("editor_email")) {
            console.log("You can access in " + this.key.editor_email);
        }
        else {
            console.log("You must have e-mail address for accessing database!");
            await this.initEmail();

        }

        const res = await this.api.spreadsheets.create(request);
        const fileId = res.data.spreadsheetId;
        this.setSpreadsheetId(fileId);
        const drive = this.google.drive({ version: "v3", auth: this.client });
        this.key.editor_email.forEach(async (email) => {
            await drive.permissions.create({
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
            "You can access sheet : https://docs.google.com/spreadsheets/d/" +
            fileId +
            "/edit"
        );
        return;
    }
    async dropDB(dbName) {
        const drive = await this.google.drive({ version: "v3", auth: this.client });
        const res = await drive.files.delete({
             fileId: this.spreadsheetId
        })
        console.log("DROP DATABASE completed successfully!");
        this.setSpreadsheetId(null);

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
            const colRes = await this.addColumn(tableName, columns);
            return colRes;
        }
        return res;
    }
    async dropTable(tableName) {
        async function getSheetId(sheets) {
            try {
                for (var i = 0; i < sheets.length; i++) {
                    if (sheets[i].properties.title == tableName) {
                        return sheets[i].properties.sheetId;
                    }
                }
                throw err;
            }
            catch(err) {
                console.log("ERR:: (DROP TABLE) Invalid table name at spreadsheet!")
            }
        }
        const sheets = await this.getSheets();
        const sheetId = await getSheetId(sheets);
        if (sheetId == null) { return; }
        try {
            const request = {
                spreadsheetId: this.spreadsheetId,
                requestBody: {
                    requests: [
                    {
                        deleteSheet: {
                            sheetId: sheetId
                        }
                    }
                    ]
                }
            };
            const res = await this.api.spreadsheets.batchUpdate(request);
            console.log("DROP TABLE completed successfully!")
            return res;
        }
        catch (err) {
            console.log(err);
        }
    }
    async addColumn(tableName, columns) {
        const request = {
            spreadsheetId: this.spreadsheetId,
            range: `${tableName}!A1`,
            valueInputOption: "USER_ENTERED",
            resource: { values: [columns] }
        }
        const res = await this.api.spreadsheets.values.update(request);
        return res;
    }
    async query(sql, type) {
        let result = null;
        switch (type) {
            case 0:
                result = await this.select("Sheet2", sql);
                break;
            case 1:
                result = await this.insert("Sheet2", sql);
                break;
            case 2:
                result = await this.createDB(sql);
                break;
            case 3:
                result = await this.createTable("NEW_TABLE", sql);
            default:
                break;
        }
        return result;
    }
    async select(table, sql) {
        const selectQuery = [[`=QUERY(${table}!A1:N, "${sql}")`]];
        const updateRequest = {
            spreadsheetId: this.spreadsheetId,
            range: "A1",
            valueInputOption: "USER_ENTERED",
            resource: { values: selectQuery },
        }
        const selectRequest = {
            spreadsheetId: this.spreadsheetId,
            range: "A1:N",
        };
        const deleteRequest = {
            spreadsheetId: this.spreadsheetId,
            range: "A1:N",
        };
        await this.api.spreadsheets.values.update(updateRequest);
        const res = await this.api.spreadsheets.values.get(selectRequest);
        await this.api.spreadsheets.values.clear(deleteRequest);
        return res.data.values;
    }
    async insert(table, data) {
        const request = {
            spreadsheetId: this.spreadsheetId,
            range: `${table}!A1`,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            resource: {
                values: [data]
            }
        }
        const res = await this.api.spreadsheets.values.append(request);
        return res;
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
            console.log("Input your e-mail address!");
            rl.setPrompt("> ");
            rl.prompt();
            rl.on("line", (line) => {
                if (email_re.test(line)) {
                    console.log("\nGet Correct e-mail!\n");
                    const data = JSON.parse(fs.readFileSync("credentials.json"));
                    data.editor_email = [line];
                    fs.writeFileSync("credentials.json", JSON.stringify(data));
                    this.setKey(data);
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
}

/* */
const main = async () => {

    // const sql = "CREATE DATABASE TEST";
    const sql = "DROP DATABASE TEST";
    // const sql = "SELECT * FROM student";

    const { Parse } = require("./parser");
    sqlAst = Parse(sql);

    const { Translator } = require("./translator");
    const translator = new Translator(sqlAst);
    const ssAst = translator.translate();

    console.log(ssAst);

    // const { google } = require("googleapis");
    // const key = require("./credentials.json");
    // const gooseDB = new GooseDB(google, key, 'spreadsheetID');

    // const sql = "SELECT * WHERE A>0 AND D=1 ORDER BY C DESC";
    // await gooseDB.connect();
    // await gooseDB.createDB("TEST");
    // await gooseDB.dropDB('TEST');
    // const result = await gooseDB.query(sql, 0); // SELECT : 쿼리로 입력받고 translate 한거 그대로 넣어주면 됨
    // const result = await gooseDB.query([11, "new", "new", "new"], 1); // UPDATE : 쿼리로 입력받고 내부에서 VALUE를 배열로 넘겨줌
    // const spreadsheetId = await gooseDB.query("NEW-TEST2", 2); // CREATE_DB : 쿼리로 입력받고 내부에서 데이터베이스 이름만 입력받으면 됨
    // const result = await gooseDB.query(["c1", "c2", "c3", "c4"], 3); // CREATE TABLE AND COLUMN : 쿼리로 입력받고 테이블 명, 컬럼명 뽑아서 넣어주면 됨
    // console.log(result);
}
main();

module.exports.GooseDB = GooseDB;