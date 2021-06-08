# Goosedb

## 1. Setting for Google APIs

If you want more details for setting, access [here](https://coding-heyum.tistory.com/2)

First, You must have **google developer console project**.

You can access at https://console.cloud.google.com/

And You have to enable apis. (google drive, google spreadsheet)

Google Drive API : https://console.cloud.google.com/apis/library/drive.googleapis.com/

Google Sheets API : https://console.cloud.google.com/apis/library/sheets.googleapis.com/

If you want to full access, Select Role to Owner.

When you add credential to your project, you have to select **Web server, Application Data**, and you must have to key type, **JSON**.

And copy the key, **credentials.json** to this directory.


## 2. Guides

You can get this repository with this command.

```
$ git clone https://github.com/JongGangDeokKu/sql2google-ss.git
$ npm i
```

You can execute test with this command.

```
$ node .
```

First, if you create one database and you want to use that database, you have to make gooseDB object like this. (Add spreadsheetId)

``` js
await gooseDB.connect(
        google,
        key,
        ~~~~~~~~ //spreadsheetid
    );
```

SQL syntax guides (Not reflected yet)
