import {
  autoBind,
  BreakType,
  trimBeginAndEnd,
  collapseWhitespace,
  phrasingConstructs,
} from './util'

const MapType = {
  TEXT: 'Text',
  BREAK: 'Break',
}

export class MapCollector {
  constructor() {
    this.map = []
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
        this.map.push({
          type: MapType.BREAK,
          double: false,
        })
        break
      case BreakType.DOUBLE:
        this.map.push({
          type: MapType.BREAK,
          double: true,
        })
        break
    }

    this.lastBreak = BreakType.NONE
  }

  processText() {
    if (this.text.length === 0) {
      return
    }

    const joinedText = this.text.map((element) => element.string).join('')
    // TODO: might have to check for null string here
    const trimmed = trimBeginAndEnd(joinedText)

    if (!trimmed) {
      // Trimmed into an empty string
      //  Preserve all preceding breaks
      this.text = []
      return
    }

    let fullText = trimBeginAndEnd(collapseWhitespace(trimmed))

    let blockMap = []
    let currentIndexOfString = 0

    for (const textMap of this.text) {
      const shrunkText = trimBeginAndEnd(collapseWhitespace(textMap.string))
      if (!shrunkText) {
        continue
      }

      const index = fullText.indexOf(shrunkText)

      if (index < 0) {
        throw new Error(
          `Could not find shrunk string \"${shrunkText}\" in \"${fullText}\"`,
        )
      }

      blockMap.push({
        type: MapType.TEXT,
        node: textMap.node,
        start: currentIndexOfString + index,
        content: shrunkText,
        length: shrunkText.length,
      })

      fullText = fullText.slice(index + shrunkText.length)
      currentIndexOfString += shrunkText.length + index
    }

    // Do some more magic on block map
    for (let i = 1; i < blockMap.length; ++i){
      if (blockMap[i].start - blockMap[i - 1].start !== blockMap[i - 1].length) {
        blockMap[i - 1].length = blockMap[i].start - blockMap[i - 1].start
      }
    }

    this.map.push(...blockMap)

    if (this.lastBreak === null) {
      this.lastBreak = BreakType.NONE
    }

    this.text = []
  }

  processElementNode(node, isOpening) {
    const tag = node.tagName.toLowerCase()

    // Special case for Preformatted
    if (tag === 'pre') {
      this.processText()
      this.addBreak(false)
      this.processBreaks()

      this.lastBreak = BreakType.SINGLE

      this.map.push({
        type: MapType.TEXT,
        node,
        content: node.textContent,
        length: node.textContent.length,
      })

      return true
    }

    // Process other tags
    switch (tag) {
      case 'br':
        this.processText()
        this.processBreaks()

        this.map.push({
          type: MapType.TEXT,
          node,
          content: '\n',
          length: 1,
        })

        return true
      case 'wbr':
        this.processBreaks()
        this.text.push({ node, string: '\u200B' })

        return true
    }

    if (node.hasAttribute('alt')) {
      this.processBreaks()
      this.text.push({ node, string: ` ${node.getAttribute('alt')} ` })

      return true
    }

    this.processBlockConstruct(node, isOpening)

    return false
  }

  processBlockConstruct(node, isOpening) {
    const tag = node.tagName.toLowerCase()

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
          this.map.push({
            type: MapType.TEXT,
            node,
            content: '\t',
            length: 1,
          })
        }
      } else {
        this.processText()
      }

      return
    }

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

    this.text.push({ node, string })
  }

  getResult() {
    const result = []
    let runningIndex = 0

    for (const entity of this.map) {
      switch (entity.type) {
        case MapType.TEXT:
          result.push({
            node: entity.node,
            content: entity.content,
            start: runningIndex,
            length: entity.length,
          })

          runningIndex += entity.length

          break
        case MapType.BREAK:
          const lastResult = result[result.length - 1]

          if (entity.double) {
            lastResult.length += 2
            runningIndex += 2
          } else {
            lastResult.length += 1
            runningIndex += 1
          }

          break
      }
    }

    return result
  }
}