const { asyncForEach, loadTestCases, degausser } = require("./util");

describe("textify!", () => {
  beforeAll(async () => {
    await page.goto("http://localhost:8080/degausser.html");
  });

  it("whitespaces", async () => {
    const testCases = await loadTestCases("whitespaces.json");
    await asyncForEach(testCases, async testCase => {
      expect(await degausser(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("paragraphs", async () => {
    const testCases = await loadTestCases("paragraphs.json");
    await asyncForEach(testCases, async testCase => {
      expect(await degausser(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("containers", async () => {
    const testCases = await loadTestCases("containers.json");
    await asyncForEach(testCases, async testCase => {
      expect(await degausser(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("spans", async () => {
    const testCases = await loadTestCases("spans.json");
    await asyncForEach(testCases, async testCase => {
      expect(await degausser(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("lists", async () => {
    const testCases = await loadTestCases("lists.json");
    await asyncForEach(testCases, async testCase => {
      expect(await degausser(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("tables", async () => {
    const testCases = await loadTestCases("tables.json");
    await asyncForEach(testCases, async testCase => {
      expect(await degausser(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("links", async () => {
    const testCases = await loadTestCases("links.json");
    await asyncForEach(testCases, async testCase => {
      expect(await degausser(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("images", async () => {
    const testCases = await loadTestCases("images.json");
    await asyncForEach(testCases, async testCase => {
      expect(await degausser(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("scripts", async () => {
    const testCases = await loadTestCases("scripts.json");
    await asyncForEach(testCases, async testCase => {
      expect(await degausser(page, testCase.i)).toBe(testCase.o);
    });
  });

  it("crazy", async () => {
    const testCases = await loadTestCases("crazy.json");
    await asyncForEach(testCases, async testCase => {
      expect(await degausser(page, testCase.i)).toBe(testCase.o);
    });
  });
});
