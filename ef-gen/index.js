const tableClass = require("./tableClass.js");
const storedProcedureClass = require("./storedProcedureClass.js");
const tableValueFunctionClass = require("./tableValueFunctionClass.js");
const scalarFunctionClass = require("./scalarFunctionClass.js");

module.exports = function(config){
    this.config = config;
    
    this.tableClass = function(tableSpec){
        return tableClass(this.config, tableSpec);           
    };

    this.storedProcedureClass = function(storedProcedureSpec){
        return storedProcedureClass(this.config, storedProcedureSpec);           
    };

    this.tableValueFunctionClass = function(tableValueFunctionSpec){
        return tableValueFunctionClass(this.config, tableValueFunctionSpec);           
    };

    this.scalarFunctionClass = function(scalarFunctionSpec){
        return scalarFunctionClass(this.config, scalarFunctionSpec);           
    };

    return this;
};