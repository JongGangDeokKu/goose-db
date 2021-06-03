const { Parser } = require('node-sql-parser');
const parser = new Parser();

function parse(syntax) {
    const parser = new Parser();
    return parser.astify(syntax);
}

module.exports.Parse = parse;