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

	runs := make([]string, 0)
	breaks := make([]string, 0)
	text := make([]string, 0)

	shouldSkip := false
	isPreformatted := false

	isInTableRow := false
	hasEncounteredFirstCell := false

	emptyText := func() {
		text = make([]string, 0)
	}

	processText := func(trim bool) {
		if len(text) != 0 {
			joined := strings.Join(text, "")
			if trim {
				joined = TrimSpaces(CollapseRepeatingSpaces(joined))
			}
			runs = append(runs, joined)
			emptyText()
		}
	}

	appendNewLine := func(inRuns bool) {
		if inRuns {
			runs = append(runs, "\n")
		} else {
			breaks = append(breaks, "\n")
		}
	}

	processBreaks := func() {
		// process container-caused new lines
		if len(breaks) != 0 {
			runs = append(runs, breaks...)
			breaks = make([]string, 0)
		}
	}

	visitElement := func(node *html.Node, enter bool) {
		nodeName := getTag(node)
		isNonPhrasing := !IsNodeOfType(node, PhrasingContent)

		if enter {

			if nodeName == "pre" {
				isPreformatted = true
			}

			if nodeName == "tr" {
				isInTableRow = true
			}

			processBreaks()

			if isNonPhrasing {
				processText(true)
				if isInTableRow && nodeName == "td" || nodeName == "th" {
					if hasEncounteredFirstCell {
						runs = append(runs, "\t")
					} else {
						hasEncounteredFirstCell = true
					}

				} else if peek(runs) != "\n" && peek(runs) != "" {
					if nodeName == "p" {
						appendNewLine(true)
					}
					appendNewLine(true)
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
		} else {

			for _, attribute := range node.Attr {
				if attribute.Key == "alt" {
					text = append(text, attribute.Val)
				}
			}

			if nodeName == "pre" {
				isPreformatted = false
				processText(false)
			} else if isNonPhrasing {
				processText(true)
				if len(breaks) == 0 && peek(runs) != "\n" && node != doc {
					if nodeName == "p" {
						appendNewLine(false)
					}
					if nodeName != "td" && nodeName != "th" {
						appendNewLine(false)
					}
				}
			}

			if nodeName == "tr" {
				isInTableRow = false
				hasEncounteredFirstCell = false
			}
		}
	}

	visitText := func(node *html.Node, enter bool) {
		textContent := node.Data

		if enter {
			if !isPreformatted {
				trimmed := CollapseRepeatingWhitespace(textContent)
				if peek(text) == "\n" {
					trimmed = TrimWhitespaceLeft(trimmed)
				}
				if len(text) != 0 && len(trimmed) != 0 || trimmed != " " {
					processBreaks()

					text = append(text, trimmed)
				}
			} else {
				text = append(text, textContent)
			}
		}
	}

	walk(doc, func(node *html.Node) bool {
		if isElement(node) && IsNodeOfType(node, MetadataContent) {
			shouldSkip = true
		}

		if shouldSkip {
			return true
		}

		if isElement(node) {
			visitElement(node, true)
		}

		if isTextNode(node) {
			visitText(node, true)
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
			visitElement(node, false)
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
