import { degausser } from '../../src/degausser'
import { getInputFile } from '../util'

describe(`Testing Crazy Shit`, () => {
    const file = getInputFile('xhtml.json')

    file.forEach((element) => {
        test(`Testing ${element.i}`, () => {
            const domParser = new DOMParser()

            // for testing full xhtml docs
            const doc = domParser.parseFromString(element.i, 'text/xml')
            const documentElement = doc.documentElement

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
