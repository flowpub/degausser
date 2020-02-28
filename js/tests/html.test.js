const hypotext = require('../src/hypotext')
const fs = require('fs')

test('Read the file', () => {

    const file = fs.readFileSync('./tests/data/test.html')

    document.documentElement.innerHTML = file.toString()

    console.log(hypotext(document.documentElement))

})