const { PrettiyPrinter } = require("./prettyprinter.js");

class Translator {
    constructor() {
        this.prettiyPrinter = new PrettiyPrinter();
    }

    select_where(ast) {
        var ss_ast;
        if (ast == null) {
            return;
        } else if (ast.type == "select") {
            var where_select = ast.type;
            var where_distinct = ast.distinct;
            var where_colunms = ast.columns;
            var where_from = ast.from[0];
            ss_ast = {
                type: "select_value",
                distinct: where_distinct,
                columns: where_colunms,
                from: where_from,
                where: this.select_where(ast.where),
            };
            return ss_ast;
        }
    }
    insert(ast, columnInfo) {
        var columns = ast.columns;
        var values = ast.values[0].value;
        if (values.length > columns.length) {
            console.log("err");
            return false;
        }

        const newValues = [];
        const v = new Object();

        for (let i = 0; i < columns.length; i++) {
            v[columns[i]] = values[i].value;
        }

        for (const key in columnInfo) {
            if (columns.includes(key)) {
                newValues.push(v[key]);
            } else {
                newValues.push("NULL");
            }
        }

        var ss_ast = {
            function: "insert_row",
            table: ast.table[0].table,
            columns: columns,
            values: newValues,
        };
        return ss_ast;
    }
    create(ast) {
        switch (ast.keyword) {
            case "database":
                const database = ast.database;

                var ss_ast = {
                    function: "create_database",
                    database_name: database,
                };
                return database;
            case "table":
                var columns = [];
                for (var i in ast.create_definitions) {
                    columns.push({
                        column: ast.create_definitions[i],
                        type: ast.create_definitions[i].definition.dataType,
                        check_null: ast.create_definitions[i].nullable,
                    });
                }
                var ss_ast = {
                    function: "create_table",
                    table_name: ast.table[0].table,
                    columns: columns,
                };

                const result = this.prettiyPrinter.createTable(ss_ast);
                return result;
        }
    }
    select(ast) {
        var column;
        var where;
        if (ast.columns == "*") {
            column = "*";
        } else {
            column = [];
            for (var i = 0; i < ast.columns.length; i++) {
                column.push(ast.columns[i].expr.column);
            }
        }

        if (ast.where == null) {
            where = null;
        } else if (ast.where.type == "binary_expr") {
            var a = [];
            if (ast.where.right.type != "column_ref") {
                a = [ast.where.right.value];
            } else {
                a = [ast.where.right.table, ast.where.right.column];
            }
            where = {
                operator: ast.where.operator,
                left: [ast.where.left.table, ast.where.left.column],
                right: a,
            };
        } else if (ast.where.type == "function") {
            var value_exist = [];
            for (var i = 0; i < ast.where.args.value.length; i++) {
                value_exist.push({
                    operator: ast.where.args.value[i].operator,
                    left: [
                        ast.where.args.value[i].left.table,
                        ast.where.args.value[i].left.column,
                    ],
                    right: [
                        ast.where.args.value[i].right.table,
                        ast.where.args.value[i].right.column,
                    ],
                });
            }
            where = {
                exist: true,
                values: value_exist,
            };
        } else {
            where = this.select_where(ast.where);
        }
        let ss_ast = {
            function: "select_value",
            columns: column,
            table: ast.from[0].table,
            where: where,
            orderby: null,
            groupby: null,
        };
        if (ast._next != undefined) {
            let next_query = this.select(ast._next);
            ss_ast["next"] = next_query;
            ss_ast["union"] = ast.union;
        }

        return ss_ast;
    }
    drop(ast) {
        let ss_ast = null;
        switch (ast.keyword) {
            case "database":
                ss_ast = {
                    function: 'drop_database',
                    db_name: ast.name.db
                }
                break;
            case "table":
                ss_ast = {
                    function: 'drop_table',
                    table_name: ast.name.table
                }
                break;
        }
        return ss_ast
    }
    delete(ast) {
        var table = ast.table[0].table;
        var where;
        var from = ast.from[0].table;
        if (ast.where == null) {
            where = null;
        } else if (ast.where.type == "binary_expr") {
            var a = [];
            if (ast.where.right.type != "column_ref") {
                a = [ast.where.right.value];
            } else {
                a = [ast.where.right.table, ast.where.right.column];
            }
            where = {
                operator: ast.where.operator,
                left: [ast.where.left.table, ast.where.left.column],
                right: a,
            };
        } else if (ast.where.type == "unary_expr") {
            let exist_ast = this.select_where(ast.where.expr.ast);
            where = {
                exist: true,
                ast: exist_ast,
            };
        } else {
            where = this.select_where(ast.where);
        }
        let ss_ast = {
            function: "delete_row",
            table: table,
            from: from,
            where: where,
        };
        return ss_ast;
    }
    update(ast) {
        var table = ast.table[0].table;
        var set = [];
        for (var i = 0; i < ast.set.length; i++) {
            set.push({
                "column ": ast.set[i].column,
                value: ast.set[i].value.value,
            });
        }
        var where;

        if (ast.where == null) {
            where = null;
        } else if (ast.where.type == "binary_expr") {
            var a = [];
            if (ast.where.right.type != "column_ref") {
                a = [ast.where.right.value];
            } else {
                a = [ast.where.right.table, ast.where.right.column];
            }
            where = {
                operator: ast.where.operator,
                left: [ast.where.left.table, ast.where.left.column],
                right: a,
            };
        } else if (ast.where.type == "function") {
            var value_exist = [];
            for (var i = 0; i < ast.where.args.value.length; i++) {
                value_exist.push({
                    operator: ast.where.args.value[i].operator,
                    left: [
                        ast.where.args.value[i].left.table,
                        ast.where.args.value[i].left.column,
                    ],
                    right: [
                        ast.where.args.value[i].right.table,
                        ast.where.args.value[i].right.column,
                    ],
                });
            }
            where = {
                exist: true,
                values: value_exist,
            };
        } else {
            where = this.select_where(ast.where);
        }
        let ss_ast = {
            function: "update_table",
            table: table,
            set: set,
            where: where,
        };
        return ss_ast;
    }
}

module.exports.Translator = Translator;
