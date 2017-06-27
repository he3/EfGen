const codeUtils = require("../code-utils");
const formatter = codeUtils.formatter;

module.exports = function gen(config, proc) {

    let strProcIface = "int";
    if (proc.returnColumns && proc.returnColumns.length)
        strProcIface = "List<" + proc.name + "Output>";

    const strProcParms = [];
    const parms = proc.parameters.filter(p => p.ordinal).sort((a, b) => a.ordinal - b.ordinal);
    parms.forEach(parm => {
        let strProcParm = "";
        if (parm.parameterMode.toUpperCase() === "INOUT")
            strProcParm = "out ";
            
        strProcParms.push(strProcParm + formatter.csType(parm.dataType, true) + " " + parm.parameterName.replace("@", ""));
    });

    if (proc.returnColumns && proc.returnColumns.length)
        strProcParms.push("out int procResult");

    const code = new codeUtils.CodeBuilder();

    code.appendLine(0, "using System;");
    code.appendLine(0, "using System.Collections.Generic;");
    code.appendLine(0, "using System.Data;");
    code.appendLine(0, "using System.Data.SqlClient;");
    code.appendLine(0, "using System.Linq;");
    code.appendLine();
    code.appendLine(0, `namespace ${config.efDataNamespace}.${proc.database}.${proc.schema}`);
    code.appendLine(0, "{");
    code.appendLine(1, `public partial interface I${config.efDbContextName}`);
    code.appendLine(1, "{");
    code.appendLine(2, `${strProcIface} ${proc.name}(${strProcParms.join(", ")});`);
    code.appendLine(1, "}");
    code.appendLine();
    code.appendLine(1, `public partial class ${config.efDbContextName}`);
    code.appendLine(1, "{");
    code.appendLine(2, `public ${strProcIface} ${proc.name}(${strProcParms.join(", ")})`);
    code.appendLine(2, "{");

    parms.forEach(parm => {
        const parmName = parm.parameterName.replace("@", "");
        let parameterDirection = "Input";
        let size = "";
        if (parm.parameterMode.toUpperCase() === "INOUT") {
            parameterDirection = "Output";
            if ("string" == formatter.csType(parm.dataType, true))
                size = ", Size = " + parm.maxLength;
            if ("decimal" == parm.dataType)
                size = ", Precision = " + parm.precision + ", Scale = " + parm.scale;
        }
        let value = "";
        if (parameterDirection == "Input")
            value = ", Value = " + parmName + " ?? (object)DBNull.Value";

        code.appendLine(3, `var ${parmName}Param = new SqlParameter { ParameterName = "@${parmName}", SqlDbType = SqlDbType.${formatter.sqlDbType(parm.dataType)}, Direction = ParameterDirection.${parameterDirection}${value}${size} };`);
    });

    code.appendLine(3, `var procResultParam = new SqlParameter { ParameterName = "@procResult", SqlDbType = SqlDbType.Int, Direction = ParameterDirection.Output };`);

    code.appendLine();

    const sqlParmNames = parms.map(p => {
        return p.parameterName + (p.parameterMode.toUpperCase() === "INOUT" ? " OUTPUT" : "");
    });
    const csParmNames = parms.map(p => {
        return p.parameterName.replace("@", "") + "Param";
    });
    const procResultParamName = (csParmNames.length ? ", " : "") + "procResultParam";


    if (proc.returnColumns && proc.returnColumns.length) {
        code.appendLine(3, `var procResultData = Database.SqlQuery<${proc.name}Output>("EXEC @procResult = ${proc.name} ${sqlParmNames.join(", ")}", new object[]`);
        code.appendLine(3, "{");
        code.appendLine(4, csParmNames.join(", ") + procResultParamName);
        code.appendLine(3, "}).ToList();");
        code.appendLine();
        code.appendLine(3, "procResult = (int)procResultParam.Value;");
        code.appendLine(3, "return procResultData;");
    } else {
        code.appendLine(3, `Database.ExecuteSqlCommand("EXEC @procResult = ${proc.name} ${sqlParmNames.join(", ")}", new object[]`);
        code.appendLine(3, "{");
        code.appendLine(4, csParmNames.join(", ") + procResultParamName);
        code.appendLine(3, "});");

        const outParms = parms.filter(p => p.parameterMode.toUpperCase() === "INOUT");
        outParms.forEach(p => {
            const pName = p.parameterName.replace("@", "");
            const pType = formatter.csType(p.dataType, true);
            code.appendLine(3, `${pName} = ${pName}Param.Value as ${pType};`);
        });

        code.appendLine();
        code.appendLine(3, "return (int)procResultParam.Value;");
    }

    code.appendLine(2, "}");
    code.appendLine(1, "}");

    if (proc.returnColumns && proc.returnColumns.length) {
        code.appendLine();
        code.appendLine(1, `public class ${proc.name}Output`);
        code.appendLine(1, "{");

        proc.returnColumns.forEach(c => {
            const cType = formatter.csType(c.dataType, c.allowNull);
            code.appendLine(2, `public ${cType} ${c.name} {get; set;}`);
        });

        code.appendLine(1, "}");
    }

    code.appendLine(0, "}");

    return code.write();
};