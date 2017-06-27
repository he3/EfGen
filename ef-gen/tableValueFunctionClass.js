const codeUtils = require("../code-utils");
const formatter = codeUtils.formatter;

module.exports = function gen(config, func) {

    const strReturn = "List<" + func.name + "Output>";

    let parms = [];
    if (func.parameters && func.parameters.length)
        parms = func.parameters.concat().sort((a, b) => a.ordinal - b.ordinal);

    const csArgString = parms.map(p => formatter.csType(p.dataType, true) + " " + p.parameterName.replace("@", "")).join(", ");
    const csParmString = parms.map(p => p.parameterName.replace("@", "") + "Param").join(", ");
    const sqlParmString = parms.map(p => p.parameterName + (p.parameterMode.toUpperCase() === "INOUT" ? " OUTPUT" : "")).join(", ");


    const code = new codeUtils.CodeBuilder();

    code.appendLine(0, "using System;");
    code.appendLine(0, "using System.Collections.Generic;");
    code.appendLine(0, "using System.Data;");
    code.appendLine(0, "using System.Data.SqlClient;");
    code.appendLine(0, "using System.Linq;");
    code.appendLine();
    code.appendLine(0, `namespace ${config.efDataNamespace}.${func.database}.${func.schema}`);
    code.appendLine(0, "{");
    code.appendLine(1, `public partial interface I${config.efDbContextName}`);
    code.appendLine(1, "{");
    code.appendLine(2, `${strReturn} ${func.name}(${csArgString});`);
    code.appendLine(1, "}");
    code.appendLine();
    code.appendLine(1, `public partial class ${config.efDbContextName}`);
    code.appendLine(1, "{");
    code.appendLine(2, `public ${strReturn} ${func.name}(${csArgString})`);
    code.appendLine(2, "{");

    if (parms.length) {
        parms.forEach(parm => {
            const parmName = parm.parameterName.replace("@", "");
            const parmMod = ", Value = " + parmName + " ?? (object)DBNull.Value";
            const parmType = formatter.sqlDbType(parm.dataType);
            code.appendLine(3, `var ${parmName}Param = new SqlParameter { ParameterName = "@${parmName}", SqlDbType = SqlDbType.${parmType}, Direction = ParameterDirection.Input${parmMod} };`);
        });
        code.appendLine();
        code.appendLine(3, `return Database.SqlQuery<${func.name}Output>("select * from ${func.name}(${sqlParmString})", new object[]`);
        code.appendLine(3, "{");
        code.appendLine(4, `${csParmString}`);
        code.appendLine(3, "}).ToList();");
    } else {
        code.appendLine(3, `return Database.SqlQuery<${func.name}Output>("select * from ${func.name}()").ToList();`);
    }

    code.appendLine(2, "}");
    code.appendLine(1, "}");

    code.appendLine();
    code.appendLine(1, `public class ${func.name}Output`);
    code.appendLine(1, "{");

    if (func.returnColumns && func.returnColumns.length) {
        func.returnColumns.forEach(column => {
            const colType = formatter.csType(column.dataType, column.allowNull);
            const colName = formatter.csColumnName(column.name);
            code.appendLine(2, `public ${colType} ${colName} {get; set;}`);
        });
    }

    code.appendLine(1, "}");
    code.appendLine(0, "}");

    return code.write();
};