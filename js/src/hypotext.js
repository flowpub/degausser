module.exports = parentNode => {
    // If there's no Node, just return
    if (!parentNode) {
        return null;
    }

    // Start the Text Entries Array
    const textEntries = [""];

    // Recursively process Nodes
    processNode(parentNode, textEntries);

    // Finally Join the entries
    return joinEntries(textEntries);
};

// Char codes for \t, \n, and non-&nbsp; space character
const whitespaces = [9, 10, 32];
const isWhitespace = charCode => {
    return whitespaces.includes(charCode);
};
const trimBeginAndEnd = string => {
    // Get the first and last non-whitespace character index
    let firstNonWhite, lastNonWhite;
    for (let index = 0; index < string.length; index++) {
        if (!isWhitespace(string.charCodeAt(index))) {
            firstNonWhite = index;
            break;
        }
    }
    for (let index = string.length - 1; index >= 0; index--) {
        if (!isWhitespace(string.charCodeAt(index))) {
            lastNonWhite = index;
            break;
        }
    }

    // If both are undefined, the string is entirely whitespace
    if (!firstNonWhite && !lastNonWhite) {
        return null;
    }

    // Return the non-empty sections of the string
    return string.slice(
        firstNonWhite,
        lastNonWhite ? lastNonWhite + 1 : undefined
    );
};
const joinEntries = entries => {
    const processed = entries.map(element => {
        // Nulls come from <p> and <br> tags, and denotes a definite new line
        // The null value will get turned into string if there is any content
        //  added which is not in a sub-container
        if (element === null) {
            return "";
        }

        // Trim
        const sliced = trimBeginAndEnd(element);
        if (!sliced) {
            // After trimming, if the string is empty
            // Return Null, which will get filtered out later
            return null;
        }

        // Collapse all other sequential whitespace into a single whitespace
        const textElements = [];
        let startOfNonWhite = null;
        for (let index = 0; index < sliced.length; index++) {
            if (
                startOfNonWhite === null &&
                !isWhitespace(sliced.charCodeAt(index))
            ) {
                startOfNonWhite = index;
                continue;
            }
            if (
                startOfNonWhite !== null &&
                isWhitespace(sliced.charCodeAt(index))
            ) {
                textElements.push(sliced.slice(startOfNonWhite, index));
                startOfNonWhite = null;
                continue;
            }
        }
        if (startOfNonWhite !== null) {
            textElements.push(sliced.slice(startOfNonWhite));
        }

        return textElements.join(" ");
    });

    // Filter out all Nulls
    const filtered = processed.filter(element => element !== null).join("\n");

    // Special case for if all elements were empty
    if (filtered.length === 0) {
        return "";
    }

    // Finally, trim again the end result
    return trimBeginAndEnd(filtered);
};

const blacklist = ["script", "style", "head"];
// const textEntryType = {
//     BREAK: "break",
//     TEXT: "text",
//     PARAGRAPH: "paragraph"
// };
const processNode = (node, textEntries) => {
    const tag = node.tagName && node.tagName.toLowerCase();

    // Filter blacklist
    if (blacklist.includes(tag)) {
        return;
    }

    // If this node has children
    if (node.hasChildNodes()) {
        checkForParagraph(tag, textEntries, false);

        // Iterate
        node.childNodes.forEach(node => {
            // Process nodes recursively
            processNode(node, textEntries);
        });

        checkForParagraph(tag, textEntries, true);
        return;
    }

    // Process the node if it is a Leaf Node
    // TODO: Process Preformatted Tags

    if (node.nodeType === Node.TEXT_NODE) {
        addEntryToArray(node.textContent, textEntries);
        return;
    }

    // Process special tags

    switch (tag) {
        case "br":
            textEntries.push(null);
            break;
        case "img":
            // Count |alt| attribute of image tags as text
            if (node.hasAttribute("alt")) {
                addEntryToArray(` ${node.getAttribute("alt")}`, textEntries);
            }
            break;
    }
};

const addEntryToArray = (entry, array) => {
    // If the last element was null, it came from a break (br, p, div, etc.)
    if (array[array.length - 1] === null) {
        array[array.length - 1] = "";
    }

    array[array.length - 1] += entry;
};

const paragraphConstructs = ["div", "p", "section"];
const checkForParagraph = (tag, textEntries, closing) => {
    // If this construct is a Run of Phrasing

    // P and Div have different behaviours
    // Specifically P will leave consecutive \n characters, whereas Div does not
    // Refer to Container and Paragraphs tests respectively

    if (!tag) {
        return;
    }

    if (closing && tag === "p") {
        textEntries.push(null);
    }

    if (paragraphConstructs.includes(tag)) {
        textEntries.push("");
    }
};
