import { degausser } from '../../src/degausser'
import { getInputFile } from '../util'

describe(`Testing Crazy Shit`, () => {
  const file = getInputFile('crazy.json')

  file.forEach((element) => {
    test(`Testing ${element.i}`, () => {
      const domParser = new DOMParser()

      // for testing full xhtml docs
      // otherwise use inner html
      const doc = domParser.parseFromString(element.i, 'text/xml')
      const errorNode = doc.querySelector('parsererror');
      let documentElement
      if (errorNode) {
        // parsing failed
        document.documentElement.innerHTML = element.i
        documentElement = document.documentElement
      } else {
        // parsing succeeded
        documentElement = doc.documentElement
      }

      const output = degausser(documentElement)
      expect(output).toBe(element.o)

      const map = degausser(documentElement, { map: true })
      for (const mapSection of map) {
        const sliced = output.slice(
          mapSection.start,
          mapSection.start + mapSection.length,
        )
        expect(sliced).toMatch(mapSection.content)
      }
    })
  })
})
