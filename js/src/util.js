// Char codes for \t, \n, and non-&nbsp; space character
const whitespaces = [9, 10, 32];
const isCharWhitespace = charCode => {
    return whitespaces.includes(charCode);
};

const trimBeginAndEnd = string => {
    // Get the first and last non-whitespace character index
    let firstNonWhite = null,
        lastNonWhite = null;
    for (let index = 0; index < string.length; index++) {
        if (!isCharWhitespace(string.charCodeAt(index))) {
            firstNonWhite = index;
            break;
        }
    }
    for (let index = string.length - 1; index >= 0; index--) {
        if (!isCharWhitespace(string.charCodeAt(index))) {
            // if(index !== string.length - 1){
            // String slicing breaks if the last char is not whitespace
            lastNonWhite = index;
            // }
            break;
        }
    }

    // If both are null, the string is entirely whitespace
    if (firstNonWhite === null || lastNonWhite === null) {
        return null;
    }

    // Return the non-empty sections of the string
    return string.slice(
        firstNonWhite,
        lastNonWhite ? lastNonWhite + 1 : undefined
    );
};
const collapseWhitespace = string => {
    // Collapse all other sequential whitespace into a single whitespace
    const textElements = [];
    let startOfNonWhite = null;
    for (let index = 0; index < string.length; index++) {
        if (
            startOfNonWhite === null &&
            !isCharWhitespace(string.charCodeAt(index))
        ) {
            startOfNonWhite = index;
            continue;
        }
        if (
            startOfNonWhite !== null &&
            isCharWhitespace(string.charCodeAt(index))
        ) {
            textElements.push(string.slice(startOfNonWhite, index));
            startOfNonWhite = null;
            continue;
        }
    }

    // At the end, add the rest of the string
    if (startOfNonWhite !== null) {
        textElements.push(string.slice(startOfNonWhite));
    }

    return textElements.join(" ");
};

const blacklist = ["base",
"command",
"link",
"meta",
"noscript",
"script",
"style",
"title",
// special cases
// "html",
"head",];

const phrasingConstructs = [
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
]

module.exports = {
    blacklist,
    
    trimBeginAndEnd,
    collapseWhitespace,

    phrasingConstructs,

}