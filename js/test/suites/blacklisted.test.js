import { degausser } from '../../src/degausser'
import { getInputFile } from '../util'

describe(`Testing Containers`, () => {
  const file = getInputFile('blacklisted.json')

  file.forEach((element) => {
    test(`Testing ${element.i}`, () => {
      document.documentElement.innerHTML = element.i

      const blacklistOptions = {
        classBlacklist: ['blacklisted2'],
        idBlacklist: ['blacklisted'],
        elementBlacklist: ['strong'],
      }

      const output = degausser(document.documentElement, blacklistOptions)
      expect(output).toBe(element.o)

      const map = degausser(document.documentElement, {
        map: true,
        ...blacklistOptions,
      })
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
