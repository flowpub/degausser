package degausser

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/mattn/go-zglob"
	"github.com/stretchr/testify/assert"
)

var testCaseFiles []string

func init() {
	os.Chdir("./testdata")

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

func getTestCase(testFile string) (TestCases, error) {
	jsonBytes, err := ioutil.ReadFile(testFile)
	if err != nil {
		return nil, err
	}

	var testCases TestCases

	err = json.Unmarshal(jsonBytes, &testCases)
	if err != nil {
		return nil, err
	}
	
	return testCases, nil
}

func loadEpub(path string, globs []string) ([]string, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return nil, err
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
			return nil, err
		}

		if len(matches) > 0 {
			for _, match := range matches {
				filePaths = append(filePaths, match)
			}
		}
	}

	return filePaths, nil
}

func TestEpub(t *testing.T) {

	if testing.Short() {
		t.Skip("skipping epub tests in short mode.")
	}

	// Get Glob Patterns for required file types
	var globs []string
	globs = append(globs, "/**/*.html", "/**/*.xhtml", "/**/*.htm")

	files, err := filepath.Glob("./parsed_epubs/*")
	if err != nil {
		t.Error(err)
		return
	}

	for _, file := range files {
		epubFiles, err := loadEpub(file, globs)
		if err != nil {
			t.Error(err)
			continue
		}

		for _, epubFile := range epubFiles {
			// Get Source
			markup, err := ioutil.ReadFile(epubFile)
			if err != nil {
				t.Error(err)
				continue
			}

			actual, err := HTMLToPlainText(string(markup))
			if err != nil {
				t.Error(err)
				continue
			}

			dirName, baseName := filepath.Split(epubFile)
			fileName := strings.Split(baseName, ".")

			// Get Reference
			rawText, err := ioutil.ReadFile(dirName + fileName[0] + ".txt")
			expected := string(rawText)
			if err != nil {
				t.Error(err)
				continue
			}

			assert.Equal(t, expected, actual, epubFile)
		}
	}
}

func TestStrippingWhitespace(t *testing.T) {
	testCases, err := getTestCase("./whitespaces.json")
	if err != nil {
		t.Error(err)
		return
	}

	for _, testCase := range testCases {
		actual, err := HTMLToPlainText(testCase.Input)
		if err != nil {
			t.Error(err)
			continue
		}
		
		assert.Equal(t,testCase.Output, actual, testCase.Input)
	}
}

func TestParagraphsAndBreaks(t *testing.T) {
	testCases, err := getTestCase("./paragraphs.json")
	if err != nil {
		t.Error(err)
		return
	}
	
	for _, testCase := range testCases {
		actual, err := HTMLToPlainText(testCase.Input)
		if err != nil {
			t.Error(err)
			continue
		}
		
		assert.Equal(t,testCase.Output, actual, testCase.Input)
	}
}

func TestContainers(t *testing.T) {
	testCases, err := getTestCase("./containers.json")
	if err != nil {
		t.Error(err)
		return
	}
	
	for _, testCase := range testCases {
		actual, err := HTMLToPlainText(testCase.Input)
		if err != nil {
			t.Error(err)
			continue
		}
		
		assert.Equal(t,testCase.Output, actual, testCase.Input)
	}
}

func TestSpans(t *testing.T) {
	testCases, err := getTestCase("./spans.json")
	if err != nil {
		t.Error(err)
		return
	}
	
	for _, testCase := range testCases {
		actual, err := HTMLToPlainText(testCase.Input)
		if err != nil {
			t.Error(err)
			continue
		}
		
		assert.Equal(t,testCase.Output, actual, testCase.Input)
	}
}

func TestLists(t *testing.T) {
	testCases, err := getTestCase("./lists.json")
	if err != nil {
		t.Error(err)
		return
	}
	
	for _, testCase := range testCases {
		actual, err := HTMLToPlainText(testCase.Input)
		if err != nil {
			t.Error(err)
			continue
		}
		
		assert.Equal(t,testCase.Output, actual, testCase.Input)
	}
}

func TestTables(t *testing.T) {
	testCases, err := getTestCase("./tables.json")
	if err != nil {
		t.Error(err)
		return
	}
	
	for _, testCase := range testCases {
		actual, err := HTMLToPlainText(testCase.Input)
		if err != nil {
			t.Error(err)
			continue
		}
		
		assert.Equal(t,testCase.Output, actual, testCase.Input)
	}
}

func TestLinks(t *testing.T) {
	testCases, err := getTestCase("./links.json")
	if err != nil {
		t.Error(err)
		return
	}
	
	for _, testCase := range testCases {
		actual, err := HTMLToPlainText(testCase.Input)
		if err != nil {
			t.Error(err)
			continue
		}
		
		assert.Equal(t,testCase.Output, actual, testCase.Input)
	}
}

func TestImageAltTags(t *testing.T) {
	// go implementation out of date with js version
	// go implementation does not implement alt text injection

	//testCases, err := getTestCase("./images.json")
	//if err != nil {
	//	t.Error(err)
	//	return
	//}
	//
	//for _, testCase := range testCases {
	//	actual, err := HTMLToPlainText(testCase.Input)
	//	if err != nil {
	//		t.Error(err)
	//		continue
	//	}
	//
	//	assert.Equal(t,testCase.Output, actual, testCase.Input)
	//}
}

func TestIgnoreStylesScriptsHead(t *testing.T) {
	testCases, err := getTestCase("./scripts.json")
	if err != nil {
		t.Error(err)
		return
	}
	
	for _, testCase := range testCases {
		actual, err := HTMLToPlainText(testCase.Input)
		if err != nil {
			t.Error(err)
			continue
		}
		
		assert.Equal(t,testCase.Output, actual, testCase.Input)
	}
}

func TestCrazyOrComplex(t *testing.T) {
	testCases, err := getTestCase("./crazy.json")
	if err != nil {
		t.Error(err)
		return
	}
	
	for _, testCase := range testCases {
		actual, err := HTMLToPlainText(testCase.Input)
		if err != nil {
			t.Error(err)
			continue
		}
		
		assert.Equal(t,testCase.Output, actual, testCase.Input)
	}
}
