const hypotext = require("../../src/hypotext");
const getInputFile = require('../util/getInputFile')

describe(`Testing Whitespaces`, () => {

    const file = getInputFile('whitespaces.json')

    file.forEach(element => {

        test(`Testing ${element.i}`, () => {

            document.documentElement.innerHTML = element.i

            expect(hypotext(document.documentElement)).toBe(element.o)

        })

    })
})