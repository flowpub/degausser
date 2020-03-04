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
    let firstNonWhite, lastNonWhite;
    for (let index = 0; index < string.length; index++) {
        if (!isCharWhitespace(string.charCodeAt(index))) {
            firstNonWhite = index;
            break;
        }
    }
    for (let index = string.length - 1; index >= 0; index--) {
        if (!isCharWhitespace(string.charCodeAt(index))) {
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
    if (startOfNonWhite !== null) {
        textElements.push(string.slice(startOfNonWhite));
    }

    return textElements.join(" ");
};
const joinEntries = entitiesList => {
    const processed = [];

    for (let i = 0; i < entitiesList.length; i++) {
        const entity = entitiesList[i];

        // console.log('Entity: ', entity)

        // TEXT Node
        switch (entity.type) {
            case entityType.TEXT:
                // If preformatted, simply push it
                if (entity.condition === "pre") {
                    processed.push(`\n${entity.content}\n`);
                    break;
                }

                const normalized = entity.content.normalize()

                // Trim
                const trimmed = trimBeginAndEnd(normalized);
                if (!trimmed) {
                    processed.push(null);
                    break;
                }

                // Otherwise, collapse all whitespace
                processed.push(collapseWhitespace(trimmed));

                break;

            case entityType.BREAK:
                processed.push("\n");
                break;

            case entityType.PARAGRAPH:
                // <p> always generates newlines, others do not
                if (entity.tag === "p") {
                    processed.push("\n");
                } else {
                    if(processed.length === 0){
                        processed.push(null)
                        break;
                    }

                    let addedToList = false
                    // Iterate backwards, and if we see another PARAGRAPH directly before,
                    //  don't add new line
                    for (
                        let previousIndex = processed.length - 1;
                        previousIndex >= 0;
                        previousIndex--
                    ) {
                        // console.log("Processed: ", processed[previousIndex]);
                        // console.log(
                        //     "EntitesList: ",
                        //     entitiesList[previousIndex]
                        // );
                        if (processed[previousIndex] != null) {
                            if (
                                entitiesList[previousIndex].type !==
                                entityType.PARAGRAPH
                            ) {
                                processed.push("\n");
                            } else {
                                processed.push(null)
                            }
                            addedToList = true
                            break;
                        }
                    }
                    if(!addedToList){
                        processed.push(null)
                    }
                }
                break;
        }
    }

    // console.log(entitiesList);
    // console.log(processed);

    // Filter out all Nulls
    const filtered = processed.filter(element => element !== null).join("");

    // Special case for if all elements were empty
    if (filtered.length === 0) {
        return "";
    }

    // Finally, trim again the end result
    return trimBeginAndEnd(filtered);
};

const blacklist = ["script", "style", "head"];
const entityType = {
    TEXT: "text",
    BREAK: "break",
    PARAGRAPH: "paragraph"
};
const processNode = (node, entityList) => {
    const tag = node.tagName && node.tagName.toLowerCase();

    // Filter blacklist
    if (blacklist.includes(tag)) {
        return;
    }

    // If this node has children
    if (node.hasChildNodes()) {
        // Process Preformatted Tags
        if (tag === "pre") {
            entityList.push({
                type: entityType.TEXT,
                content: node.textContent,
                condition: "pre"
            });
            return;
        }

        checkForBlockConstructs(tag, entityList);

        // Iterate
        node.childNodes.forEach(node => {
            // Process nodes recursively
            processNode(node, entityList);
        });

        checkForBlockConstructs(tag, entityList);
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
        case "img":
            // Count |alt| attribute of image tags as text
            if (node.hasAttribute("alt")) {
                addTextToEntities(` ${node.getAttribute("alt")}`, entityList);
            }
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

const blockConstructs = ["div", "p", "section"];
const checkForBlockConstructs = (tag, textEntries) => {
    // If this construct is a Run of Phrasing

    // P and Div have different behaviours
    // Specifically P will leave consecutive \n characters, whereas Div does not
    // Refer to Container and Paragraphs tests respectively

    if (blockConstructs.includes(tag)) {
        textEntries.push({ type: entityType.PARAGRAPH, tag: tag });
    }
};
