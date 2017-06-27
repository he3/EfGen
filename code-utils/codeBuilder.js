function CodeBuilder() {
    this._value = "";
}

function indent(level){
    return "\t".repeat(level);
}

CodeBuilder.prototype.append = function append(value){
    this._value += value;
};

CodeBuilder.prototype.appendLine = function appendLine(indentLevel, value) {
    if(indentLevel == undefined || indentLevel == null) {
        this._value += "\r\n";
        return;
    }
    this._value += indent(indentLevel) + value + "\r\n";
};

CodeBuilder.prototype.write = function write() {
    return this._value;
};


module.exports = CodeBuilder;