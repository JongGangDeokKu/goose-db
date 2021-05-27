const readline = require('readline');

async function command() {
    sql = await new Promise((resolve) => {
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.setPrompt('gooseDB > ');
        
        rl.prompt();
        rl.on('line', (line) => {
            if (line == 'c') {
                console.log("ERR:: Not SQL syntax!");
                rl.prompt();
            }
            else {
                console.log("your input: " + line);
                rl.close();
            }
        });
    });
    return command;
}

command();