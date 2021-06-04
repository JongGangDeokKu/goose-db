const { Parser : NodeParser } = require('node-sql-parser');

class Parser {

    constructor() {
        this.parser = new NodeParser();
    }

    sqlify(syntax) {
        return this.parser.sqlify(syntax);
    }

    astify(syntax) {
    
        let commit_re = /commit(\s*)(;?)/i
        let rollback_re = /rollback(\s*)(;?)/i
        let drop_db_re = /drop(\s*)database(\s*)\w(;?)/i
        
        if (commit_re.test(syntax)){
            console.log('commit syntax is not yet.');
        }
        else if (rollback_re.test(syntax)) {
            console.log('rollback syntax is not yet.');
        }
        else if (drop_db_re.test(syntax)) {
            let db_name = (syntax.replace(/drop(\s*)database(\s*)/i, "")).replace(/(\s)/, "").replace(/;/, "");
            let sql_ast = {
                type: "drop",
                keyword: "database",
                name: {
                    db: db_name, table: null, as: null
                }
            }
            return sql_ast;
        }
        else {
            return this.parser.astify(syntax);
        }
    }

}


module.exports.Parser = Parser;