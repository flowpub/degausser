const {
    blacklist,
    trimBeginAndEnd,
    collapseWhitespace,
    phrasingConstructs
} = require("./util");

module.exports = parentNode => {
    // If there's no Node, just return
    if (!parentNode) {
        return null;
    }

    // Tracking Entities
    const runs = [];
    let text = [];

    // let isInTableRow = false;
    let haveEncounteredFirstCell = false;

    let breakEntity = null;

    breakType = {
        NONE: "none",
        SINGLE: "single",
        DOUBLE: "double"
    };
    const addBreak = double => {
        if (breakEntity === null) {
            // The only time it should be null is at the beginning of document
            return;
        }

        processText();
        if (double) {
            breakEntity = breakType.DOUBLE;
        } else if (breakEntity !== breakType.DOUBLE) {
            breakEntity = breakType.SINGLE;
        }
    };
    const processBreaks = () => {
        if (!breakEntity) {
            return;
        }

        switch (breakEntity) {
            case breakType.SINGLE:
                runs.push("\n");
                break;
            case breakType.DOUBLE:
                runs.push("\n\n");
                break;
        }

        breakEntity = breakType.NONE;
    };
    const pushText = string => {
        // Trim
        const trimmed = trimBeginAndEnd(string);
        if (!trimmed) {
            return;
        }

        processBreaks();
        text.push(string);
    };
    const processText = () => {
        if (text.length === 0) {
            return;
        }

        // Trim
        const trimmed = trimBeginAndEnd(text.join(""));
        if (!trimmed) {
            // Trimmed into an empty string
            //  Preserve all preceding breaks
            text = [];
            return;
        }

        if (breakEntity === null) {
            breakEntity = breakType.NONE;
        }

        runs.push(trimBeginAndEnd(collapseWhitespace(trimmed)));
        text = [];
    };

    const processBlockConstruct = (tag, opening) => {
        // Not a phrasing construct, therefore is Block
        if (!phrasingConstructs.includes(tag)) {
            processText();

            if (tag === "tr") {
                // isInTableRow = opening;
                haveEncounteredFirstCell = false;
            }

            if (tag === "th" || tag === "td") {
                if (opening) {
                    // I'm assuming the DOM will fix all table element malformations
                    if (!haveEncounteredFirstCell) {
                        haveEncounteredFirstCell = true;
                    } else {
                        processBreaks();
                        runs.push("\t");
                    }
                }
                return;
            }

            if (tag === "p") {
                // console.log(breakEntity);
                addBreak(true);
            }

            addBreak(false);
        }
    };

    const processNode = node => {
        const tag = node.tagName && node.tagName.toLowerCase();

        if (blacklist.includes(tag)) {
            // console.log(tag)
            return;
        }

        // if (!blacklist.includes(tag)) {
        // Process Preformatted Tags
        if (tag === "pre") {
            processText();
            addBreak(false);
            processBreaks();

            // Push straight into Runs
            runs.push(node.textContent);
            breakEntity = breakType.SINGLE;
            return;
        }

        if (node.nodeType === Node.TEXT_NODE) {
            const normalized = node.textContent.normalize();

            

            // Process preceding break, and push text
            pushText(normalized);
            return;
        }

        processBlockConstruct(tag, true);
        // }

        if (node.hasChildNodes()) {
            node.childNodes.forEach(child => {
                processNode(child);
            });
        }

        // if (!blacklist.includes(tag)) {
        // console.log(tag);
        processBlockConstruct(tag, false);

        if (node.nodeType === Node.ELEMENT_NODE) {
            // Process other tags

            switch (tag) {
                case "br":
                    processText();
                    processBreaks();
                    runs.push("\n");
                    break;
                case "wbr":
                    pushText("\u200B");
                    break;
            }

            if (node.hasAttribute("alt")) {
                pushText(` ${node.getAttribute("alt")} `);
            }
        }
        // }
    };

    processNode(parentNode);

    // Get any stragglers
    processText();

    console.log(runs);
    console.log(breakEntity)

    return runs.join("");
};
