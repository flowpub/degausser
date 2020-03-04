package main

import (
	"fmt"
	"log"

	"github.com/flowpub/hypotext/go/hypotext"
)

func main() {
	plain, err := hypotext.FromString("#<ul><li>item</li></ul>_")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Print(plain)
}
