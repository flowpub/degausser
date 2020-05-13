import { degausser, mapWithDegausser } from '../../src/degausser'
import { getInputFile } from '../util'

describe(`Testing Map on Containers`, () => {
  const file = getInputFile('containers.json')

  file.forEach((element, index) => {
    test(`Testing ${index}`, () => {
      document.documentElement.innerHTML = element.i

      const map = mapWithDegausser(document.documentElement)
      const string = degausser(document.documentElement)

      for (const mapSection of map) {
        const sliced = string.slice(
          mapSection.start,
          mapSection.start + mapSection.length,
        )
        expect(sliced).toMatch(mapSection.content)
      }
    })
  })
})

describe(`Testing Map on Crazy`, () => {
  const file = getInputFile('crazy.json')

  file.forEach((element, index) => {
    test(`Testing ${index}`, () => {
      document.documentElement.innerHTML = element.i

      const map = mapWithDegausser(document.documentElement)
      const string = degausser(document.documentElement)

      for (const mapSection of map) {
        const sliced = string.slice(
          mapSection.start,
          mapSection.start + mapSection.length,
        )
        expect(sliced).toMatch(mapSection.content)
      }
    })
  })
})

describe(`Testing Map on images`, () => {
  const file = getInputFile('images.json')

  file.forEach((element, index) => {
    test(`Testing ${index}`, () => {
      document.documentElement.innerHTML = element.i

      const map = mapWithDegausser(document.documentElement)
      const string = degausser(document.documentElement)

      for (const mapSection of map) {
        const sliced = string.slice(
          mapSection.start,
          mapSection.start + mapSection.length,
        )
        expect(sliced).toMatch(mapSection.content)
      }
    })
  })
})

describe(`Testing Map on links`, () => {
  const file = getInputFile('links.json')

  file.forEach((element, index) => {
    test(`Testing ${index}`, () => {
      document.documentElement.innerHTML = element.i

      const map = mapWithDegausser(document.documentElement)
      const string = degausser(document.documentElement)

      for (const mapSection of map) {
        const sliced = string.slice(
          mapSection.start,
          mapSection.start + mapSection.length,
        )
        expect(sliced).toMatch(mapSection.content)
      }
    })
  })
})

describe(`Testing Map on Lists`, () => {
  const file = getInputFile('lists.json')

  file.forEach((element, index) => {
    test(`Testing ${index}`, () => {
      document.documentElement.innerHTML = element.i

      const map = mapWithDegausser(document.documentElement)
      const string = degausser(document.documentElement)

      for (const mapSection of map) {
        const sliced = string.slice(
          mapSection.start,
          mapSection.start + mapSection.length,
        )
        expect(sliced).toMatch(mapSection.content)
      }
    })
  })
})

describe(`Testing Map on Paragraphs`, () => {
  const file = getInputFile('paragraphs.json')

  file.forEach((element, index) => {
    test(`Testing ${index}`, () => {
      document.documentElement.innerHTML = element.i

      const map = mapWithDegausser(document.documentElement)
      const string = degausser(document.documentElement)

      for (const mapSection of map) {
        const sliced = string.slice(
          mapSection.start,
          mapSection.start + mapSection.length,
        )
        expect(sliced).toMatch(mapSection.content)
      }
    })
  })
})

describe(`Testing Map on Scripts`, () => {
  const file = getInputFile('scripts.json')

  file.forEach((element, index) => {
    test(`Testing ${index}`, () => {
      document.documentElement.innerHTML = element.i

      const map = mapWithDegausser(document.documentElement)
      const string = degausser(document.documentElement)

      for (const mapSection of map) {
        const sliced = string.slice(
          mapSection.start,
          mapSection.start + mapSection.length,
        )
        expect(sliced).toMatch(mapSection.content)
      }
    })
  })
})

describe(`Testing Map on Spans`, () => {
  const file = getInputFile('spans.json')

  file.forEach((element, index) => {
    test(`Testing ${index}`, () => {
      document.documentElement.innerHTML = element.i

      const map = mapWithDegausser(document.documentElement)
      const string = degausser(document.documentElement)

      for (const mapSection of map) {
        const sliced = string.slice(
          mapSection.start,
          mapSection.start + mapSection.length,
        )
        expect(sliced).toMatch(mapSection.content)
      }
    })
  })
})

describe(`Testing Map on Tables`, () => {
  const file = getInputFile('tables.json')

  file.forEach((element, index) => {
    test(`Testing ${index}`, () => {
      document.documentElement.innerHTML = element.i

      const map = mapWithDegausser(document.documentElement)
      const string = degausser(document.documentElement)

      for (const mapSection of map) {
        const sliced = string.slice(
          mapSection.start,
          mapSection.start + mapSection.length,
        )
        expect(sliced).toMatch(mapSection.content)
      }
    })
  })
})

describe(`Testing Map on Whitespaces`, () => {
  const file = getInputFile('whitespaces.json')

  file.forEach((element, index) => {
    test(`Testing ${index}`, () => {
      document.documentElement.innerHTML = element.i

      const map = mapWithDegausser(document.documentElement)
      const string = degausser(document.documentElement)

      for (const mapSection of map) {
        const sliced = string.slice(
          mapSection.start,
          mapSection.start + mapSection.length,
        )
        expect(sliced).toMatch(mapSection.content)
      }
    })
  })
})
