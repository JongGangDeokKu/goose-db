# goose-db

[![NPM version](https://img.shields.io/npm/v/goose-db)](https://www.npmjs.com/package/goose-db)
![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

Goose-db is google spreadsheet based database.

In the development of programs, databases are used to store data collected from multiple PCs. If a relatively small database is needed or conditions are met, a database server is established and used directly. In this case, problems such as management problems or maintenance costs of PCs used as servers occur. GooseDB uses SQL query statements to use Google Spreadsheet, which anyone can expect to build a free 15GB database provided by Google.

## :memo: Dependencies 

| Name | Version | 
| ---- | ------- |
| [Git](https://git-scm.com/) | Latest |
| [npm](https://www.npmjs.com/) | Latest |
| [chalk](https://www.npmjs.com/package/chalk) | 4.1.1 |
| [figlet](https://www.npmjs.com/package/figlet) | 1.5.0 |
| [google-spreadsheet](https://www.npmjs.com/package/google-spreadsheet) | 2.0.7 |
| [googleapis](https://www.npmjs.com/package/googleapis) | 74.2.0 |
| [node-sql-parser](https://www.npmjs.com/package/node-sql-parser) | 3.5.0 |

## :large_orange_diamond: Setting for Google APIs

If you want more details for setting, access [here](https://coding-heyum.tistory.com/2)

First, You must have **google developer console project**.

You can access at https://console.cloud.google.com/

And You have to enable apis. (google drive, google spreadsheet)

Google Drive API : https://console.cloud.google.com/apis/library/drive.googleapis.com/

Google Sheets API : https://console.cloud.google.com/apis/library/sheets.googleapis.com/

If you want to full access, Select Role to Owner.

When you add credential to your project, you have to select **Web server, Application Data**, and you must have to key type, **JSON**.

And copy the key, **credentials.json** to this directory.


## :large_orange_diamond: Guides

You can get this repository with this command.

```
$ npm i goose-db
```

You can execute test with this command.

```
$ node .
```

First, if you create one database and you want to use that database, you have to make gooseDB object like this. (Add spreadsheetId)

``` js

const { google } = require("googleapis");

await gooseDB.connect(
        google,
        key,
        ~~~~~~~~ //spreadsheetid
    );
```

SQL syntax guides (Not reflected yet)
