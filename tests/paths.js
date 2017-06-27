const formatter = require("../code-utils").formatter;

module.exports = function (config) {
    this.config = config;

    function efClassFile(dbName, schema, subFolderName, className){
        const dbFolder = formatter.csClassName(dbName);
        const fileName = formatter.csClassName(className);
        return `${this.config.efDataFolder}/${dbFolder}/${schema}/${subFolderName}/${fileName}.cs`;
    }

    this.efTableClassFile = function (dbName, schema, className) {
        return efClassFile(dbName, schema, "Tables", className);
    };

    this.efStoredProcedureClassFile = function (dbName, schema, className) {
        return efClassFile(dbName, schema, "StoredProcedures", className);
    };

    this.efTableValueFunctionClassFile = function (dbName, schema, className) {
        return efClassFile(dbName, schema, "Functions", className);
    };

    this.efScalarFunctionClassFile = function (dbName, schema, className) {
        return efClassFile(dbName, schema, "ScalarFunctions", className);
    };

    return this;
}