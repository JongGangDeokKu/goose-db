class PrettiyPrinter {
    constructor() {}

    createTable(ssAst) {
        const columns = ssAst.columns.map((column) => {
            return column.column.column.column;
        });

        return {
            tableName: ssAst.table_name,
            columns: columns,
        };
    }
}

module.exports.PrettiyPrinter = PrettiyPrinter;
