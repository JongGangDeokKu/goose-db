const readline = require('readline');
const chalk = require('chalk');
const figlet = require('figlet');
const { Parser } = require('node-sql-parser');

async function main() {
    sql = await new Promise(() => {
        console.log(
            chalk.cyanBright(
                figlet.textSync('Goose DB', { horizontalLayout: 'full' })
            )
        );
        command();
    });
}

function command() {
    let parser = new Parser();
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
                            console.log("complete");
                            console.log(ast);
                            const database = ast.database;
                            rl.close();
                            break;
                        case 'table':
                            console.log("complete");
                            // console.log(ast);
                            for (var i in ast.table) {
                                console.log(ast.table[i].table);
                            }
                            for (var i in ast.create_definitions) {
                                console.log(ast.create_definitions[i].column);
                                console.log(ast.create_definitions[i].definition);
                                console.log(ast.create_definitions[i].nullable);
                            }
                            rl.close();
                            break;
                    }
                    break;

                case 'select':
                    console.log("select!!!");
                    console.log(ast);
                    rl.close();
                    break;

                case 'drop':
                    console.log("drop!!!");
                    console.log(ast);
                    rl.close();
                    break;

                case 'delete':
                    console.log("delete!!!");
                    console.log(ast);
                    rl.close();
                    break;

                case 'update':
                    console.log("update!!!");
                    console.log(ast);
                    rl.close();
                    break;

                default:
                    rl.close();
                    console.log(ast);
                    break;
            }
        }
        catch (err) {
            console.log("ERR:: Syntax error / SQL\n");
            rl.close();
        }
        command();
    });
}

main();