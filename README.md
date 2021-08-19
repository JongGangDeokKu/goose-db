# GooseDB

![goosedb-logo](https://user-images.githubusercontent.com/46366411/130089712-a7258b59-5c7c-481c-9d4e-8f77836eca91.jpg)

[![NPM version](https://img.shields.io/npm/v/goose-db)](https://www.npmjs.com/package/goose-db)
![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

`goose-db` is google spreadsheet based database.

In the development of programs, databases are used to store data collected from multiple PCs. If a relatively small database is needed or conditions are met, a database server is established and used directly. In this case, problems such as management problems or maintenance costs of PCs used as servers occur. GooseDB uses SQL query statements to use Google Spreadsheet, which anyone can expect to build a free 15GB database provided by Google.

### Free 15GB database

If you have a google account, you can get 15GB free database because of default capacity of google drive storage, 15GB. The `goose-db` can use your google drive storage. So, you can get database storage as much as your google drive's empty space.

### User-friendly user interface

You can access the database as a google spreadsheet that is presented by excel form. So, you can read your data easily.

### SQL syntax

Database managers and database developers can use this library easily because this library supports `SQL syntax`. If you want to use `SQL syntax`, use the method, `query()`. If you need more information, read [Goose DB method reference](https://github.com/JongGangDeokKu/goose-db/blob/node-js/docs/methodreference.md).

## Dependencies 

| Name | Version | 
| ---- | ------- |
| [Git](https://git-scm.com/) | Latest |
| [npm](https://www.npmjs.com/) | Latest |
| [chalk](https://www.npmjs.com/package/chalk) | 4.1.1 |
| [figlet](https://www.npmjs.com/package/figlet) | 1.5.0 |
| [google-spreadsheet](https://www.npmjs.com/package/google-spreadsheet) | 2.0.7 |
| [googleapis](https://www.npmjs.com/package/googleapis) | 74.2.0 |
| [node-sql-parser](https://www.npmjs.com/package/node-sql-parser) | 3.5.0 |

## Setting for Google APIs

If you want more details for setting, access [here](https://coding-heyum.tistory.com/2).

First, You must have **google developer console project**.

You can access at [google console](https://console.cloud.google.com/).

And You have to enable apis. ([Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com/) and [Google Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com/))

If you want to full access, Select Role to Owner.

When you add credential to your project, you have to select **Web server, Application Data**, and you must have to key type, **JSON**.

And copy the key, `key.json` to this directory.


## Guides

You can install `goose-db` according to following command.

```
$ npm i goose-db
```

First, if you create one database and you want to use that database, you have to make gooseDB object like this. (Add spreadsheetId) If you want more details, read [Goose DB object reference](https://github.com/JongGangDeokKu/goose-db/blob/node-js/docs/objectreference.md).

``` js

const { google } = require("googleapis");

await gooseDB.connect(
        google,
        key,
        spreadsheetid
    );
```

SQL syntax guides (Not reflected yet)

## GooseDB References

- [Start GooseDB](https://github.com/JongGangDeokKu/goose-db/blob/node-js/docs/start.md)
- [GooseDB object reference](https://github.com/JongGangDeokKu/goose-db/blob/node-js/docs/objectreference.md)
- [GooseDB method reference](https://github.com/JongGangDeokKu/goose-db/blob/node-js/docs/methodreference.md)
- [GooseDB handling history reference](https://support.google.com/a/users/answer/9308971?hl=en)
