const hypotext = require("../../src/hypotext");
const getInputFile = require('../util/getInputFile')

describe(`Testing Scripts`, () => {

    const file = getInputFile('scripts.json')

    file.forEach(element => {

        test(`Testing ${element.i}`, () => {

            document.documentElement.innerHTML = element.i

            expect(hypotext(document.documentElement)).toBe(element.o)

        })

    })
})