const fsPromises = require("fs").promises;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function loadTestCases(file) {
  const json = await fsPromises.readFile(`./testdata/${file}`, "utf8");
  return JSON.parse(json);
}

async function hypotext(page, input) {
  return await page.evaluate(async input => {
    return hypotext(input);
  }, input);
}

const validFileTypes = ["html", "htm", "xhtml"];

const isOfValidType = fileName => {
  const [name, extension] = fileName.split(".");

  return validFileTypes.includes(extension);
};

module.exports = {
  asyncForEach,
  loadTestCases,
  hypotext,
  isOfValidType,
  validFileTypes
};
