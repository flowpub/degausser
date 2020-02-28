package main

import (
	"fmt"
	"log"

	"github.com/flowpub/hypotext/go/hypotext"
)

func main() {
	plain, err := hypotext.FromString("<div>hello world</div>")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Print(plain)
}
