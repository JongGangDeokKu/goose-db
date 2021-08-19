
# Goose DB object reference

``` js
const { google } = require("googleapis");

await gooseDB.connect(
        google,
        key,
        spreadsheetid
    );
```

`google` : The 'google' from dependency, googleapis.

`key` : The credential json key. ([reference](https://coding-heyum.tistory.com/2))

`spreadsheetid` : The google spreadsheet id. This parameter is optional. So if you don't have a spreadsheet id yet, you can leave a blank.