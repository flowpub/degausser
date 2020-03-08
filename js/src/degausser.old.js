module.exports = parentNode => {
    // If there's no Node, just return
    if (!parentNode) {
        return null;
    }

    // Start the Text Entries Array
    const entityList = [];

    // Recursively process Nodes
    processNode(parentNode, entityList);

    // Finally Join the entries
    return joinEntries(entityList);
};

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

const joinTypes = {
    TEXT: "text",
    FLOW: "flow",
    BREAK: "break"
};
const joinEntries = entitiesList => {
    const processed = [];

    let lastSignifincantNode = null;

    for (let i = 0; i < entitiesList.length; i++) {
        const entity = entitiesList[i];

        // console.log("Entity: ", entity);

        // TEXT Node
        switch (entity.type) {
            case entityType.TEXT:
                const normalized = entity.content.normalize();

                // Trim
                const trimmed = trimBeginAndEnd(normalized);
                if (!trimmed) {
                    processed.push(null);
                    break;
                }

                lastSignifincantNode = entity;

                // Otherwise, collapse all whitespace
                processed.push({
                    type: joinTypes.TEXT,
                    content: collapseWhitespace(trimmed)
                });
                break;

            case entityType.BREAK:
                lastSignifincantNode = entity;
                processed.push({ type: joinTypes.BREAK });
                break;

            case entityType.BLOCK:
                // console.log('Entity: ', entity)

                // If preformatted, simply push it
                if (entity.condition === "pre") {
                    if (
                        lastSignifincantNode &&
                        lastSignifincantNode.type !== entityType.BLOCK
                    ) {
                        processed.push({ type: joinTypes.FLOW, content: "\n" });
                    }
                    processed.push({
                        type: joinTypes.TEXT,
                        content: `${entity.content}`
                    });
                    processed.push({ type: joinTypes.FLOW, content: "\n" });
                    lastSignifincantNode = entity;
                    break;
                }

                switch (entity.tag) {
                    case "p":
                        if (lastSignifincantNode) {
                            if (!entity.closing) {
                                if (
                                    lastSignifincantNode.type ===
                                    entityType.BLOCK
                                ) {
                                    let lastPopped = null;
                                    do {
                                        lastPopped = processed.pop();
                                    } while (lastPopped === null);
                                }
                                processed.push({
                                    type: joinTypes.FLOW,
                                    content: "\n\n",
                                    special: "p"
                                });
                            } else if (
                                lastSignifincantNode.type !== entityType.BLOCK
                            ) {
                                processed.push({
                                    type: joinTypes.FLOW,
                                    content: "\n\n",
                                    special: "p"
                                });
                            }
                        }

                        break;

                    case "table":
                        if (
                            !lastSignifincantNode ||
                            lastSignifincantNode.type !== entityType.BLOCK
                        ) {
                            processed.push({
                                type: joinTypes.FLOW,
                                content: "\n",
                                special: "table"
                            });
                        }
                        break;
                    case "div":
                    case "ul":
                    case "ol":
                        // console.log('Last: ', lastSignifincantNode)
                        if (
                            lastSignifincantNode &&
                            lastSignifincantNode.type !== entityType.BLOCK
                        ) {
                            processed.push({
                                type: joinTypes.FLOW,
                                content: "\n"
                            });
                        }
                        break;

                    case "tr":
                        if (lastSignifincantNode) {
                            switch (lastSignifincantNode.tag) {
                                case "table":
                                case "tr":
                                    break;
                                case "td":
                                case "th":
                                    do {
                                        const popped = processed.pop();
                                        if (
                                            popped !== null &&
                                            popped.type === joinTypes.TEXT
                                        ) {
                                            processed.push(popped);
                                            break;
                                        }
                                    } while (processed.length > 0);
                                    processed.push({
                                        type: joinTypes.FLOW,
                                        content: "\n"
                                    });
                                    break;
                                default:
                                    processed.push({
                                        type: joinTypes.FLOW,
                                        content: "\n"
                                    });
                            }
                        }
                        break;

                    case "td":
                    case "th":
                        if (
                            !entity.closing &&
                            lastSignifincantNode &&
                            lastSignifincantNode.tag !== "tr"
                        ) {
                            processed.push({
                                type: joinTypes.TEXT,
                                content: "\t"
                            });
                        }
                        break;

                    case "li":
                        if (
                            lastSignifincantNode &&
                            !["li", "ul"].includes(lastSignifincantNode.tag)
                        ) {
                            processed.push({
                                type: joinTypes.FLOW,
                                content: "\n"
                            });
                        }
                        break;
                    default:
                        if(lastSignifincantNode){
                            processed.push({
                                tyy: joinTypes.FLOW,
                                content: "\n"
                            })
                        }
                }

                lastSignifincantNode = entity;
                break; // Entity Type
        }
    }

    // console.log("Entities: ", entitiesList);
    // console.log("Processed: ", processed);

    // Filter out all Nulls
    const filtered = processed.filter(element => element !== null);

    // Special case for if all elements were empty
    if (filtered.length === 0) {
        return "";
    }

    // console.log("Filtered: ", filtered);

    // Break apart Filtered array by Hard Breaks
    let firstNonFlow = null,
        lastNonFlow = null;
    for (let index = 0; index < filtered.length; ++index) {
        if (filtered[index].type !== joinTypes.FLOW) {
            firstNonFlow = index;
            break;
        }
    }
    for (let index = filtered.length - 1; index >= 0; --index) {
        if (filtered[index].type !== joinTypes.FLOW) {
            lastNonFlow = index;
            break;
        }
    }

    // Entirely Flow components
    if (firstNonFlow == null || lastNonFlow == null) {
        return "";
    }

    // Finally, trim again the end result
    let finalOutput = "";
    for (let index = firstNonFlow; index < lastNonFlow + 1; ++index) {
        const entity = filtered[index];

        switch (entity.type) {
            case joinTypes.BREAK:
                finalOutput += "\n";
                break;
            case joinTypes.TEXT:
            case joinTypes.FLOW:
                finalOutput += entity.content;
                break;
        }
        // console.log(`|${finalOutput}|`)
    }

    // console.log(`|${finalOutput}|`)

    return finalOutput;
};

const blacklist = ["script", "style", "head", "title"];
const entityType = {
    TEXT: "text",
    BREAK: "break",
    BLOCK: "block"
};
const processNode = (node, entityList) => {
    const tag = node.tagName && node.tagName.toLowerCase();

    // Filter blacklist
    if (blacklist.includes(tag)) {
        return;
    }

    // Process Preformatted Tags
    if (tag === "pre") {
        entityList.push({
            type: entityType.BLOCK,
            content: node.textContent,
            condition: "pre"
        });
        return;
    }

    checkForBlockConstructs(tag, entityList, false);

    // If this node has children
    if (node.hasChildNodes()) {
        // Iterate
        node.childNodes.forEach(node => {
            // Process nodes recursively
            processNode(node, entityList);
        });
    }

    // Short cut if it's a Block
    if (checkForBlockConstructs(tag, entityList, true)) {
        return;
    }

    // Process the node if it is a Leaf Node

    if (node.nodeType === Node.TEXT_NODE) {
        addTextToEntities(node.textContent, entityList);
        return;
    }

    // Process special tags

    switch (tag) {
        case "br":
            entityList.push({ type: entityType.BREAK });
            break;
        case "area":
        case "img":
            // Count |alt| attribute of image tags as text
            if (node.hasAttribute("alt")) {
                addTextToEntities(` ${node.getAttribute("alt")}`, entityList);
            }
            break;
        case "wbr":
            addTextToEntities("\u200B", entityList);
            break;
    }
};

const addTextToEntities = (text, entityList) => {
    // If the last element was null, it came from a break (br, p, div, etc.)
    if (
        entityList.length > 0 &&
        entityList[entityList.length - 1].type === entityType.TEXT
    ) {
        entityList[entityList.length - 1].content += text;
    } else {
        entityList.push({ type: entityType.TEXT, content: text });
    }
};

const nonBlockConstructs = [
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

// const blockConstructs = [
//     "div",
//     "p",
//     "section",
//     "table",
//     "th",
//     "tr",
//     "td",
//     "ul",
//     "ol",
//     "li",
//     "h1",
//     "h2",

// ];
const checkForBlockConstructs = (tag, textEntries, closing) => {
    // If this construct is a Run of Phrasing

    // P and Div have different behaviours
    // Specifically P will leave consecutive \n characters, whereas Div does not
    // Refer to Container and Paragraphs tests respectively

    if (!nonBlockConstructs.includes(tag)) {
        textEntries.push({ type: entityType.BLOCK, tag: tag, closing });
        return true;
    }
};
