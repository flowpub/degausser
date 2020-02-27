package hypotext

import (
// "fmt"
// "log"
// "strings"

// "golang.org/x/net/html"
)

func FromString(s string) (string, error) {
	// doc, err := html.Parse(strings.NewReader(s))
	// if err != nil {
	// 	log.Fatal(err)
	// }

	// var f func(*html.Node)
	// f = func(n *html.Node) {
	// 	if n.Type != html.TextNode {
	// 		fmt.Printf("<%v>\n", n.Data)
	// 	} else {
	// 		fmt.Printf("[%v]\n", n.Data)
	// 	}

	// 	for c := n.FirstChild; c != nil; c = c.NextSibling {
	// 		f(c)
	// 	}
	// }
	// f(doc)
	return s, nil
}
