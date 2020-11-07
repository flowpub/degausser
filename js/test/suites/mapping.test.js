import { degausser, getRangeFromOffset } from '../../src/degausser'
import { getInputFile, isCharCodeWhitespace } from '../util'

describe(`Testing Mapping`, () => {
  const file = getInputFile('mapping.json')

  test(`Testing ${file.i}`, () => {
    document.documentElement.innerHTML = file.i

    const output = degausser(document.documentElement)
    const mapping = degausser(document.documentElement, { map: true })

    for (const mapSection of mapping) {
      // Test whether the sliced string from total output is equal to map content
      const sliced = output.slice(
        mapSection.start,
        mapSection.start + mapSection.length,
      )
      expect(sliced).toMatch(mapSection.content)

      // Test whether whitespace map is correct
      const node = mapSection.node
      if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent

        for (let index = 0, outputIndex = 0; index < output.length; ++index) {
          if (mapSection.whitespace.includes(index)) {
            continue
          }

          const letter = output[outputIndex]
          if (isCharCodeWhitespace(letter.charCodeAt(0))) {
            expect(
              isCharCodeWhitespace(textContent[index].charCodeAt(0)),
            ).toBe(true)
          } else {
            expect(output[outputIndex]).toMatch(textContent[index])
          }

          ++outputIndex
        }
      }
    }
  })

  test(`Testing Range Get`, () => {
    document.documentElement.innerHTML = file.i

    const output = degausser(document.documentElement)
    const mapping = degausser(document.documentElement, { map: true })

    // Test getting proper range
    let range = getRangeFromOffset(35, 48, mapping)
    expect(range.toString()).toMatch(`our\n\t\t\tjob done.`)

    range = getRangeFromOffset(112, 125, mapping)
    expect(range.toString()).toMatch(`and\t\t\t\tdocumenta`)
  })
})
