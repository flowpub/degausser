import { degausser } from '../../src/degausser'
import { getInputFile } from '../util'

describe(`Testing Containers`, () => {
  const file = getInputFile('containers.json')

  file.forEach(element => {
    test(`Testing ${element.i}`, () => {
      document.documentElement.innerHTML = element.i

      const output = degausser(document.documentElement)
      expect(output).toBe(element.o)

      const map = degausser(document.documentElement, {map: true})
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
