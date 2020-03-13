import { degausser } from '../../src/degausser'
import { getInputFile } from '../util'

describe(`Testing Containers`, () => {
  const file = getInputFile('containers.json')

  file.forEach(element => {
    test(`Testing ${element.i}`, () => {
      document.documentElement.innerHTML = element.i

      expect(degausser(document.documentElement)).toBe(element.o)
    })
  })
})
