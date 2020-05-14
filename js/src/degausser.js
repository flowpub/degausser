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
