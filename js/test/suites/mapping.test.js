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

        for (
          let index = 0, outputIndex = 0;
          index < textContent.length;
          ++index
        ) {
          let skip = false
          for (let i = 0; i < mapSection.whitespace.length; ++i) {
            let entry = mapSection.whitespace[i]
            if (entry.position === index) {
              skip = true
              break
            }
            if (entry.after > index) {
              // Break early if the entry is for after this index
              break
            }
          }

          if (skip) {
            continue
          }

          if (isCharCodeWhitespace(textContent.charCodeAt(index))) {
            expect(isCharCodeWhitespace(output.charCodeAt(outputIndex))).toBe(
              true,
            )
            expect(isCharCodeWhitespace(textContent.charCodeAt(index))).toBe(
              true,
            )
          } else {
            expect(output.charAt(outputIndex)).toMatch(
              textContent.charAt(index),
            )
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
    let range = getRangeFromOffset(35, 48, document, mapping)
    expect(range.toString()).toMatch(`our\n\t\t\tjob done.`)

    range = getRangeFromOffset(112, 125, document, mapping)
    expect(range.toString()).toMatch(`and\t\t\t\tdocumenta`)
  })
})
