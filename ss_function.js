class GooseDB {
    constructor(google, key, sheetId) {
        this.google = google;
        this.key = key;
        this.sheetId = sheetId;
        this.client = null;
        this.connected = false;
    }
    async connect() {
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
        this.client.authorize((err, tokens) => {
            if (err) {
                console.log(err);
                return;
            } else {
                this.connected = true;
                console.log("Connect!");
            }
        });
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
    setSheetId(sheetId) {
        this.sheetId = sheetId;
    }
    async select(table, sql) {
        const selectQuery = [[`=QUERY(${table}!A1:N, "${sql}")`]];
        const updateRequest = {
            spreadsheetId: this.sheetId,
            range: "A1",
            valueInputOption: "USER_ENTERED",
            resource: { values: selectQuery },
        }
        const selectRequest = {
            spreadsheetId: this.sheetId,
            range: "A1:N",
        };
        const deleteRequest = {
            spreadsheetId: this.sheetId,
            range: "A1:N",
        };
        await this.api.spreadsheets.values.update(updateRequest);
        const res = await this.api.spreadsheets.values.get(selectRequest);
        await this.api.spreadsheets.values.clear(deleteRequest);
        return res.data.values;
    }
    async insert(table, data) {
        const request = {
            spreadsheetId: this.sheetId,
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
            console.log("Input your e-mail address");
            rl.setPrompt("> ");
            rl.prompt();
            rl.on("line", (line) => {
                if (email_re.test(line)) {
                    console.log("Get Correct e-mail");
                    resolve(line);
                    const data = JSON.parse(fs.readFileSync("key.json"));
                    data.editor_email = [line];
                    fs.writeFileSync("key.json", JSON.stringify(data));
                    rl.close();
                } else {
                    console.log(
                        "ERR:: Not e-mail regular expression\nPlease input again!"
                    );
                    rl.prompt();
                }
            });
        });
    }
    async addColumn(tableName, columns) {
        const request = {
            spreadsheetId: this.sheetId,
            range: `${tableName}!A1`,
            valueInputOption: "USER_ENTERED",
            resource:  {values: [columns] }
        }
        const res = await this.api.spreadsheets.values.update(request);
        return res;
    }
    async createTable(tableName, columns) {
        const request = {
            spreadsheetId: this.sheetId,
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
    async createDB(dbName) {
        const request = {
            resource: {
                properties: {
                    title: dbName
                }
            }
        };
        if (this.key.hasOwnProperty("editor_email")) {
            console.log("You can access in " + this.key.editor_email);
        } else initEmail();
        const res = await this.api.spreadsheets.create(request);
        const fileId = res.data.spreadsheetId;
        this.setSheetId(fileId);
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
        return fileId;
    }
}
/* */
const main = async () => {
    const { google } = require("googleapis");
    const key = require("./credentials.json");
    const gooseDB = new GooseDB(google, key, "10IS-ubZe0MAW7yMvQlZzZmoiQ5Amyapq2RE3azWWMqQ");
    const sql = "SELECT * WHERE A>0 AND D=1 ORDER BY C DESC";
    await gooseDB.connect();
    // const result = await gooseDB.query(sql, 0); // SELECT : 쿼리로 입력받고 translate 한거 그대로 넣어주면 됨
    // const result = await gooseDB.query([11, "new", "new", "new"], 1); // UPDATE : 쿼리로 입력받고 내부에서 VALUE를 배열로 넘겨줌
    // const sheetId = await gooseDB.query("NEW-TEST2", 2); // CREATE_DB : 쿼리로 입력받고 내부에서 데이터베이스 이름만 입력받으면 됨
    // const result = await gooseDB.query(["c1", "c2", "c3", "c4"], 3); // CREATE TABLE AND COLUMN : 쿼리로 입력받고 테이블 명, 컬럼명 뽑아서 넣어주면 됨
    // console.log(result);
}
main();