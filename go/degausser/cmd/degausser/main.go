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
