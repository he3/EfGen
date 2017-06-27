const config = require("./efgen.json");
const dbConfig = config.databases[0];

const schemaReader = require("sql-schema-reader");
const efGen = require("../ef-gen")(config);
const paths = require("./paths.js")(config);
const writefile = require("writefile");

function sortString(a, b) {
    const _a = a.toLowerCase();
    const _b = b.toLowerCase();
    if (a < b)
        return -1;
    else if (a > b)
        return 1;
    else
        return 0;
}

async function go() {
    console.log("start");


    // Tables
    // console.log("Getting table names...");
    // const tableNames = await schemaReader.tableNames(dbConfig);
    // console.log("Get tables data...");
    // const tables = await schemaReader.tables(dbConfig, tableNames.map(tn => tn.name));
    // console.log("Sorting tables data...");
    // const sortedTables = tables.concat().sort((a, b) => sortString(a.name, b.name));
    // for (let t of sortedTables){
    //     try {
    //         await csTable(t);
    //     } catch (error) {
    //         console.log(error);
    //         throw("errored");
    //     }
    // }


    // Stored Procedures
    // console.log("Getting stored procedure names...");
    // const procNames = await schemaReader.storedProcedureNames(dbConfig);
    // console.log("Getting stored procedures data...");
    // const procs = await schemaReader.storedProcedures(dbConfig, procNames.map(n => n.name));
    // console.log("Sorting good procs data...");
    // const goodProcs = procs.filter(p => !p.schemaReadError).concat().sort((a, b)=>sortString(a.name, b.name));
    // for (let f of goodProcs){
    //     try {
    //         await csStoredProcedure(f);
    //     } catch (error) {
    //         console.log(error);
    //         throw("errored");
    //     }
    // }


    // Table Value Functions
    // console.log("Getting table value function names...");
    // const funcNames = await schemaReader.tableValueFunctionNames(dbConfig);
    // console.log("Getting table value functions data...");
    // const funcs = await schemaReader.tableValueFunctions(dbConfig, funcNames.map(n => n.name));
    // console.log("Sorting table value functions data...");
    // const sortedFuncs = funcs.concat().sort((a, b)=>sortString(a.name, b.name));
    // for (let f of sortedFuncs){
    //     try {
    //         await csTableValueFunction(f);
    //     } catch (error) {
    //         console.log(error);
    //         throw("errored");
    //     }
    // }


    // Scalar Functions
    // console.log("Getting scalar function names...");
    // const scalarNames = await schemaReader.scalarFunctionNames(dbConfig);
    // console.log("Getting scalar functions data...");
    // const scalars = await schemaReader.scalarFunctions(dbConfig, scalarNames.map(n => n.name));
    // console.log("Sorting scalar functions data...");
    // const sortedScalars = scalars.concat().sort((a, b) => sortString(a.name, b.name));
    // for (let f of sortedScalars) {
    //     try {
    //         await csScalarFunction(f);
    //     } catch (error) {
    //         console.log(error);
    //         throw ("errored");
    //     }
    // }


    console.log("done.");
}



async function csScalarFunction(specs) {
    console.log(`Generating scalar function ${specs.name}...`)
    let efClass = efGen.scalarFunctionClass(specs);
    let filePath = paths.efScalarFunctionClassFile(dbConfig.database, specs.schema, specs.name);
    await toFile(filePath, efClass);
}

async function csTableValueFunction(specs) {
    console.log(`Generating table value function ${specs.name}...`)
    let efClass = efGen.tableValueFunctionClass(specs);
    let filePath = paths.efTableValueFunctionClassFile(dbConfig.database, specs.schema, specs.name);
    await toFile(filePath, efClass);
}

async function csStoredProcedure(specs) {
    console.log(`Generating stored procedure ${specs.name}...`)
    let efClass = efGen.storedProcedureClass(specs);
    let filePath = paths.efStoredProcedureClassFile(dbConfig.database, specs.schema, specs.name);
    await toFile(filePath, efClass);
}

async function csTable(specs) {
    console.log(`Generating table ${specs.name}...`)
    let efClass = efGen.tableClass(specs);
    let filePath = paths.efTableClassFile(dbConfig.database, specs.schema, specs.name);
    await toFile(filePath, efClass);
}






async function toFile(filePath, content) {
    console.log(`Writing ${filePath}`);
    const val = (typeof content) == "string" ? content : JSON.stringify(content, null, "\t");
    return writefile(filePath, val);
}

try {

} catch (error) {
    console.log("ERROR");
    console.log(error);
    console.log("ERROR");
}
go();