const readline = require('readline');
const { Parser } = require('node-sql-parser');

async function command() {
    const parser = new Parser();
    sql = await new Promise((resolve) => {
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.setPrompt('gooseDB > ');

        rl.prompt();
        rl.on('line', (line) => {
            try {
                const ast = parser.astify(line);
                switch (ast.type) {
                    case 'create':
                        switch (ast.keyword) {
                            case 'database':
                                console.log(ast.database);
                                rl.close();
                                break;
                            case 'table':
                                console.log(ast);
                                rl.close();
                                break;
                        }
                        break;
                    default:
                        rl.close();
                        console.log(ast);
                        break;
                }
            }
            catch (err) {
                console.log("ERR:: Syntax error / SQL");
            }
            command();
        });
    });
}

command();