const fs = require('fs')

const getInputFile = fileName => {
  try {
    return JSON.parse(fs.readFileSync(`test/testdata/${fileName}`).toString())
  } catch (e) {
    console.error(`Cannot read file ${fileName}`)
    throw new Error()
  }
}

const whitespaces = [9, 10, 13, 32]
const isCharCodeWhitespace = (charCode) => {
  return whitespaces.includes(charCode)
}

module.exports = {
  getInputFile,
  isCharCodeWhitespace
}
