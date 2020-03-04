package hypotext

import (
	"regexp"
	"strings"

	"golang.org/x/net/html"
)

var PhrasingContent = []string{
	"abbr",
	"audio",
	"b",
	"bdo",
	"br",
	"button",
	"canvas",
	"cite",
	"code",
	"command",
	"data",
	"datalist",
	"dfn",
	"em",
	"embed",
	"i",
	"iframe",
	"img",
	"input",
	"kbd",
	"keygen",
	"label",
	"mark",
	"math",
	"meter",
	"noscript",
	"object",
	"output",
	"progress",
	"q",
	"ruby",
	"samp",
	"script",
	"select",
	"small",
	"span",
	"strong",
	"sub",
	"sup",
	"svg",
	"textarea",
	"time",
	"var",
	"video",
	"wbr",
}

var MetadataContent = []string{
	"base",
	"command",
	"link",
	"meta",
	"noscript",
	"script",
	"style",
	"title",
}

var ContentWithAlt = []string{
	"img",
	"area",
	"input",
}

var trimWhitespaceLeftRegex, _ = regexp.Compile(`^\s+`)
var trimWhitespaceRightRegex, _ = regexp.Compile(`\s+$`)

func TrimWhitespace(input string) string {
	return TrimWhitespaceLeft(TrimWhitespaceRight(input))
}

func TrimWhitespaceLeft(input string) string {
	return trimWhitespaceLeftRegex.ReplaceAllString(input, "")
}
func TrimWhitespaceRight(input string) string {
	return trimWhitespaceRightRegex.ReplaceAllString(input, "")
}

var trimSpacesRegex, _ = regexp.Compile(`^[ ]+|[ ]+$`)

func TrimSpaces(input string) string {
	return trimSpacesRegex.ReplaceAllString(input, "")
}

var collapseRepeatingWhitespaceRegex, _ = regexp.Compile(`\s+`)
var collapseRepeatingSpacesRegex, _ = regexp.Compile(`[ ]+`)

func CollapseRepeatingWhitespace(input string) string {
	return collapseRepeatingWhitespaceRegex.ReplaceAllString(input, " ")
}

func CollapseRepeatingSpaces(input string) string {
	return collapseRepeatingSpacesRegex.ReplaceAllString(input, " ")
}

func contains(slice []string, target string) bool {
	for _, value := range slice {
		if value == target {
			return true
		}
	}
	return false
}

func IsNodeOfType(node *html.Node, types []string) bool {
	if node.Type == html.TextNode {
		return false
	}
	nodeName := strings.ToLower(node.Data)

	return contains(types, nodeName)
}
