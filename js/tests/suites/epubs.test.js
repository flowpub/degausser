import { readdirSync, readFileSync, writeFileSync } from "fs";
import glob from "glob";
import { join, basename, dirname, extname } from "path";

import degausser from "../../src/degausser";

const pathToEpubs = "../testdata/parsed_epubs";
const epubs = readdirSync(pathToEpubs)
    .map(epub => join(pathToEpubs, epub));

epubs.forEach(epubDir => {
    test(`Testing EPUB: ${basename(epubDir)}`, () => {
        glob(`${epubDir}/**/*.{html,xhtml,htm}`, (er, files) => {
            for (const epubFile of files) {
                const sourceHTML = readFileSync(epubFile, "utf8");
                const txtFile = join(
                    dirname(epubFile),
                    basename(epubFile, extname(epubFile)) + ".txt"
                );
                const sourceTXT = readFileSync(txtFile, "utf8");

                const parser = new DOMParser();
                const encoding = extname(epubFile) === 'xhtml' ? "application/xhtml+xml" : 'text/html'
                let doc;
                try {
                    doc = parser.parseFromString(
                        sourceHTML,
                        encoding
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
                    writeFileSync(txtFile + ".out", output, "utf8");
                    expect(output).toBe(sourceTXT);
                }
            }
        });
    });
});

test.skip(`Testing Specific Page`, () => {
    const filename = "ch04";
    const txtFilePath = "../testdata/parsed_epubs/accessible_epub_3_test/EPUB";
    const sourceFilePath = "../testdata/epubs/accessible_epub_3/EPUB";

    const sourceTXT = readFileSync(
        join(txtFilePath, filename + ".txt"),
        "utf8"
    );

    const sourceHTML = readFileSync(
        join(sourceFilePath, filename + ".xhtml"),
        "utf8"
    );

    const parser = new DOMParser();
    let doc;
    try {
        doc = parser.parseFromString(sourceHTML, "application/xhtml+xml");
    } catch (error) {
        console.error(error);
    }

    const output = degausser(doc.documentElement);

    console.log(output)
});
