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

	var root *html.Node

	runs := make([]string, 0)
	breaks := make([]string, 0)
	text := make([]string, 0)

	shouldSkip := false
	isPreformatted := false

	walk(doc, func(node *html.Node) bool {
		if isElement(node) && getTag(node) == "body" {
			root = node
			return false
		}
		return true
	}, func(node *html.Node) bool {
		return true
	})

	walk(root, func(node *html.Node) bool {
		if isElement(node) && IsNodeOfType(node, MetadataContent) {
			shouldSkip = true
		}

		if shouldSkip {
			return true
		}

		if isElement(node) {
			nodeName := getTag(node)

			if nodeName == "pre" {
				isPreformatted = true
			}

			// process container-caused new lines
			if len(breaks) != 0 {
				runs = append(runs, breaks...)
				breaks = make([]string, 0)
			}

			if !IsNodeOfType(node, PhrasingContent) {
				text, runs = process(text, runs)
				if peek(runs) != "\n" && peek(runs) != "" {
					if nodeName == "p" {
						runs = append(runs, "\n")
					}
					runs = append(runs, "\n")
				}
			} else {
				if nodeName == "br" {
					if peek(text) == " " {
						text = text[:len(text)-1]
					}
					text = append(text, "\n")
				}
				if nodeName == "wbr" {
					text = append(text, "\u200B")
				}
			}
		}

		if isTextNode(node) {
			if !isPreformatted {
				trimmed := CollapseRepeatingWhitespace(node.Data)
				if peek(text) == "\n" {
					trimmed = TrimWhitespaceLeft(trimmed)
				}
				if len(text) != 0 && len(trimmed) != 0 || trimmed != " " {
					// process container-caused new lines
					if len(breaks) != 0 {
						runs = append(runs, breaks...)
						breaks = make([]string, 0)
					}

					text = append(text, trimmed)
				}
			} else {
				text = append(text, node.Data)
			}
		}

		return true
	}, func(node *html.Node) bool {
		if isElement(node) && IsNodeOfType(node, MetadataContent) {
			shouldSkip = false
		}

		if shouldSkip {
			return true
		}

		if isElement(node) {
			nodeName := getTag(node)

			if nodeName == "pre" {
				isPreformatted = false
				runs = append(runs, strings.Join(text, ""))
				text = make([]string, 0)
			} else if !IsNodeOfType(node, PhrasingContent) {
				text, runs = process(text, runs)
				if len(breaks) == 0 && peek(runs) != "\n" && node != root {
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

func isElement(node *html.Node) bool {
	return node.Type == html.ElementNode
}

func isTextNode(node *html.Node) bool {
	return node.Type == html.TextNode
}

func getTag(node *html.Node) string {
	return strings.ToLower(node.Data)
}

func peek(slice []string) string {
	if len(slice) != 0 {
		return slice[len(slice)-1]
	}
	return ""
}

func process(text []string, runs []string) ([]string, []string) {
	if len(text) != 0 {
		runs = append(runs, TrimSpaces(CollapseRepeatingSpaces(strings.Join(text, ""))))
		text = make([]string, 0)
	}
	return text, runs
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
