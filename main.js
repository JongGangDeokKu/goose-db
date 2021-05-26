const {google} = require('googleapis');
const keys = require('./keys.json');
const readline = require('readline');
const fs = require('fs');

main();

// Test main.js
function main() {
    const client = setClient(keys);
    client.authorize(async function(err, tokens){
        if(err) {
            console.log(err);
            return;
        }
        else {
            let table_name = "TEST_TABLE";
            CREATE_TABLE(client, sheet_id, table_name);
        }
    });
}

async function initEmail() {
    let email = null;
    email = await new Promise((resolve) => {
        let email_re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        let rl = readline.createInterface({
            input: process.stdin,
            output:process.stdout
        });
        console.log("Input your e-mail address");
        rl.setPrompt('> ');
        rl.prompt();
        rl.on('line', (line) => {
            if (email_re.test(line)) {
                console.log("Get Correct e-mail");
                resolve(line);
                const data = JSON.parse(fs.readFileSync('keys.json'));
                data.editor_email = [line];
                fs.writeFileSync('keys.json', JSON.stringify(data));
                rl.close();
            }
            else {
                console.log("ERR:: Not e-mail regular expression\nPlease input again!");
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
        ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
    );
    return client;
}

function FROM(table_name) {
    const table_info = {
        spreadsheetId: sheet_id,
        range: table_name
    };
    return table_info;
}

async function SELECT(client_user, table_name) {
    const api = google.sheets({version: 'v4', auth: client_user});
    const request = FROM(table_name);

    let res = await api.spreadsheets.values.get(request);
    console.log(res.data.values);
}

async function ADD_COLUMN(client_user, sheet_id) {
    const api = google.sheets({version: 'v4', auth: client_user});

    new_column = [['ADD COLUMN', 'ADD COLUMN', 'ADD COLUMN']]

    const request = {
        spreadsheetId: sheet_id,
        range: 'TestTable!C1',
        valueInputOption: 'USER_ENTERED',
        resource: {values: new_column}
    };

    let res = await api.spreadsheets.values.update(request);
    console.log(res);
}

async function CREATE_TABLE(client_user, sheet_id, table_name) {
    const api = google.sheets({ version: 'v4', auth: client_user });

    const request = {
        spreadsheetId: sheet_id,
        requestBody: {
            requests: [{
                addSheet: {
                    properties: {
                        title: table_name
                    }
                }
            }]
        }
    };

    const res = await api.spreadsheets.batchUpdate(request);
    console.log(res);
}

async function CREATE_DATABASE(client_user, db_name) {
    const api = google.sheets({ version: 'v4', auth: client_user });

    const request = {
        resource: {
            properties: {
                title: db_name
            }
        }
    }

    if (keys.hasOwnProperty('editor_email')){
        console.log("You can access in " + keys.editor_email);
    }
    else await initEmail();

    const res_ss = await api.spreadsheets.create(request);
    const fileId = res_ss.data.spreadsheetId;

    // Give permission
    drive = google.drive({ version: "v3", auth: client_user });
    keys.editor_email.forEach(async function(email) {
        const res_drive = await drive.permissions.create({
            resource: {
                type: "user",
                role: "writer",
                emailAddress: email
            },
            fileId: fileId,
            fields: "id",
        });
    });

    console.log("You can access sheet : https://docs.google.com/spreadsheets/d/" + fileId + "/edit")
    return res_ss.data.spreadsheetId;
}