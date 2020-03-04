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

	var body *html.Node
	runs := make([]string, 0)
	stack := make([]string, 0)
	skipNode := false

	walk(doc, func(node *html.Node) bool {
		if node.Type == html.ElementNode && strings.ToLower(node.Data) == "body" {
			body = node
			return false
		}
		return true
	}, func(node *html.Node) bool {
		return true
	})

	walk(body, func(node *html.Node) bool {
		if node.Type == html.ElementNode && IsNodeOfType(node, MetadataContent) {
			skipNode = true
		}

		if skipNode {
			return true
		}

		if node.Type == html.ElementNode {
			nodeName := strings.ToLower(node.Data)
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
			trimmed := CollapseRepeatingWhitespace(node.Data)
			if len(stack) != 0 && stack[len(stack)-1] == "\n" {
				trimmed = TrimWhitespaceLeft(trimmed)
			}
			if !(len(stack) == 0 && trimmed == " " || len(trimmed) == 0) && !(trimmed == " " && len(stack) != 0 && CollapseRepeatingWhitespace(stack[len(stack)-1]) == " ") {
				stack = append(stack, trimmed)
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
			if !IsNodeOfType(node, PhrasingContent) {
				stack, runs = process(stack, runs)
				if len(runs) != 0 && runs[len(runs)-1] != "\n" {
					if nodeName == "p" {
						runs = append(runs, "\n")
					}
					runs = append(runs, "\n")
				}
			}
		}
		return true
	})

	return TrimWhitespace(strings.Join(runs, "")), nil
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
