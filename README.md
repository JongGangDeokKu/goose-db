# Goosedb

## 1. Setting for Google APIs

First, You must have **google developer console project**.

You can access at https://console.cloud.google.com/

And You have to enable apis. (google drive, google spreadsheet)

Google Drive API : https://console.cloud.google.com/apis/library/drive.googleapis.com/

Google Sheets API : https://console.cloud.google.com/apis/library/sheets.googleapis.com/

If you want to full access, Select Role to Owner.

When you add credential to your project, you have to select **Web server, Application Data**, and you must have to key type, **JSON**.

And copy the key and rename key to **keys.json**.


## 2. Guides

You can get this repository with this command.

```
$ git clone https://github.com/JongGangDeokKu/sql2google-ss.git
```

SQL syntax guides (Not reflected yet)

``` js
const express = require('express')
const GooseDB = require('GooseDB')
​
var connection = GooseDB.createConnection({
    GoogleEmail : 'whdgusdl97@gmail.com',
    token : 'token.json',
    keys : 'keys.json',
    database : 'speardSheet_ID'
})
​
connection.connect()
​
// SELECT
connection.query('SELECT * FROM A',function(err,result,fields){
    if (error) throw err;
    console.log('데이터베이스 값 출력,',result)
})
​
// WHERE
connection.query('SELECT * FROM A WHERE A.A = 1',function(err,result,fields){
    if (error) throw err;
    console.log('데이터베이스 쿼리 결과값 출력,',result)
})
​
// AND OR NOT
connection.query('SELECT * FROM A WHERE NOT A.A = 1 AND A.B = 2 OR A.C = 3',function(err,result,fields){
    if (error) throw err;
    console.log('데이터베이스 쿼리 결과값 출력,',result)
})
​
// ORDER BY
connection.query('SELECT * FROM A ORDER BY A.A DESC',function(err,result,fields){
    if (error) throw err;
    console.log('데이터베이스 쿼리 결과값 출력,',result)
})
​
// INSERT
connection.query('INSERT INTO A VALUES (?,?,?)',function(err,result,fields){
    if (error) throw err;
    console.log('데이터베이스 쿼리 결과값 출력,',result)
})
​
// UPDATE
connection.query('UPDATE A SET A.C = 4',function(err,result,fields){
    if (error) throw err;
    console.log('데이터베이스 쿼리 결과값 출력,',result)
})
​
// DELETE
connection.query('DELETE FROM A WHERE A.A = 1',function(err,result,fields){
    if (error) throw err;
    console.log('데이터베이스 쿼리 결과값 출력,',result)
})
​
// UPDATE
connection.query('UPDATE A SET A.C = 4',function(err,result,fields){
    if (error) throw err;
    console.log('데이터베이스 쿼리 결과값 출력,',result)
})
​
// UNION
connection.query('SELECT * FROM A WHERE A.A = 1 UNION ALL SELECT * FROM B WHERE B.A = 1',function(err,result,fields){
    if (error) throw err;
    console.log('데이터베이스 쿼리 결과값 출력,',result)
})
​
// EXIST
connection.query('SELECT * FROM A WHERE EXIST(SELECT A.A FROM A WHERE A.A=1',function(err,result,fields){
    if (error) throw err;
    console.log('데이터베이스 쿼리 결과값 출력,',result)
})
​
connection.end();
```
