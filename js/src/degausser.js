import { StringCollector } from './stringCollector'
import { walkDOM } from './domWalker'

export const degausser = (parentNode) => {
  const collector = new StringCollector()

  return walkDOM(parentNode, collector)
}