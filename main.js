const {google} = require('googleapis');
const keys = require('./keys.json');

// google auth for JSON Web Token
const client = new google.auth.JWT(
    keys.client_email, 
    null, 
    keys.private_key, 
    ['https://www.googleapis.com/auth/spreadsheets']
);

client.authorize(function(err, tokens){
    if(err) {
        console.log(err);
        return;
    }
    else {
        console.log('Connected!');
        table_name = "TestTable";
        CREATE(client);
    }
});

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

async function CREATE(client_user) {
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