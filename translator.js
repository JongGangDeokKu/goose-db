const { Parse } = require("./parser");

// ---------------------------- AST ------------------------------------------
const selectast = Parse("SELECT * FROM student");
const selectast2 = Parse("SELECT * FROM student WHERE A.A = 1");
const selectast3 = Parse("SELECT * FROM student WHERE (SELECT A FROM B WHERE (SELECT B FROM C))")
const insertast = Parse("insert into usertbl (a,b,c) values ('db2', '010-1234-5678', '감기')");
const createast = Parse('CREATE DATABASE Hotel');
const createast2 = Parse("CREATE TABLE Test (ID INT, Name VARCHAR(30), ReserveDate DATE,RoomNum INT NOT NULL)");
const dropast = Parse('drop table a');
const deleteast = Parse("DELETE FROM Reservation as A WHERE A.A = B.B")
const deleteast2 = Parse('DELETE FROM Reservation as A WHERE SELECT A FROM B')
const updateast = Parse("UPDATE Reservation SET RoomNum = 2002 WHERE Name = '홍길동'")
const unionast = Parse("SELECT Name FROM Reservation UNION ALL SELECT Name FROM Customer")
const unionast2 = Parse("SELECT Name FROM Reservation UNION SELECT Name FROM Customer")
const existast = Parse("SELECT A FROM B WHERE EXIST (A.A = 1)")
const existast2 = Parse("UPDATE Reservation SET RoomNum = 2002 WHERE EXIST (Name = '홍길동')")
const existast3 = Parse("DELETE FROM Reservation as A WHERE EXISTS (SELECT A FROM B)")
console.log("SELECT * FROM student".split(' '))
// ---------------------------- AST ARRAY -------------------------------------
const CREATEAST_ARRAY = [createast, createast2];
const SELECTAST_ARRAY = [selectast, selectast2, selectast3];
const INSERTAST_ARRAY = [insertast];
const DROPAST_ARRAY = [dropast];
const DELETEAST_ARRAY = [deleteast, deleteast2];
const UPDATEAST_ARRAY = [updateast];
const UNIONAST_ARRAY = [unionast, unionast2];
const EXISTAST_ARRAY = [existast, existast2, existast3];
const FROMAST_ARRAY = [selectast, unionast];
const WHEREAST_ARRAY = [selectast2, deleteast, updateast];
const SETAST_ARRAY = [updateast]


// ------------------------------AST TYPE --------------------------------------

class Translator {

    select_where(ast) {
        var ss_ast;
        if (ast == null) {
            return;
        }
        else if (ast.type == 'select') {
            var where_select = ast.type;
            var where_distinct = ast.distinct;
            var where_colunms = ast.columns;
            var where_from = ast.from[0];
            ss_ast = {
                type: 'select_value',
                distinct: where_distinct,
                columns: where_colunms,
                from: where_from,
                where: this.select_where(ast.where),
            }
            return ss_ast;
        }
    }
    insert(ast) {
        var columns = ast.columns;
        var values = ast.values[0].value;
        if (values.length > columns.length) {
            console.log('err');
            return false;
        }

        var ss_ast = {
            function: 'insert_row',
            table: ast.table[0].table,
            columns: columns,
            values: values,
        }
        return ss_ast
    }
    create(ast) {
        switch (ast.keyword) {
            case 'database':
                const database = ast.database;
                var ss_ast = {
                    function: 'create_database',
                    db_name: database,
                }
                return ss_ast

            case 'table':
                console.log("complete");
                // console.log(ast);
                var columns = [];
                for (var i in ast.create_definitions) {
                    columns.push({
                        "column": ast.create_definitions[i],
                        "type": ast.create_definitions[i].definition.dataType,
                        "check_null": ast.create_definitions[i].nullable,
                    })
                }
                var ss_ast = {
                    function: 'create_table',
                    table_name: ast.table[0].table,
                    columns: columns
                }
                return ss_ast
        }
    }
    select(ast) {
        var column;
        var where;
        if (ast.columns == '*') {
            column = '*'
        }
        else {
            column = [];
            for (var i = 0; i < ast.columns.length; i++) {
                column.push(ast.columns[i].expr.column)
            }
        }

        if (ast.where == null) {
            where = null;
        }
        else if (ast.where.type == 'binary_expr') {
            var a = [];
            if (ast.where.right.type != 'column_ref') {
                a = [ast.where.right.value]
            }
            else {
                a = [ast.where.right.table, ast.where.right.column]
            }
            where = {
                operator: ast.where.operator,
                left: [ast.where.left.table, ast.where.left.column],
                right: a
            }
        }
        else if (ast.where.type == 'function') {
            var value_exist = [];
            for (var i = 0; i < ast.where.args.value.length; i++) {
                value_exist.push({
                    "operator": ast.where.args.value[i].operator,
                    "left": [ast.where.args.value[i].left.table, ast.where.args.value[i].left.column],
                    "right": [ast.where.args.value[i].right.table, ast.where.args.value[i].right.column],
                });
            }
            where = {
                exist: true,
                values: value_exist
            }
        }
        else {
            where = this.select_where(ast.where)
        }
        let ss_ast = {
            function: 'select_value',
            columns: column,
            table: ast.from[0].table,
            where: where,
            orderby: null,
            groupby: null
        }
        if (ast._next != undefined) {
            let next_query = this.select(ast._next);
            ss_ast['next'] = next_query;
            ss_ast['union'] = ast.union
        }

        return ss_ast;
    }
    drop(ast) {
        let ss_ast = {
            function: 'drop_table',
            table_name: ast.name.table
        }
        return ss_ast
    }
    delete(ast) {
        var table = ast.table[0].table;
        var where;
        var from = ast.from[0].table;
        console.log(ast)
        if (ast.where == null) {
            where = null;
        }
        else if (ast.where.type == 'binary_expr') {
            var a = [];
            if (ast.where.right.type != 'column_ref') {
                a = [ast.where.right.value]
            }
            else {
                a = [ast.where.right.table, ast.where.right.column]
            }
            where = {
                operator: ast.where.operator,
                left: [ast.where.left.table, ast.where.left.column],
                right: a
            }
        }
        else if (ast.where.type == 'unary_expr') {
            let exist_ast = this.select_where(ast.where.expr.ast);
            console.log(exist_ast)
            where = {
                exist: true,
                ast : exist_ast
            }
        }
        else {
            where = this.select_where(ast.where)
        }
        let ss_ast = {
            function: 'delete_row',
            table: table,
            from: from,
            where: where,
        }
        return ss_ast
    }
    update(ast) {
        var table = ast.table[0].table;
        var set = []
        for (var i = 0; i < ast.set.length; i++) {
            set.push({
                "column ": ast.set[i].column,
                "value": ast.set[i].value.value
            })
        }
        var where;

        if (ast.where == null) {
            where = null;
        }
        else if (ast.where.type == 'binary_expr') {
            var a = [];
            if (ast.where.right.type != 'column_ref') {
                a = [ast.where.right.value]
            }
            else {
                a = [ast.where.right.table, ast.where.right.column]
            }
            where = {
                operator: ast.where.operator,
                left: [ast.where.left.table, ast.where.left.column],
                right: a
            }
        }
        else if (ast.where.type == 'function') {
            var value_exist = [];
            for (var i = 0; i < ast.where.args.value.length; i++) {
                value_exist.push({
                    "operator": ast.where.args.value[i].operator,
                    "left": [ast.where.args.value[i].left.table, ast.where.args.value[i].left.column],
                    "right": [ast.where.args.value[i].right.table, ast.where.args.value[i].right.column],
                });
            }
            where = {
                exist: true,
                values: value_exist
            }
        }
        else {
            where = this.select_where(ast.where)
        }
        let ss_ast = {
            function: 'update_table',
            table: table,
            set: set,
            where: where,
        }
        return ss_ast
    }
}

translator = new Translator();
console.log(translator.delete(existast3));

module.exports.Translator = Translator;