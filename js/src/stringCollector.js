import {
  autoBind,
  BreakType,
  trimBeginAndEnd,
  collapseWhitespace,
  phrasingConstructs,
  isElementBlacklisted,
  getAltText,
  elementCanHaveAltText,
} from './util'

export class StringCollector {
  constructor(options = {}) {
    this.runs = []
    this.text = []
    this.options = options

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
      this.lastBreak = BreakType.DOUBLE
    } else if (this.lastBreak !== BreakType.DOUBLE) {
      this.lastBreak = BreakType.SINGLE
    }
  }

  processBreaks() {
    if (!this.lastBreak) {
      return
    }

    switch (this.lastBreak) {
      case BreakType.SINGLE:
        this.runs.push('\n')
        break
      case BreakType.DOUBLE:
        this.runs.push('\n\n')
        break
    }

    this.lastBreak = BreakType.NONE
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
      this.lastBreak = BreakType.NONE
    }

    this.runs.push(trimBeginAndEnd(collapseWhitespace(trimmed)))
    this.text = []
  }

  processElementNode(node, isOpening) {
    if (
      isElementBlacklisted(
        node,
        this.options.classBlacklist,
        this.options.elementBlacklist,
        this.options.idBlacklist,
      )
    ) {
      return true
    }

    const tag = node.tagName.toLowerCase()

    // Special case for Preformatted
    if (tag === 'pre') {
      this.processText()
      this.addBreak(false)
      this.processBreaks()

      this.runs.push(node.textContent)
      this.lastBreak = BreakType.SINGLE

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

    if (elementCanHaveAltText(node.tagName)) {
      this.processBreaks()

      const altText = getAltText(
        node,
        this.options.placeholderString,
        this.options.placeholderCopies
      )
      this.text.push(` ${altText} `)

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
