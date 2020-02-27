package hypotext

import (
	"fmt"
	"os"
	"testing"
)

var verboseLogging bool

func init() {
	if v := os.Getenv("HYPOTEXT_VERBOSE"); v == "1" || v == "true" {
		verboseLogging = true
	}
}

func TestStrippingWhitespace(t *testing.T) {
	testCases := []struct {
		input  string
		output string
	}{
		{
			"test text",
			"test text",
		},
		{
			"  \ttext\ntext\n",
			"text text",
		},
		{
			"  \na \n\t \n \n a \t",
			"a a",
		},
		{
			"test        text",
			"test text",
		},
		{
			"test&nbsp;&nbsp;&nbsp; text&nbsp;",
			"test    text",
		},
	}

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.input, testCase.output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

func TestParagraphsAndBreaks(t *testing.T) {
	testCases := []struct {
		input  string
		output string
	}{
		{
			"Test text",
			"Test text",
		},
		{
			"Test text<br>",
			"Test text",
		},
		{
			"Test text<br>Test",
			"Test text\nTest",
		},
		{
			"<p>Test text</p>",
			"Test text",
		},
		{
			"<p>Test text</p><p>Test text</p>",
			"Test text\n\nTest text",
		},
		{
			"\n<p>Test text</p>\n\n\n\t<p>Test text</p>\n",
			"Test text\n\nTest text",
		},
		{
			"\n<p>Test text<br/>Test text</p>\n",
			"Test text\nTest text",
		},
		{
			"\n<p>Test text<br> \tTest text<br></p>\n",
			"Test text\nTest text",
		},
		{
			"Test text<br><BR />Test text",
			"Test text\n\nTest text",
		},
		{
			"<pre>test1\ntest 2\n\ntest  3</pre>",
			"test1\ntest 2\n\ntest  3",
		},
	}

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.input, testCase.output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

func TestDiv(t *testing.T) {
	testCases := []struct {
		input  string
		output string
	}{
		{
			"<div>Test</div>",
			"Test",
		},
		{
			"\t<div>Test</div> ",
			"Test",
		},
		{
			"<div>Test line 1<div>Test 2</div></div>",
			"Test line 1\nTest 2",
		},
		{
			"Test 1<div>Test 2</div> <div>Test 3</div>Test 4",
			"Test 1\nTest 2\nTest 3\nTest 4",
		},
		{
			"Test 1<div>&nbsp;Test 2&nbsp;</div>",
			"Test 1\nTest 2",
		},
	}

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.input, testCase.output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}

}

func TestStrippingLists(t *testing.T) {
	testCases := []struct {
		input  string
		output string
	}{
		{
			"<ul></ul>",
			"",
		},
		{
			"<ul><li>item</li></ul>_",
			"* item\n\n_",
		},
		{
			"<li class='123'>item 1</li> <li>item 2</li>\n_",
			"* item 1\n* item 2\n_",
		},
		{
			"<li>item 1</li> \t\n <li>item 2</li> <li> item 3</li>\n_",
			"* item 1\n* item 2\n* item 3\n_",
		},
	}

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.input, testCase.output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

func TestTables(t *testing.T) {
	testCases := []struct {
		input  string
		output string
	}{
		{
			"<table><tr><td></td><td></td></tr></table>",
			"",
		},
		{
			"<table><tr><td>cell1</td><td>cell2</td></tr></table>",
			"cell1 cell2",
		},
		{
			"<table><tr><td>row1</td></tr><tr><td>row2</td></tr></table>",
			"row1 row2",
		},
		{
			`<table>
				<tbody>
					<tr><td><p>Row-1-Col-1-Msg123456789012345</p><p>Row-1-Col-1-Msg2</p></td><td>Row-1-Col-2</td></tr>
					<tr><td>Row-2-Col-1</td><td>Row-2-Col-2</td></tr>
				</tbody>
			</table>`,
			`Row-1-Col-1-Msg123456789012345
Row-1-Col-1-Msg2
Row-1-Col-2 Row-2-Col-1 Row-2-Col-2`,
		},
		{
			`<table>
			   <tr><td>cell1-1</td><td>cell1-2</td></tr>
			   <tr><td>cell2-1</td><td>cell2-2</td></tr>
			</table>`,
			"cell1-1 cell1-2 cell2-1 cell2-2",
		},
		{
			`<table>
				<thead>
					<tr><th>Header 1</th><th>Header 2</th></tr>
				</thead>
				<tfoot>
					<tr><td>Footer 1</td><td>Footer 2</td></tr>
				</tfoot>
				<tbody>
					<tr><td>Row 1 Col 1</td><td>Row 1 Col 2</td></tr>
					<tr><td>Row 2 Col 1</td><td>Row 2 Col 2</td></tr>
				</tbody>
			</table>`,
			"Header 1 Header 2 Footer 1 Footer 2 Row 1 Col 1 Row 1 Col 2 Row 2 Col 1 Row 2 Col 2",
		},
		// Two tables in same HTML
		{
			`<p>
				<table>
					<thead>
						<tr><th>Table 1 Header 1</th><th>Table 1 Header 2</th></tr>
					</thead>
					<tfoot>
						<tr><td>Table 1 Footer 1</td><td>Table 1 Footer 2</td></tr>
					</tfoot>
					<tbody>
						<tr><td>Table 1 Row 1 Col 1</td><td>Table 1 Row 1 Col 2</td></tr>
						<tr><td>Table 1 Row 2 Col 1</td><td>Table 1 Row 2 Col 2</td></tr>
					</tbody>
				</table>
				<table>
					<thead>
						<tr><th>Table 2 Header 1</th><th>Table 2 Header 2</th></tr>
					</thead>
					<tfoot>
						<tr><td>Table 2 Footer 1</td><td>Table 2 Footer 2</td></tr>
					</tfoot>
					<tbody>
						<tr><td>Table 2 Row 1 Col 1</td><td>Table 2 Row 1 Col 2</td></tr>
						<tr><td>Table 2 Row 2 Col 1</td><td>Table 2 Row 2 Col 2</td></tr>
					</tbody>
				</table>
			</p>`,
			`Table 1 Header 1 Table 1 Header 2 Table 1 Footer 1 Table 1 Footer 2 Table 1 Row 1 Col 1 Table 1 Row 1 Col 2 Table 1 Row 2 Col 1 Table 1 Row 2 Col 2
Table 2 Header 1 Table 2 Header 2 Table 2 Footer 1 Table 2 Footer 2 Table 2 Row 1 Col 1 Table 2 Row 1 Col 2 Table 2 Row 2 Col 1 Table 2 Row 2 Col 2`,
		},
		{
			"_<table><tr><td>cell</td></tr></table>_",
			"_\n\ncell\n\n_",
		},
		{
			`<table>
				<tr>
					<th>Item</th>
					<th>Description</th>
					<th>Price</th>
				</tr>
				<tr>
					<td>Golang</td>
					<td>Open source programming language that makes it easy to build simple, reliable, and efficient software</td>
					<td>$10.99</td>
				</tr>
				<tr>
					<td>Hermes</td>
					<td>Programmatically create beautiful e-mails using Golang.</td>
					<td>$1.99</td>
				</tr>
			</table>`,
			"Item Description Price Golang Open source programming language that makes it easy to build simple, reliable, and efficient software $10.99 Hermes Programmatically create beautiful e-mails using Golang. $1.99",
		},
	}

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.input, testCase.output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

func TestLinks(t *testing.T) {
	testCases := []struct {
		input  string
		output string
	}{
		{
			`<a></a>`,
			``,
		},
		{
			`<a href=""></a>`,
			``,
		},
		{
			`<a href="http://example.com/"></a>`,
			``,
		},
		{
			`<a href="">Link</a>`,
			`Link`,
		},
		{
			`<a href="http://example.com/">Link</a>`,
			`Link`,
		},
		{
			`<a href="http://example.com/"><span class="a">Link</span></a>`,
			`Link`,
		},
		{
			"<a href='http://example.com/'>\n\t<span class='a'>Link</span>\n\t</a>",
			`Link`,
		},
		{
			`<a href="http://example.com/"><img src="http://example.ru/hello.jpg" alt="Example"></a>`,
			`Example`,
		},
	}

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.input, testCase.output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

func TestImageAltTags(t *testing.T) {
	testCases := []struct {
		input  string
		output string
	}{
		{
			`<img />`,
			``,
		},
		{
			`<img src="http://example.ru/hello.jpg" />`,
			``,
		},
		{
			`<img alt="Example"/>`,
			`Example`,
		},
		{
			`<img src="http://example.ru/hello.jpg" alt="Example"/>`,
			`Example`,
		},
		{
			`<a href="http://example.com/"><img src="http://example.ru/hello.jpg" alt="Example"/></a>`,
			`Example`,
		},
		{
			`<div><p>Hello <img src="https://via.placeholder.com/140x100" alt="World"/></a></p></div>`,
			`Hello World`,
		},
	}

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.input, testCase.output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

func TestIgnoreStylesScriptsHead(t *testing.T) {
	testCases := []struct {
		input  string
		output string
	}{
		{
			"<style>Test</style>",
			"",
		},
		{
			"<style type=\"text/css\">body { color: #fff; }</style>",
			"",
		},
		{
			"<link rel=\"stylesheet\" href=\"main.css\">",
			"",
		},
		{
			"<script>Test</script>",
			"",
		},
		{
			"<script src=\"main.js\"></script>",
			"",
		},
		{
			"<script type=\"text/javascript\" src=\"main.js\"></script>",
			"",
		},
		{
			"<script type=\"text/javascript\">Test</script>",
			"",
		},
		{
			"<script type=\"text/ng-template\" id=\"template.html\"><a href=\"http://google.com\">Google</a></script>",
			"",
		},
		{
			"<script type=\"bla-bla-bla\" id=\"template.html\">Test</script>",
			"",
		},
		{
			`<html><head><title>Title</title></head><body></body></html>`,
			"",
		},
	}

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.input, testCase.output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

type StringMatcher interface {
	MatchString(string) bool
	String() string
}

type ExactStringMatcher string

func (m ExactStringMatcher) MatchString(str string) bool {
	return string(m) == str
}
func (m ExactStringMatcher) String() string {
	return string(m)
}

func wantString(input string, output string) (string, error) {
	return match(input, ExactStringMatcher(output))
}

func match(input string, matcher StringMatcher) (string, error) {
	text, err := FromString(input)
	if err != nil {
		return "", err
	}
	if !matcher.MatchString(text) {
		return "", fmt.Errorf(`error: input did not match specified expression
Input:
>>>>
%v
<<<<
Output:
>>>>
%v
<<<<
Expected:
>>>>
%v
<<<<`,
			input,
			text,
			matcher.String(),
		)
	}

	var msg string

	if verboseLogging {
		msg = fmt.Sprintf(
			`
input:
%v
output:
%v
`,
			input,
			text,
		)
	}
	return msg, nil
}
