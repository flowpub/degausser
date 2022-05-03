import { StringCollector } from './stringCollector'
import { MapCollector } from './mapCollector'
import { walkDOM } from './domWalker'
import { DOMParser } from '@xmldom/xmldom'
import { DOCUMENT_FRAGMENT_NODE, DOCUMENT_NODE } from './constants'

/**
 * 
 * @param {*} parentNode 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Node
 * @param {*} options 
 * @param {*} mimeType
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
 * @returns 
 */

export const degausser = (parentNode, options = {}, mimeType = 'text/html') => {
  let actualNode = parentNode

  if (typeof parentNode === 'string') {
    actualNode = new DOMParser().parseFromString(parentNode, mimeType)
  }

  let collector = new StringCollector(options)

  if (options.map) {
    collector = new MapCollector(options)
  }

  return walkDOM(actualNode, collector)
}

export const getRangeFromOffset = (start, end, doc = document, map = null) => {
  const docType = doc.nodeType
  if (
    docType !== DOCUMENT_NODE &&
    docType !== DOCUMENT_FRAGMENT_NODE
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
