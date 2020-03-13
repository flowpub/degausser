import {
  blacklist,
  trimBeginAndEnd,
  collapseWhitespace,
  phrasingConstructs,
} from './util.js'

export const degausser = parentNode => {
  // If there's no Node, just return
  if (!parentNode) {
    return null
  }

  // Tracking Entities
  const runs = []
  let text = []

  let haveEncounteredFirstCell = false

  let lastBreak = null
  const breakType = {
    NONE: 'none',
    SINGLE: 'single',
    DOUBLE: 'double',
  }
  const addBreak = double => {
    if (lastBreak === null) {
      // The only time it should be null is at the beginning of document
      return
    }

    if (double) {
      lastBreak = breakType.DOUBLE
    } else if (lastBreak !== breakType.DOUBLE) {
      lastBreak = breakType.SINGLE
    }
  }
  const processBreaks = () => {
    if (!lastBreak) {
      return
    }

    switch (lastBreak) {
      case breakType.SINGLE:
        runs.push('\n')
        break
      case breakType.DOUBLE:
        runs.push('\n\n')
        break
    }

    lastBreak = breakType.NONE
  }

  const processText = () => {
    if (text.length === 0) {
      return
    }

    // Trim
    const trimmed = trimBeginAndEnd(text.join(''))
    if (!trimmed) {
      // Trimmed into an empty string
      //  Preserve all preceding breaks
      text = []
      return
    }

    if (lastBreak === null) {
      lastBreak = breakType.NONE
    }

    runs.push(trimBeginAndEnd(collapseWhitespace(trimmed)))
    text = []
  }

  const processBlockConstruct = (tag, opening) => {
    if (phrasingConstructs.includes(tag)) {
      return
    }

    // Not a phrasing construct, therefore is Block

    if (tag === 'th' || tag === 'td') {
      // Special Block
      if (opening) {
        // I'm assuming the DOM will fix all table element malformations
        if (!haveEncounteredFirstCell) {
          haveEncounteredFirstCell = true
        } else {
          processBreaks()
          runs.push('\t')
        }
      } else {
        processText()
      }
      return
    }

    // Regular Blocks
    processText()

    if (tag === 'tr') {
      haveEncounteredFirstCell = false
    }

    if (tag === 'p') {
      addBreak(true)
    }

    addBreak(false)
  }

  const processTextNode = node => {
    const string = node.textContent.normalize()

    // Trim
    const trimmed = trimBeginAndEnd(string)
    if (trimmed) {
      processBreaks()
    }

    text.push(string)
  }
  const processElementNode = node => {
    const tag = node.tagName && node.tagName.toLowerCase()

    // Special case for Preformatted
    if (tag === 'pre') {
      processText()
      addBreak(false)
      processBreaks()

      runs.push(node.textContent)
      lastBreak = breakType.SINGLE
      return
    }

    processBlockConstruct(tag, true)

    if (node.hasChildNodes()) {
      node.childNodes.forEach(child => {
        processNode(child)
      })
    }

    // Process other tags
    switch (tag) {
      case 'br':
        processText()
        processBreaks()
        runs.push('\n')
        break
      case 'wbr':
        processBreaks()
        text.push('\u200B')
        break
    }

    if (node.hasAttribute('alt')) {
      processBreaks()
      text.push(` ${node.getAttribute('alt')} `)
    }

    processBlockConstruct(tag, false)
  }

  const processNode = node => {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        processTextNode(node)
        break
      case Node.ELEMENT_NODE:
        if (blacklist.includes(node.tagName.toLowerCase())) {
          return
        }
        processElementNode(node)
        break
      case Node.DOCUMENT_NODE:
      case Node.DOCUMENT_FRAGMENT_NODE:
        if (node.hasChildNodes()) {
          node.childNodes.forEach(child => {
            processNode(child)
          })
        }
        break
    }
  }

  processNode(parentNode)

  // Get any stragglers
  processText()

  return runs.join('')
}
