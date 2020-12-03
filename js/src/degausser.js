import { StringCollector } from './stringCollector'
import { MapCollector } from './mapCollector'
import { walkDOM } from './domWalker'

export const degausser = (parentNode, options = {}) => {
  let collector = new StringCollector()

  if (options.map) {
    collector = new MapCollector()
  }

  return walkDOM(parentNode, collector)
}

export const getRangeFromOffset = (
  start,
  end,
  doc = document,
  map = null,
) => {
  const docType = doc.nodeType
  if (
    docType !== Node.DOCUMENT_NODE &&
    docType !== Node.DOCUMENT_FRAGMENT_NODE
  ) {
    throw new Error('Bad Document Node')
  }

  if (map === null) {
    map = degausser(doc, { map: true })
  }

  const range = doc.createRange()

  for (let mapIndex = 0; mapIndex < map.length; ++mapIndex) {
    const entry = map[mapIndex]

    if (start >= entry.start && start < entry.start + entry.length) {
      if (entry.node.nodeName === 'img') {
        range.setStartBefore(entry.node)
      } else {
        const adjustedStart = start - entry.start

        let skips = 0
        for (const whitespaceEntry of entry.whitespace) {
          if (whitespaceEntry.after < adjustedStart) {
            ++skips
          }
        }

        range.setStart(entry.node, adjustedStart + skips)
      }
    }

    if (end >= entry.start && end < entry.start + entry.length) {
      if (entry.node.nodeName === 'img') {
        range.setEndAfter(entry.node)
      } else {
        const adjustedEnd = end - entry.start
        console.log('Adjusted End', adjustedEnd)

        let skips = 0
        for (const whitespaceEntry of entry.whitespace) {
          if (whitespaceEntry.after < adjustedEnd) {
            ++skips
          }
        }

        range.setEnd(entry.node, adjustedEnd + skips)
      }
      break
    }
  }

  return range
}
