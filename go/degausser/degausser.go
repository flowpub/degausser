package degausser

import (
	"strings"

	"golang.org/x/net/html"
)

// HTMLToPlainText receives HTML markup text as input,
// and returns a transformed plain-text representation.
//
// It implements an algorithm similar to an HTML5 DOM
// element node's `.innerText` property.
// This does not take layout or styling into account.
func HTMLToPlainText(htmlMarkup string) (string, error) {
	doc, err := html.Parse(strings.NewReader(htmlMarkup))
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

	appendNewLine := func(doubleBreak bool) {
		if doubleBreak {
			breaks = append(breaks, "\n\n")
		} else {
			breaks = append(breaks, "\n")
		}
	}

	processBreaks := func() {
		if len(breaks) != 0 {
			joined := strings.Join(breaks, "")
			split := strings.Split(joined, "")
			runs = append(runs, split...)
			breaks = make([]string, 0)
		}
	}

	shouldBreak := func() bool {
		return LastIn(runs) != "\n" && LastIn(runs) != "\x00" && len(breaks) == 0
	}

	visitElement := func(node *html.Node, enter bool) {
		nodeName := GetNodeName(node)
		isNonPhrasing := !IsElementNodeOfType(node, PhrasingContent)

		if enter {
			if nodeName == "pre" {
				processText(true)
				isPreformatted = true
				if shouldBreak() {
					appendNewLine(false)
				}
				processBreaks()
			}

			if nodeName == "tr" {
				isInTableRow = true
			}

			if isNonPhrasing {
				processText(true)
				if isInTableRow && nodeName == "td" || nodeName == "th" {
					processBreaks()
					if hasEncounteredFirstCell {
						runs = append(runs, "\t")
					} else {
						hasEncounteredFirstCell = true
					}
				} else if shouldBreak() {
					if nodeName == "p" {
						appendNewLine(true)
					} else {
						appendNewLine(false)
					}
				}
			} else {
				processBreaks()
				if nodeName == "br" {
					if LastIn(text) == " " {
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
				appendNewLine(false)
			} else if isNonPhrasing {
				processText(true)
				if shouldBreak() && node != doc {
					if nodeName == "p" {
						appendNewLine(true)
					} else if nodeName != "td" && nodeName != "th" {
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
				if LastIn(text) == "\n" {
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

	Walk(doc, func(node *html.Node) {
		if IsElement(node) && IsElementNodeOfType(node, MetadataContent) {
			shouldSkip = true
		}

		if shouldSkip {
			return
		}

		if IsElement(node) {
			visitElement(node, true)
		}

		if IsTextNode(node) {
			visitText(node, true)
		}
	}, func(node *html.Node) {
		if IsElement(node) && IsElementNodeOfType(node, MetadataContent) {
			shouldSkip = false
			return
		}

		if shouldSkip {
			return
		}

		if IsElement(node) {
			visitElement(node, false)
		}
	})

	return strings.Join(runs, ""), nil
}
