import { StringCollector } from './stringCollector'
import { MapCollector } from './mapCollector'
import { walkDOM } from './domWalker'

export const degausser = (parentNode) => {
  const collector = new StringCollector()

  return walkDOM(parentNode, collector)
}

export const mapWithDegausser = parentNode => {
  const collector = new MapCollector()

  return walkDOM(parentNode, collector)
}