# degausser

[![JS](https://github.com/flowpub/degausser/workflows/JS/badge.svg)](https://github.com/flowpub/degausser/actions?query=workflow%3AJS)
[![Go](https://github.com/flowpub/degausser/workflows/Go/badge.svg)](https://github.com/flowpub/degausser/actions?query=workflow%3AGo)
[![Reference](https://github.com/flowpub/degausser/workflows/Reference/badge.svg)](https://github.com/flowpub/degausser/actions?query=workflow%3AReference)

Implementations of HTML to plain text conversion.

*For when you want to eliminate HTML tags from a document, leaving reasonably rendered text behind.*

The target algorithm is similar to the [`HTMLElement.innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText) property of the HTML5 DOM.
With the limitation of not taking into account layout or styling.