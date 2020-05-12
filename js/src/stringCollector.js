import {
  autoBind,
  breakType,
  trimBeginAndEnd,
  collapseWhitespace,
  phrasingConstructs,
} from './util'

export class StringCollector {
  constructor() {
    this.runs = []
    this.text = []

    this.hasEncounteredFirstCell = false
    this.lastBreak = null

    autoBind.call(this)
  }

  addBreak(double) {
    if (this.lastBreak === null) {
      // The only time it should be null is at the beginning of document
      return
    }

    if (double) {
      this.lastBreak = breakType.DOUBLE
    } else if (this.lastBreak !== breakType.DOUBLE) {
      this.lastBreak = breakType.SINGLE
    }
  }

  processBreaks() {
    if (!this.lastBreak) {
      return
    }

    switch (this.lastBreak) {
      case breakType.SINGLE:
        this.runs.push('\n')
        break
      case breakType.DOUBLE:
        this.runs.push('\n\n')
        break
    }

    this.lastBreak = breakType.NONE
  }

  processText() {
    if (this.text.length === 0) {
      return
    }

    // Trim
    const trimmed = trimBeginAndEnd(this.text.join(''))
    if (!trimmed) {
      // Trimmed into an empty string
      //  Preserve all preceding breaks
      this.text = []
      return
    }

    if (this.lastBreak === null) {
      this.lastBreak = breakType.NONE
    }

    this.runs.push(trimBeginAndEnd(collapseWhitespace(trimmed)))
    this.text = []
  }

  processElementNode(node, isOpening) {
    const tag = node.tagName.toLowerCase()

    // Special case for Preformatted
    if (tag === 'pre') {
      this.processText()
      this.addBreak(false)
      this.processBreaks()

      this.runs.push(node.textContent)
      this.lastBreak = breakType.SINGLE

      return true
    }

    // Process other tags
    switch (tag) {
      case 'br':
        this.processText()
        this.processBreaks()
        this.runs.push('\n')

        return true
      case 'wbr':
        this.processBreaks()
        this.text.push('\u200B')

        return true
    }

    if (node.hasAttribute('alt')) {
      this.processBreaks()
      this.text.push(` ${node.getAttribute('alt')} `)

      return true
    }

    this.processBlockConstruct(tag, isOpening)

    return false
  }

  processBlockConstruct(tag, isOpening) {
    if (phrasingConstructs.includes(tag)) {
      // Do not process phrasing tags as block constructs
      return
    }

    if (tag === 'th' || tag === 'td') {
      // Special Block
      if (isOpening) {
        // I'm assuming the DOM will fix all table element malformations

        if (!this.hasEncounteredFirstCell) {
          this.hasEncounteredFirstCell = true
        } else {
          this.processBreaks()
          this.runs.push('\t')
        }
      } else {
        this.processText()
      }

      return
    }

    // Regular Block

    this.processText()

    if (tag === 'tr') {
      this.hasEncounteredFirstCell = false
    }

    if (tag === 'p') {
      this.addBreak(true)
    }

    this.addBreak(false)
  }

  processTextNode(node) {
    const string = node.textContent.normalize()

    // Trim
    const trimmed = trimBeginAndEnd(string)
    if (trimmed) {
      this.processBreaks()
    }

    this.text.push(string)
  }

  getResult() {
    // Get Stragglers
    this.processText()

    return this.runs.join('')
  }
}
