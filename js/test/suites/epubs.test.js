import { readdirSync, readFileSync, writeFileSync } from 'fs'
import glob from 'glob'
import { join, basename, dirname, extname } from 'path'

import { degausser } from '../../src/degausser'

const pathToEpubs = '../testdata/parsed_epubs'
const epubs = readdirSync(pathToEpubs).map(epub => join(pathToEpubs, epub))

epubs.forEach(epubDir => {
  test(`Testing EPUB: ${basename(epubDir)}`, () => {
    glob(`${epubDir}/**/*.{html,xhtml,htm}`, (_, files) => {
      for (const epubFile of files) {
        const sourceHTML = readFileSync(epubFile, 'utf8')
        const txtFile = join(
          dirname(epubFile),
          basename(epubFile, extname(epubFile)) + '.txt',
        )
        const sourceTXT = readFileSync(txtFile, 'utf8')

        const parser = new DOMParser()
        const encoding =
          extname(epubFile) === 'xhtml' ? 'application/xhtml+xml' : 'text/html'
        let doc
        try {
          doc = parser.parseFromString(sourceHTML, encoding)
        } catch (error) {
          console.error(error)
        }
        expect(doc).toBeTruthy()
        if (doc) {
          const root = doc.documentElement
          expect(root).toBeTruthy()

          const output = degausser(doc.documentElement)
          expect(output).toBeTruthy()
          expect(output).toBe(sourceTXT)
        }
      }
    })
  })
})