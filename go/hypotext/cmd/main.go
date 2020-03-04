package main

import (
	"fmt"
	"log"

	"github.com/flowpub/hypotext/go/hypotext"
)

func main() {
	plain, err := hypotext.FromString(`Hello!
	<p>This
		<sup>is</sup>
		a
		<sub>
			<em>test</em>
		</sub>
	</p>
	<div>
		<br>
		Thanks!
	</div>`)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Print(plain)
}
