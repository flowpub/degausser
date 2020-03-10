# degausser

[![Go](https://github.com/flowpub/degausser/workflows/Go/badge.svg)](https://github.com/flowpub/degausser/actions?query=workflow%3AGo)

HTML to plain text conversion.

_For when you want to eliminate HTML tags from a document and leave reasonably rendered text behind._

The target algorithm is similar to the [`HTMLElement.innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText) property of the HTML5 DOM.
With the limitation of not taking into account layout or styling.

## Usage

Example:

```go
package main

import "github.com/flowpub/degausser/go/degausser"

func main() {
	html := `
<h3>For example:</h3>
<p id="source">
  <style>#source { color: red; }</style>
  Take a look at
  <br>
  <strong>how</strong>
  <em>this</em>
  text<br>is
  <mark>inter</mark>preted
  below.
  <span style="display:none">HIDDEN TEXT</span>
</p>
	`
	plain, err := degausser.HTMLToPlainText(html)
	if err != nil {
		panic(err)
	}

	print(plain)
}
```

Output:

```
For example:

Take a look at
how this text
is interpreted below. HIDDEN TEXT
```
