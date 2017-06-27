
function csType(typeName, isNullable) {
    let strCsType = "";
    switch (typeName.toLowerCase()) {
        case "bigint":
            strCsType = "long";
            break;
        case "float":
            strCsType = "double";
            break;
        case "money":
        case "decimal":
            strCsType = "decimal";
            break;
        case "bit":
            strCsType = "bool";
            break;
        case "int":
        case "int32":
            strCsType = "int";
            break;
        case "uniqueidentifier":
            strCsType = "Guid";
            break;
        case "nvarchar":
        case "varchar":
        case "varchar(max)":
        case "nvarchar(max)":
        case "nchar":
        case "char":
        case "string":
            strCsType = "string";
            break;
        case "date":
        case "datetime":
        case "datetime2":
        case "smalldatetime":
            strCsType = "DateTime";
            break;
        case "varbinary":
        case "varbinary(max)":
        case "timestamp":
        case "byte[]":
            strCsType = "byte[]";
            break;
        default:
            strCsType = typeName;
            break;
    }

    if (!!isNullable)
        if (strCsType !== "string" && strCsType !== "byte[]")
            strCsType = strCsType + "?";

    return strCsType;
}

function sqlDbType(typeName) {
    let strSqlDbType = "";
    switch (typeName.toLowerCase()) {
        case "bigint":
        case "long":
            strSqlDbType = "BigInt";
            break;
        case "int":
            strSqlDbType = "Int";
            break;
        case "bit":
            strSqlDbType = "Bit";
            break;
        case "money":
            strSqlDbType = "Money";
            break;
        case "decimal":
            strSqlDbType = "Decimal";
            break;
        case "uniqueidentifier":
            strSqlDbType = "UniqueIdentifier";
            break;
        case "nvarchar":
        case "nvarchar(max)":
            strSqlDbType = "NVarChar";
            break;
        case "varchar":
        case "varchar(max)":
            strSqlDbType = "VarChar";
            break;
        case "nchar":
            strSqlDbType = "NChar";
            break;
        case "char":
            strSqlDbType = "Char";
            break;
        case "datetime":
            strSqlDbType = "DateTime";
            break;
        case "datetime2":
            strSqlDbType = "DateTime2";
            break;
        case "timestamp":
            strSqlDbType = "Timestamp";
            break;
        case "date":
            strSqlDbType = "Date";
            break;
        case "smalldatetime":
            strSqlDbType = "SmallDateTime";
            break;
        case "varbinary":
        case "varbinary(max)":
            strSqlDbType = "VarBinary";
            break;
        case "float":
            strSqlDbType = "Float";
            break;
        default:
            strSqlDbType = typeName;
            break;
    }

    return strSqlDbType;
}

function csColumnName(columnName) {
    const reservedWords = ["namespace"];

    let outCol = columnName
        .replace(" ", "_")
        .replace("/", "_")
        .replace("&", "_")
        .replace("(", "_")
        .replace(")", "_")
        .replace("#", "Number");

    if (reservedWords.includes(outCol.toLowerCase()))
        outCol = outCol + "Value";

    return outCol;
}

function csParameterName(parameterName){
    const reservedWords = ["string"];

    let outCol = columnName
        .replace(" ", "_")
        .replace("/", "_")
        .replace("&", "_")
        .replace("(", "_")
        .replace(")", "_")
        .replace("#", "Number");

    if (reservedWords.includes(outCol.toLowerCase()))
        outCol = outCol + "Value";

    return outCol;
}

module.exports = {
    csClassName: val => val,
    csColumnName,
    csParameterName,
    csType,
    sqlDbType
};