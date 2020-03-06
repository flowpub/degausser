package degausser

import (
	"regexp"
	"strings"

	"golang.org/x/net/html"
)

// Walk allows you to traverse a *html.Node tree.
func Walk(root *html.Node, enter func(*html.Node), exit func(*html.Node)) {
	node := root
Start:
	for node != nil {
		enter(node)
		if node.FirstChild != nil {
			node = node.FirstChild
			continue
		}
		for node != nil {
			exit(node)
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

// PhrasingContent is a set of node names,
// for the nodes that are in the HTML phrasing content category.
//
// The node names, `map` and `area`, are treated as special set members.
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
	// special cases
	"map",
	"area",
}

// MetadataContent is a set of node names,
// for the nodes that are in the HTML metadata content category.
//
// The node names, `html` and `head`, are treated as special set members.
var MetadataContent = []string{
	"base",
	"command",
	"link",
	"meta",
	"noscript",
	"script",
	"style",
	"title",
	// special cases
	"html",
	"head",
}

var trimWhitespaceLeftRegex, _ = regexp.Compile(`^\s+`)
var trimWhitespaceRightRegex, _ = regexp.Compile(`\s+$`)

// TrimWhitespaceLeft returns a slice of the string input
// with all leading whitespace characters removed.
func TrimWhitespaceLeft(input string) string {
	return trimWhitespaceLeftRegex.ReplaceAllString(input, "")
}

var trimSpacesRegex, _ = regexp.Compile(`^[ ]+|[ ]+$`)

// TrimSpaces returns a slice of the string input
// with only spaces removed.
func TrimSpaces(input string) string {
	return trimSpacesRegex.ReplaceAllString(input, "")
}

var collapseRepeatingWhitespaceRegex, _ = regexp.Compile(`\s+`)
var collapseRepeatingSpacesRegex, _ = regexp.Compile(`[ ]+`)

// CollapseRepeatingWhitespace returns a slice of the string input
// with repeating whitespace characters reduced down to one.
func CollapseRepeatingWhitespace(input string) string {
	return collapseRepeatingWhitespaceRegex.ReplaceAllString(input, " ")
}

// CollapseRepeatingSpaces returns a slice of the string input
// with repeating spaces reduced down to one.
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

// IsElementNodeOfType returns true if the given node
// has a name that is a member of the types slice.
func IsElementNodeOfType(node *html.Node, types []string) bool {
	return contains(types, GetNodeName(node))
}

// IsElement returns true if the given node is the element node type.
func IsElement(node *html.Node) bool {
	return node.Type == html.ElementNode
}

// IsTextNode returns true if the given node is the text node type.
func IsTextNode(node *html.Node) bool {
	return node.Type == html.TextNode
}

// GetNodeName returns the node name of the given node.
func GetNodeName(node *html.Node) string {
	return strings.ToLower(node.Data)
}

// LastIn returns the last item of the given slice.
//
// If the slice empty the null character is returned.
func LastIn(slice []string) string {
	if len(slice) != 0 {
		return slice[len(slice)-1]
	}
	return "\x00"
}
