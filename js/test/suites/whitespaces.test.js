import { degausser } from '../../src/degausser'
import { getInputFile } from '../util'

/*
  Note: For whatever reason, JSDoc strips leading spaces when
        a string is added to the document.
        
        When creating additional tests, please do not use leading spaces.
*/

describe(`Testing Whitespaces`, () => {
  const file = getInputFile('whitespaces.json')

  file.forEach((element) => {
    test(`Testing ${element.i}`, () => {
      document.documentElement.innerHTML = element.i

      const output = degausser(document.documentElement)
      expect(output).toBe(element.o)

      const map = degausser(document.documentElement, { map: true })
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
