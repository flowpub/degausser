package main

import (
	"fmt"
	"log"

	"github.com/flowpub/degausser/go/degausser"
)

func main() {
	plain, err := degausser.HTMLToPlainText("T<br><p>E</p><br>S<p></p>T<br><p> </p>")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Print(plain)
}
