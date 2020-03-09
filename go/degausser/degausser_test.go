package degausser

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/mattn/go-zglob"
	"github.com/stretchr/testify/assert"
)

var verboseLogging bool

var testCaseFiles []string

func init() {
	os.Chdir("./testdata")

	if v := os.Getenv("degausser_VERBOSE"); v == "1" || v == "true" {
		verboseLogging = true
	}

	files, err := ioutil.ReadDir(".")
	if err != nil {
		log.Fatal(err)
	}

	testCaseFiles = make([]string, len(files))
	for i, file := range files {
		testCaseFiles[i] = file.Name()
	}
}

type TestCases []struct {
	Input  string `json:"i"`
	Output string `json:"o"`
}

func getTestCase(testFile string) TestCases {
	jsonBytes, err := ioutil.ReadFile(testFile)
	if err != nil {
		log.Fatal(err)
	}
	var testCases TestCases
	jsonError := json.Unmarshal(jsonBytes, &testCases)
	if jsonError != nil {
		log.Fatal(jsonError)
	}
	return testCases
}

func loadEpub(path string, globs []string) []string {
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}

	fileCollections := make([]string, 0)

	for _, globPattern := range globs {
		finalGlob := filepath.Join(cwd, path, globPattern)
		fileCollections = append(fileCollections, finalGlob)
	}

	filePaths := make([]string, 0)

	for _, glob := range fileCollections {
		matches, err := zglob.Glob(glob)
		if err != nil {
			log.Fatal(err)
		}

		if len(matches) > 0 {
			for _, match := range matches {
				filePaths = append(filePaths, match)
			}
		}
	}

	return filePaths
}

func TestEpub(t *testing.T) {
	// Get Glob Patterns for required file types
	var globs []string
	globs = append(globs, "/**/*.html", "/**/*.xhtml", "/**/*.htm")

	files, err := filepath.Glob("./parsed_epubs/*")
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		epubFiles := loadEpub(file, globs)

		for _, epubFile := range epubFiles {
			// Get Source
			markup, err := ioutil.ReadFile(epubFile)
			if err != nil {
				log.Fatal(err)
			}

			sourceOutput, err := HTMLToPlainText(string(markup))
			if err != nil {
				log.Fatal(err)
			}

			dirName, baseName := filepath.Split(epubFile)
			fileName := strings.Split(baseName, ".")

			// Get Reference
			rawText, err := ioutil.ReadFile(dirName + fileName[0] + ".txt")
			reference := string(rawText)
			if err != nil {
				log.Fatal(err)
			}

			assert.Equal(t, sourceOutput, reference)
		}
	}
}

func TestStrippingWhitespace(t *testing.T) {
	testCases := getTestCase("./whitespaces.json")

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.Input, testCase.Output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

func TestParagraphsAndBreaks(t *testing.T) {
	testCases := getTestCase("./paragraphs.json")

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.Input, testCase.Output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

func TestContainers(t *testing.T) {
	testCases := getTestCase("./containers.json")

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.Input, testCase.Output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

func TestSpans(t *testing.T) {
	testCases := getTestCase("./spans.json")

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.Input, testCase.Output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

func TestLists(t *testing.T) {
	testCases := getTestCase("./lists.json")

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.Input, testCase.Output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

func TestTables(t *testing.T) {
	testCases := getTestCase("./tables.json")

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.Input, testCase.Output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

func TestLinks(t *testing.T) {
	testCases := getTestCase("./links.json")

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.Input, testCase.Output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

func TestImageAltTags(t *testing.T) {
	testCases := getTestCase("./images.json")

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.Input, testCase.Output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

func TestIgnoreStylesScriptsHead(t *testing.T) {
	testCases := getTestCase("./scripts.json")

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.Input, testCase.Output); err != nil {
			t.Error(err)
		} else if len(msg) > 0 {
			t.Log(msg)
		}
	}
}

func TestCrazyOrComplex(t *testing.T) {
	testCases := getTestCase("./crazy.json")

	for _, testCase := range testCases {
		if msg, err := wantString(testCase.Input, testCase.Output); err != nil {
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
	text, err := HTMLToPlainText(input)
	if err != nil {
		return "", err
	}
	if !matcher.MatchString(text) {
		return "", fmt.Errorf(`error: input did not match specified expression
Input
>>>
%v
<<<

Output
>>>
%v
<<<

Expected
>>>
%v
<<<`,
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
