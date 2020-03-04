package hypotext

import (
	"strings"

	"golang.org/x/net/html"
)

func FromString(s string) (string, error) {
	doc, err := html.Parse(strings.NewReader(s))
	if err != nil {
		return "", err
	}

	var bodyNode *html.Node
	runs := make([]string, 0)
	breaks := make([]string, 0)
	stack := make([]string, 0)
	skipNode := false
	preformatted := false

	walk(doc, func(node *html.Node) bool {
		if node.Type == html.ElementNode && strings.ToLower(node.Data) == "body" {
			bodyNode = node
			return false
		}
		return true
	}, func(node *html.Node) bool {
		return true
	})

	walk(bodyNode, func(node *html.Node) bool {
		if node.Type == html.ElementNode && IsNodeOfType(node, MetadataContent) {
			skipNode = true
		}

		if skipNode {
			return true
		}

		if node.Type == html.ElementNode {
			nodeName := strings.ToLower(node.Data)

			if nodeName == "pre" {
				preformatted = true
			}

			// process container-caused new lines
			if len(breaks) != 0 {
				runs = append(runs, breaks...)
				breaks = make([]string, 0)
			}

			if !IsNodeOfType(node, PhrasingContent) {
				stack, runs = process(stack, runs)
				if len(runs) != 0 && runs[len(runs)-1] != "\n" {
					if nodeName == "p" {
						runs = append(runs, "\n")
					}
					runs = append(runs, "\n")
				}
			} else {
				if nodeName == "br" {
					if len(stack) != 0 && stack[len(stack)-1] == " " {
						stack = stack[:len(stack)-1]
					}
					stack = append(stack, "\n")
				}
				if nodeName == "wbr" {
					stack = append(stack, "\u200B")
				}
			}
		}

		if node.Type == html.TextNode {
			if !preformatted {
				trimmed := CollapseRepeatingWhitespace(node.Data)
				if len(stack) != 0 && stack[len(stack)-1] == "\n" {
					trimmed = TrimWhitespaceLeft(trimmed)
				}
				if !(len(stack) == 0 && trimmed == " " || len(trimmed) == 0) && !(trimmed == " " && len(stack) != 0 && CollapseRepeatingWhitespace(stack[len(stack)-1]) == " ") {
					// process container-caused new lines
					if len(breaks) != 0 {
						runs = append(runs, breaks...)
						breaks = make([]string, 0)
					}

					stack = append(stack, trimmed)
				}
			} else {
				stack = append(stack, node.Data)
			}
		}

		return true
	}, func(node *html.Node) bool {
		if node.Type == html.ElementNode && IsNodeOfType(node, MetadataContent) {
			skipNode = false
		}

		if skipNode {
			return true
		}

		if node.Type == html.ElementNode {
			nodeName := strings.ToLower(node.Data)

			if nodeName == "pre" {
				preformatted = false
				runs = append(runs, strings.Join(stack, ""))
				stack = make([]string, 0)
			} else if !IsNodeOfType(node, PhrasingContent) {
				stack, runs = process(stack, runs)
				if len(breaks) == 0 && len(runs) != 0 && runs[len(runs)-1] != "\n" && node != bodyNode {
					if nodeName == "p" {
						breaks = append(breaks, "\n")
					}
					breaks = append(breaks, "\n")
				}
			}
		}
		return true
	})

	return strings.Join(runs, ""), nil
}

func process(stack []string, runs []string) ([]string, []string) {
	if len(stack) != 0 {
		runs = append(runs, TrimSpaces(CollapseRepeatingSpaces(strings.Join(stack, ""))))
		stack = make([]string, 0)
	}
	return stack, runs
}

type visitNode = func(node *html.Node) bool

func walk(root *html.Node, enter visitNode, exit visitNode) {
	node := root
Start:
	for node != nil {
		shouldContinue := enter(node)
		if !shouldContinue {
			return
		}
		if node.FirstChild != nil {
			node = node.FirstChild
			continue
		}
		for node != nil {
			shouldContinue := exit(node)
			if !shouldContinue {
				return
			}
			if node.NextSibling != nil {
				node = node.NextSibling
				continue Start
			}
			if node == root {
				node = nil
			} else {
				node = node.Parent
			}
		}
	}
}
