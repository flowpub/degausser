const hypotext = require("../src/hypotext");
const fs = require("fs");

const fileNames = fs.readdirSync("tests/testdata");

fileNames.forEach((fileName, index) => {
    describe(`Test category ${fileName}`, () => {
        const file = JSON.parse(
            fs.readFileSync(`tests/testdata/${fileName}`).toString()
        );

        file.forEach(element => {

            test(`Testing ${element.i}`, () => {

                document.documentElement.innerHTML = element.i

                expect(hypotext(document.documentElement)).toBe(element.o)

            })

        })
    });
});
