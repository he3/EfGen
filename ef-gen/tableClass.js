const codeUtils = require("../code-utils");
const formatter = codeUtils.formatter;

module.exports = function gen(config, table) {
    const code = new codeUtils.CodeBuilder();

    code.appendLine(0, "using System;");
    code.appendLine(0, "using System.Collections.Generic;");
    code.appendLine(0, "using System.ComponentModel.DataAnnotations.Schema;");
    code.appendLine(0, "using System.Data.Entity.ModelConfiguration;");
    code.appendLine();
    code.appendLine(0, `namespace ${config.efDataNamespace}.${table.database}.${table.schema}`);
    code.appendLine(0, "{");
    code.appendLine(1, `public class ${table.name}`);
    code.appendLine(1, "{");

    const orderedCols = table.columns.concat().sort((a, b) => a.ordinal - b.ordinal);
    orderedCols.forEach(column => {
        code.appendLine(2, `public ${formatter.csType(column.typeName, column.isNullable)} ${formatter.csColumnName(column.columnName)} { get; set; }`);
    });
    // TODO: Defaults!!!

    if (table.foreignKeys && table.foreignKeys.length) {
        code.appendLine();
        code.appendLine(2, "// Foreign Keys");

        table.foreignKeys.forEach(fk => {
            let propName = fk.pkTableName;

            const tableFks = table.foreignKeys.filter(k => k.pkTableName.toUpperCase() === fk.pkTableName.toUpperCase());
            if (tableFks.length > 1) {
                const orderedFkCols = fk.columns.concat().sort((a, b) => a.ordinal - b.ordinal);
                orderedFkCols.forEach(fkc => {
                    propName = `${propName}_${formatter.csColumnName(fkc.fkColumn.columnName)}`;
                });
            }

            if (propName.toUpperCase() === table.name.toUpperCase())
                propName = `${propName}1`;

            code.appendLine(2, `public virtual ${fk.pkTableName} ${propName} { get; set; } // ${fk.constraintName}`);
        });
    }



    if (table.reverseNavigations && table.reverseNavigations.length) {
        code.appendLine();
        code.appendLine(2, "// Reverse Navigation");

        table.reverseNavigations.forEach(rn => {
            let propName = `${rn.fkTableName}s`;

            const tableRns = table.reverseNavigations.filter(k => k.fkTableName.toUpperCase() === rn.fkTableName.toUpperCase());
            if (tableRns.length > 1) {
                const orderedRnCols = rn.columns.concat().sort((a, b) => a.ordinal - b.ordinal);
                orderedRnCols.forEach(rnc => {
                    propName = `${propName}_${formatter.csColumnName(rnc.fkColumn.columnName)}`;
                });
            }

            if (propName.toUpperCase() === table.name.toUpperCase())
                propName = `${propName}2`;

            switch (rn.relationship) {
                case "oneToOne":
                case "oneToMany":
                    code.appendLine(2, `public virtual ${rn.fkTableName} ${propName} { get; set; }`);
                    break;

                case "manyToOne":
                case "manyToMany":
                    code.appendLine(2, `public virtual ICollection<${rn.fkTableName}> ${propName} { get; set; }`);
                    break;

                default:
                    throw("Unknown Relationship:" + rn.relationship);
            }
        });
    }

    code.appendLine(1, "}"); // class

    // Configuration
    code.appendLine();
    code.appendLine(1, `internal class ${table.name}Configuration : EntityTypeConfiguration<${table.name}>`);
    code.appendLine(1, "{");

    code.appendLine(2, `public ${table.name}Configuration(string schema = "${table.schema}")`);
    code.appendLine(2, "{");
    code.appendLine(3, `ToTable(schema + ".${table.name}");`);

    if (table.primaryKeys && table.primaryKeys.length) {
        const keys = table.primaryKeys.concat().sort((a, b) => a.ordinal - b.ordinal).map(c => `x.${formatter.csColumnName(c.columnName)}`);
        code.appendLine(3, `HasKey(x => new { ${keys.join(", ")} });`);
    }
    code.appendLine();

    orderedCols.forEach(column => {
        const csColName = formatter.csColumnName(column.columnName);
        let colCode = `Property(x => x.${csColName}).HasColumnName("${csColName}")`;

        if (column.isNullable)
            colCode = colCode + ".IsOptional()";
        else
            colCode = colCode + ".IsRequired()";

        if (column.isFixedLength)
            colCode = colCode + ".IsFixedLength()";

        if (column.maxLength > 0)
            colCode = colCode + ".HasMaxLength(" + column.maxLength + ")";

        if (column.hasPrecisionAndScale)
            colCode = colCode + ".HasPrecision(" + column.precision + ", " + column.scale + ")";

        if (column.primaryKey) {
            if (column.isIdentity)
                colCode = colCode + ".HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity)";
            else
                colCode = colCode + ".HasDatabaseGeneratedOption(DatabaseGeneratedOption.None)";
        }

        if (column.isRowVersion)
            colCode = colCode + ".IsRowVersion()";

        code.appendLine(3, colCode + ";");
    });

    if (table.foreignKeys && table.foreignKeys.length) {
        code.appendLine();

        table.foreignKeys.forEach(fk => {
            const pkCol = fk.columns[0].pkColumn;
            const fkCol = fk.columns[0].fkColumn;
            const strPkCols = fk.columns.concat().sort((a, b) => a.ordinal - b.ordinal).map(c => `c.${formatter.csColumnName(c.fkColumn.columnName)}`);

            let hasType = "Many";
            if (pkCol.primaryKey)
                hasType = fkCol.isNullable ? "Optional" : "Required";

            let pkPropName = fk.pkTableName;
            let fkPropName = table.name + "s";

            const tablePks = table.foreignKeys.filter(k => k.pkTableName.toUpperCase() === fk.pkTableName.toUpperCase());
            if (tablePks.length > 1) {
                const orderedFkCols = fk.columns.concat().sort((a, b) => a.ordinal - b.ordinal);
                orderedFkCols.forEach(fkc => {
                    pkPropName = pkPropName + "_" + formatter.csColumnName(fkc.fkColumn.columnName);
                    fkPropName = fkPropName + "_" + formatter.csColumnName(fkc.fkColumn.columnName);
                });
            }

            if (pkPropName.toUpperCase() === table.name.toUpperCase())
                pkPropName = pkPropName + "1";
            if (fkPropName.toUpperCase() === table.name.toUpperCase())
                fkPropName = fkPropName + "2";

            let fkCode = `Has${hasType}(a => a.${pkPropName})`;

            switch (fk.relationship) {
                case "oneToOne":
                    fkCode = `${fkCode}.WithOptional(b => b.${fkPropName})`;
                    break;

                case "oneToMany":
                    fkCode = `${fkCode}.WithRequiredDependent(b => b.${fkPropName})`;
                    break;

                case "manyToOne":
                    fkCode = `${fkCode}.WithMany(b => b.${fkPropName}).HasForeignKey(c => c.${formatter.csColumnName(fkCol.columnName)})`;
                    break;

                case "manyToMany":
                    fkCode = `${fkCode}.WithMany(b => b.${fkPropName}).HasForeignKey(c => new { ${strPkCols.join(", ")} })`;
                    break;

                default:
                    throw("Unknown Relationship:" + fk.relationship);
            }

            code.appendLine(3, `${fkCode}; // ${fk.constraintName}`);
        });
    }

    code.appendLine(2, "}");

    code.appendLine(1, "}"); // internal class
    code.appendLine(0, "}"); // namespace

    return code.write();
};