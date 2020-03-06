const fs = require("fs");

const getInputFile = fileName => {
    try {
        return JSON.parse(
            fs.readFileSync(`tests/testdata/${fileName}`).toString()
        );
    } catch (e) {
        console.error(`Cannot read file ${fileName}`);
        throw new Error();
    }
};

module.exports = {
    getInputFile
};
