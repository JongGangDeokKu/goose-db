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
        SELECT(client);
    }
});

async function SELECT(client_user) {
    const google_spreadsheet_api = google.sheets({version: 'v4', auth: client_user});
    const request = {
        spreadsheetId: '1KUgNG3gqnihwT45KbmhSYYCjdJvotoOVNddbn8v127M',
        range: 'TestTable'  // == 'TestTable!A1:B5'
    };

    var res = await google_spreadsheet_api.spreadsheets.values.get(request);
    console.log(res.data.values);
}