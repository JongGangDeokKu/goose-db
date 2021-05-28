const { Parser } = require('node-sql-parser');
// const { validate } = require('mysql-query-validator')
const parser = new Parser();

// ---------------------------- AST ------------------------------------------
const selectast = parser.astify("SELECT * FROM student");
const selectast2 = parser.astify("SELECT * FROM student WHERE A.A = 1");
const selectast3 = parser.astify("SELECT * FROM student WHERE (SELECT A FROM B WHERE (SELECT B FROM C))")
const insertast = parser.astify("insert into usertbl (a,b,c) values ('덕배 `바보` `똥개`', 2, 'db2', '010-1234-5678', '감기')");
const createast = parser.astify('CREATE DATABASE Hotel');
const createast2 = parser.astify("CREATE TABLE Test (ID INT, Name VARCHAR(30), ReserveDate DATE,RoomNum INT NOT NULL)");
const dropast = parser.astify('drop table a');
const deleteast = parser.astify("DELETE FROM Reservation as A WHERE A.A = B.B")
const deleteast2 = parser.astify('DELETE FROM Reservation as A WHERE SELECT A FROM B')
const updateast = parser.astify("UPDATE Reservation SET RoomNum = 2002 WHERE Name = '홍길동'")
const unionast = parser.astify("SELECT Name FROM Reservation UNION ALL SELECT Name FROM Customer")
const unionast2 = parser.astify("SELECT Name FROM Reservation UNION SELECT Name FROM Customer")
const existast = parser.astify("SELECT A FROM B WHERE EXIST (A.A = 1)")
const existast2 = parser.astify("UPDATE Reservation SET RoomNum = 2002 WHERE EXIST (Name = '홍길동')")
const existast3 = parser.astify("DELETE FROM Reservation as A WHERE EXISTS (SELECT A FROM B)")
// console.log("SELECT * FROM student".split(' '))
// ---------------------------- AST ARRAY -------------------------------------
const CREATEAST_ARRAY = [createast,createast2];
const SELECTAST_ARRAY = [selectast, selectast2,selectast3];
const INSERTAST_ARRAY = [insertast];
const DROPAST_ARRAY = [dropast];
const DELETEAST_ARRAY = [deleteast,deleteast2];
const UPDATEAST_ARRAY = [updateast];
const UNIONAST_ARRAY = [unionast,unionast2];
const EXISTAST_ARRAY = [existast,existast2,existast3];
const FROMAST_ARRAY = [selectast,unionast];
const WHEREAST_ARRAY = [selectast2,deleteast,updateast];
const SETAST_ARRAY = [updateast]


// ------------------------------AST TYPE --------------------------------------
let type_arr = []

function type_check(arr){
    for (var i = 0; i<arr.length ; i++){
        type_arr.push(arr[i].type)
    }
}
// CREATEAST_TYPE => type = create
type_check(CREATEAST_ARRAY);
// SELECTAST_TYPE => type = select
type_check(SELECTAST_ARRAY);
// INSERTAST_TYPE => type = insert
type_check(INSERTAST_ARRAY);
// DROPAST_TYPE => type = drop
type_check(DROPAST_ARRAY);
// DELETEAST_TYPE => type = delete
type_check(DELETEAST_ARRAY);
// UPDATEAST_TYPE => type = update
type_check(UPDATEAST_ARRAY);
// UNIONAST_TYPE => type = select
type_check(UNIONAST_ARRAY);
// DROPAST_TYPE => type = 
type_check(EXISTAST_ARRAY);
// DROPAST_TYPE => type = drop
type_check(FROMAST_ARRAY);
// DROPAST_TYPE => type = drop
type_check(WHEREAST_ARRAY);
// DROPAST_TYPE => type = drop
type_check(SETAST_ARRAY);

console.log(type_arr)

function select_where(ast){
    var ss_ast;
    if (ast == null){
        return ;
    }
    else if (ast.type == 'select'){
        var where_select = ast.type;
        var where_distinct = ast.distinct;
        var where_colunms = ast.columns;
        var where_from = ast.from[0];
        ss_ast = {
            select : where_select,
            distinct : where_distinct,
            columns : where_colunms,
            from : where_from,
            where : select_where(ast.where),
        }
        return ss_ast;
    }
}

console.log(select_where(selectast3));
class Translator{

    constructor(ast){
        this.ast = ast;
        this.type = ast.type;
    }

    transalating(){
        let columns, table,values, ss_ast;
        switch(this.type){
            case 'insert':
                values = this.ast.values[0].value;
                table = this.ast.table[0].table;
                columns = this.ast.columns;
                ss_ast = {
                    spreadsheetF : 'insertRow',
                    // 행 삽입하는 구글 스프레드 시트 api 함수 적용
                    db : 'spreadsheetID',
                    // SPRAEDSHEET 아이디 가져오기
                    table : table,
                    // 시트 테이블 가져오기
                    columns : columns,
                    // 쿼리내 컬럼과 테이블 컬럼 비교할 필요
                    values : values,
                    // VALUE값이 타입이 일치하는지 검사하기
                }
                return ss_ast
            case 'select':
                let distinct = this.ast.distinct;
                columns = this.ast.columns;
                table = this.ast.from[0].table;
                let where = this.ast.where;
                let groupby = this.ast.groupby;
                if (where == null){
                    ss_ast = {
                        spreadsheetF : 'search',
                        db : 'spreadsheetID',
                        table : table,
                        columns : columns,
                    }
                }
                else if (where.type == 'binary_exper'){
                    var operator = where.operator;
                    var left = where.left;
                    var right = where.right;
                    var left_info = [left.type,left.table,left.columns];
                    var right_info = [right.type, right.value];
                    ss_ast = {
                        spreadsheetF : 'search',
                        db : 'spreadsheetID',
                        table : table,
                        columns : columns,
                        where : 'binary',
                        where_info : {
                            left : left_info,
                            right : right_info,
                        }
                    }
                }
                // else if (where.type == 'select'){
                //     var where_distinct = where.distinct;
                //     var where_columns = where.columns;
                //     var where_from = where.from;
                //     var where_where = 
                // }
                

        }
        // return ss_ast;1
    }
}
// console.log(selectast3)
translator = new Translator(insertast)
// translator.transalating(this.ast)
 // mysql sql grammer parsed by default
