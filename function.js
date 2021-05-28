const { google } = require("googleapis");
const key = require("./keys.json");
const readline = require("readline");
const fs = require("fs");
const sheet_id = "10IS-ubZe0MAW7yMvQlZzZmoiQ5Amyapq2RE3azWWMqQ";
main();
// Test main.js
function main() {
    const client = setClient(key);
    client.authorize(async function (err, tokens) {
        if (err) {
            console.log(err);
            return;
        } else {
            const dbName = "gooseDB-TEST";
            const table = "Sheet2";
            const query = "SELECT * WHERE A>0 AND D=1 ORDER BY C DESC";
            SELECT(client, sheet_id, table, query);
            // INSERT(client, sheet_id);
            //DELETE(client, sheet_id);
            // const sheetId = await CREATE_DATABASE(client, dbName);
            // SELECT(client, "Sheet2");
        }
    });
}
async function initEmail() {
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
function setClient(auth_key) {
    // google auth for JSON Web Token
    const client = new google.auth.JWT(
        auth_key.client_email,
        null,
        auth_key.private_key,
        [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive",
        ]
    );
    return client;
}
// function FROM(table_name) {
//     const table_info = {
//         spreadsheetId: sheet_id,
//         range: `${table_name}!A1:N`,
//     };
//     return table_info;
// }
// async function SELECT(client_user, table_name) {
//     const api = google.sheets({ version: "v4", auth: client_user });
//     const request = FROM(table_name);
//     let res = await api.spreadsheets.values.get(request);
//     console.log(res.data.values);
// }
async function SELECT(client_user, sheet_id, table, query) {
    const api = google.sheets({ version: "v4", auth: client_user });
    new_column = [[`=QUERY(${table}!A1:N, "${query}")`]];
    const getData = async () => {
        const updateRequest = {
            spreadsheetId: sheet_id,
            range: "A1",
            valueInputOption: "USER_ENTERED",
            resource: { values: new_column },
        };
        const selectRequest = {
            spreadsheetId: sheet_id,
            range: "A1:N",
        };
        const deleteRequest = {
            spreadsheetId: sheet_id,
            range: "A1:N",
        };
        await api.spreadsheets.values.update(updateRequest);
        const res = await api.spreadsheets.values.get(selectRequest);
        await api.spreadsheets.values.clear(deleteRequest);
        return res;
    };
    let res = await getData();
    console.log(res.data.values);
}
async function INSERT(client_user, sheet_id, data) {
    // data는 1차원 배열로 받을 것
    const api = google.sheets({ version: "v4", auth: client_user });
    const request = {
        spreadsheetId: sheet_id,
        range: "Sheet2!A1",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: {
            values: [data]
        }
    }
    let res = await api.spreadsheets.values.append(request);
    console.log(res);
}
async function DELETE(client_user, sheet_id) {
    const api = google.sheets({ version: "v4", auth: client_user });
    const request = {
        spreadsheetId: sheet_id,
    }
    let res = await api.spreadsheets.values.batchClearByDataFilter(request);
    console.log(res);
}
async function ADD_COLUMN(client_user, sheet_id) {
    const api = google.sheets({ version: "v4", auth: client_user });
    new_column = [["ADD COLUMN1", "ADD COLUMN2", "ADD COLUMN3"]];
    const request = {
        spreadsheetId: sheet_id,
        range: "!A1",
        valueInputOption: "USER_ENTERED",
        resource: { values: new_column },
    };
    let res = await api.spreadsheets.values.update(request);
    console.log(res);
}
async function CREATE_TABLE(client_user, sheet_id, table_name) {
    const api = google.sheets({ version: "v4", auth: client_user });
    const request = {
        spreadsheetId: sheet_id,
        requestBody: {
            requests: [
                {
                    addSheet: {
                        properties: {
                            title: table_name,
                        },
                    },
                },
            ],
        },
    };
    const res = await api.spreadsheets.batchUpdate(request);
    console.log(res);
}
async function CREATE_DATABASE(client_user, db_name) {
    const api = google.sheets({ version: "v4", auth: client_user });
    const request = {
        resource: {
            properties: {
                title: db_name,
            },
        },
    };
    if (key.hasOwnProperty("editor_email")) {
        console.log("You can access in " + key.editor_email);
    } else initEmail();
    const res_ss = await api.spreadsheets.create(request);
    const fileId = res_ss.data.spreadsheetId;
    // Give permission
    drive = google.drive({ version: "v3", auth: client_user });
    key.editor_email.forEach(async function (email) {
        res_drive = await drive.permissions.create({
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
    return res_ss.data.spreadsheetId;
}