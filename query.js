const parser = require('js-sql-parser');
​
const deleteFrom = (query) => {
    const ast = parser.parse(query);
​
    if (ast.value.from) {
        let tableArr = [];
        let query;
​
        let {
            value: {
                from: {
                    value: fromTables
                }
            }
        } = ast;
​
        fromTables.forEach(fromTable => {
            const {
                value: {
                    value: {
                        value
                    }
                }
            } = fromTable;
    
            tableArr.push(value);
        });
        delete ast.value.from;
        
        query = parser.stringify(ast);
​
        return {
            query,
            tableArr
        };
​
    } else {
        return parser.stringify(ast);
    }
}
​
/* 여기 deletefrom 인자에 FROM 포함된 SQL 쿼리문 넣으면 됨. */
const { query: deleteFromQuery, tableArr } = deleteFrom("SELECT * FROM TABLE1, TABLE2, TABLE3 WHERE B > 25 ORDER BY B DESC");
​
​
/* FROM 이후 입력한 테이블들이 출력 */ 
tableArr.forEach(table => {
    console.log(table);
})
​
​
/* 
    FROM이 제거된 쿼리가 deleteFromQuery 가 되는거고
    이를 SS에 적용하기 위해서 URI 인코딩 한 것이 encodeQuery
*/
const encodeQuery = encodeURIComponent(deleteFromQuery);
​
console.log(encodeQuery);