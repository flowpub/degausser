const degausser = require("../../src/degausser");
const { getInputFile } = require("../util");

describe(`Testing Paragraphs`, () => {
    const file = getInputFile("paragraphs.json");

    file.forEach(element => {
        test(`Testing ${element.i}`, () => {
            document.documentElement.innerHTML = element.i;

            expect(degausser(document.documentElement)).toBe(element.o);
        });
    });
});
