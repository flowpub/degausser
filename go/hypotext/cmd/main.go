package main

import (
	"fmt"
	"log"

	"github.com/flowpub/hypotext/go/hypotext"
)

func main() {
	plain, err := hypotext.FromString("T<br><p>E</p><br>S<p></p>T<br><p> </p>")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Print(plain)
}
