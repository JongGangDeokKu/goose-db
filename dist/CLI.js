const readline = require('readline');
const { google } = require("googleapis");
const { GooseDB } = require("../gooseDB.js");

const connect = "connect";
const configDB = "config -db";

class CLI {
    constructor() {
        this.gooseDB = new GooseDB();

        this.command();
    }

    makePrompt(text) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.setPrompt(text);
        rl.prompt();

        return rl;
    }

    command() {
        const cmd = this.makePrompt('gooseDB > ');

        cmd.on('line', (line) => {
            try {
                cmd.close();
                this.query(line);
            } catch (e) {
                console.log(e);
            }
        });
    }

    async query(sql) {
        if (sql === connect) {
            let rl;
            let keyPath = "";
            let spreadsheetId = "";

            rl = this.makePrompt("key path : ");

            rl.on('line', (line) => {
                keyPath = line;
                rl.close();

                rl = this.makePrompt("spreadsheet id : ");

                rl.on('line', async (line) => {
                    spreadsheetId = line;
                    rl.close();

                    await this.gooseDB.connect(google, keyPath, spreadsheetId);
                    this.command();
                })
            });
        } else if (sql === configDB) {
            const rl = this.makePrompt("spreadsheet id : ");
            rl.on('line', line => {
                this.gooseDB.setSpreadsheetId(line);
                rl.close();
                this.command();
            })
        } else {
            await this.gooseDB.query(sql);
            this.command();
        }
    }
}

new CLI();