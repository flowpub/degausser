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

describe("textify!", () => {
  beforeAll(async () => {
    await page.goto("http://localhost:8080/hypotext.html");
  });

  it("whitespaces", async () => {
    const testCases = await loadTestCases("whitespaces.json");
    await asyncForEach(testCases, async testCase => {
      expect(await hypotext(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("paragraphs", async () => {
    const testCases = await loadTestCases("paragraphs.json");
    await asyncForEach(testCases, async testCase => {
      expect(await hypotext(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("containers", async () => {
    const testCases = await loadTestCases("containers.json");
    await asyncForEach(testCases, async testCase => {
      expect(await hypotext(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("lists", async () => {
    const testCases = await loadTestCases("lists.json");
    await asyncForEach(testCases, async testCase => {
      expect(await hypotext(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("tables", async () => {
    const testCases = await loadTestCases("tables.json");
    await asyncForEach(testCases, async testCase => {
      expect(await hypotext(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("links", async () => {
    const testCases = await loadTestCases("links.json");
    await asyncForEach(testCases, async testCase => {
      expect(await hypotext(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("images", async () => {
    const testCases = await loadTestCases("images.json");
    await asyncForEach(testCases, async testCase => {
      expect(await hypotext(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("scripts", async () => {
    const testCases = await loadTestCases("scripts.json");
    await asyncForEach(testCases, async testCase => {
      expect(await hypotext(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("crazy", async () => {
    const testCases = await loadTestCases("crazy.json");
    await asyncForEach(testCases, async testCase => {
      expect(await hypotext(page, testCase.i)).toBe(testCase.o);
    });
  });
});
