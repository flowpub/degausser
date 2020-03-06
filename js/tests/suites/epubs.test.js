const fs = require("fs");
const glob = require("glob");
const path = require("path");

const degausser = require("../../src/degausser");

const pathToEpubs = "../testdata/parsed_epubs";
const epubs = fs
    .readdirSync(pathToEpubs)
    .map(epub => path.join(pathToEpubs, epub));

epubs.forEach(epubDir => {
    test.skip(`Testing EPUB: ${path.basename(epubDir)}`, () => {
        glob(`${epubDir}/**/*.{html,xhtml,htm}`, (er, files) => {
            for (const epubFile of files) {
                const sourceHTML = fs.readFileSync(epubFile, "utf8");
                const txtFile = path.join(
                    path.dirname(epubFile),
                    path.basename(epubFile, path.extname(epubFile)) + ".txt"
                );
                const sourceTXT = fs.readFileSync(txtFile, "utf8");
                const parser = new DOMParser();
                let doc;
                try {
                    doc = parser.parseFromString(
                        sourceHTML,
                        "application/xhtml+xml"
                    );
                } catch (error) {
                    console.error(error);
                }
                expect(doc).toBeTruthy();
                if (doc) {
                    const root = doc.documentElement;
                    expect(root).toBeTruthy();

                    const output = degausser(doc.documentElement);
                    expect(output).toBeTruthy();
                    fs.writeFileSync(txtFile + ".out", output, "utf8");
                    expect(output).toBe(sourceTXT);
                }
            }
        });
    });
});
