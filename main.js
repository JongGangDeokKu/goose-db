const {google} = require('googleapis');
const keys = require('./keys.json');
const readline = require('readline');
let email = [];

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
            console.log('Connected!');
            await getEmail();
            // console.log(email);
            // table_name = "TestTable";
            // CREATE_DATABASE(client, email[0]);
            
        }
    });
}



async function getEmail() {
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
                email.push(line);
                console.log("Get Correct e-mail");
                rl.close();
                resolve(line);
            }
            else {
                console.log("ERR:: Not e-mail regular expression\nPlease input again!");
                rl.prompt();
            }
        });
        return email;
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
        spreadsheetId: '1KUgNG3gqnihwT45KbmhSYYCjdJvotoOVNddbn8v127M',
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

async function ADD_COLUMN(client_user) {
    const api = google.sheets({version: 'v4', auth: client_user});

    new_column = [['ADD COLUMN', 'ADD COLUMN', 'ADD COLUMN']]

    const request = {
        spreadsheetId: '1KUgNG3gqnihwT45KbmhSYYCjdJvotoOVNddbn8v127M',
        range: 'TestTable!C1',
        valueInputOption: 'USER_ENTERED',
        resource: {values: new_column}
    };

    let res = await api.spreadsheets.values.update(request);
    console.log(res);
}

async function CREATE_TABLE(client_user) {
    const api = google.sheets({ version: 'v4', auth: client_user });

    const request = {
        spreadsheetId: '1KUgNG3gqnihwT45KbmhSYYCjdJvotoOVNddbn8v127M',
        requestBody: {
            requests: [{
                addSheet: {
                    properties: {
                        title: "NewTable"
                    }
                }
            }]
        }
    };

    const res = await api.spreadsheets.batchUpdate(request);
    console.log(res);
}

async function CREATE_DATABASE(client_user, user_email) {
    const api = google.sheets({ version: 'v4', auth: client_user });

    const request = {
        resource: {
            properties: {
                title: "NewDatabase"
            }
        }
    }

    const res_ss = await api.spreadsheets.create(request);
    console.log(res_ss.data.spreadsheetId);

    const fileId = res_ss.data.spreadsheetId;
    drive = google.drive({ version: "v3", auth: client });
    const res_drive = await drive.permissions.create({
        resource: {
            type: "user",
            role: "writer",
            emailAddress: user_email,  // Please set the email address you want to give the permission.
        },
        fileId: fileId,
        fields: "id",
    });

    console.log(res_drive);
    return res_ss.data.spreadsheetId;
}