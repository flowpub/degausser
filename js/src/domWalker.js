import { DOCUMENT_FRAGMENT_NODE, DOCUMENT_NODE, ELEMENT_NODE, TEXT_NODE } from './constants'
import { blacklist } from './util'

export const walkDOM = (parentNode, collector) => {
  if (!parentNode) {
    return
  }

  processNode(parentNode, collector)

  return collector.getResult()
}

const processNode = (node, collector) => {
  switch (node.nodeType) {
    case TEXT_NODE:
      collector.processTextNode(node)
      break
    case ELEMENT_NODE:
      if (blacklist.includes(node.tagName.toLowerCase())) {
        return
      }
      processElementNode(node, collector)
      break
    case DOCUMENT_NODE:
    case DOCUMENT_FRAGMENT_NODE:
      if (node.hasChildNodes()) {
        let childNodes = node.childNodes
        if (!Array.isArray(childNodes)) {
          childNodes = Array.from(childNodes)
        }

        childNodes.forEach((child) => {
          processNode(child, collector)
        })
      }
      break
  }
}

const processElementNode = (node, collector) => {
  const skipRest = collector.processElementNode(node, true)

  if (skipRest) {
    return
  }

  if (node.hasChildNodes()) {
    let childNodes = node.childNodes
    if (!Array.isArray(childNodes)) {
      childNodes = Array.from(childNodes)
    }

    childNodes.forEach((child) => {
      processNode(child, collector)
    })
  }

  collector.processElementNode(node, false)
}
