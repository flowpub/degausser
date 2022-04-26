import { StringCollector } from './stringCollector'
import { MapCollector } from './mapCollector'
import { walkDOM } from './domWalker'

const unitSeparatorCode = 31
export const degausser = (parentNode, options = {}) => {
  const defaultOptions = {
    placeholderCharacter: String.fromCharCode(unitSeparatorCode),
    placeholderLength: 100,
  }
  const finalOptions = Object.assign(defaultOptions, options)

  let collector = new StringCollector(finalOptions)

  if (finalOptions.map) {
    collector = new MapCollector(finalOptions)
  }

  return walkDOM(parentNode, collector)
}

export const getRangeFromOffset = (start, end, doc = document, map = null, options = {}) => {
  const docType = doc.nodeType
  if (
    docType !== Node.DOCUMENT_NODE &&
    docType !== Node.DOCUMENT_FRAGMENT_NODE
  ) {
    throw new Error('Bad Document Node')
  }

  if (map === null) {
    const defaultOptions = {
      placeholderCharacter: String.fromCharCode(unitSeparatorCode),
      placeholderLength: 100,
    }
    const finalOptions = Object.assign(defaultOptions, options)
    finalOptions.map = true
    map = degausser(doc, finalOptions)
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

        if (adjustedStart + skips - entry.node.length === 1){
          // space between the end of the node and the start of the next
          range.setStartAfter(entry.node)
        } else {
          range.setStart(entry.node, adjustedStart + skips)
        }
      }
    }

    if (end >= entry.start && end < entry.start + entry.length) {
      if (entry.node.nodeName === 'img') {
        range.setEndAfter(entry.node)
      } else {
        const adjustedEnd = end - entry.start

        let skips = 0
        for (const whitespaceEntry of entry.whitespace) {
          if (whitespaceEntry.after < adjustedEnd) {
            ++skips
          }
        }

        if (adjustedEnd + skips - entry.node.length === 1){
          // space between the end of the node and the start of the next
          range.setEndAfter(entry.node)
        } else {
          range.setEnd(entry.node, adjustedEnd + skips)
        }
      }
      break
    }
  }

  return range
}
