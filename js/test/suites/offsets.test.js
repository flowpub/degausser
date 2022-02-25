import { getRangeFromOffset } from '../../src/degausser'
import { readFileSync } from 'fs'
import { extname } from 'path'

describe('range from offset', () => {
  test('paragraph boundary', () => {
    const epubFile = './test/testdata/parsed_epubs/metamorphosis_test/OEBPS/chapter-001-chapter-i.html'
    const sourceHTML = readFileSync(epubFile, 'utf8')

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

      // test that out of bounds errors are not thrown
      const range = getRangeFromOffset(480, 490, doc)
      expect(range.toString()).toEqual(' “What’s h')
      const range2 = getRangeFromOffset(470, 480, doc)
      expect(range2.toString()).toEqual('e looked.')
    }
  })
})
