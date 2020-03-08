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

    let lastBreak = null;
    breakType = {
        NONE: "none",
        SINGLE: "single",
        DOUBLE: "double"
    };
    const addBreak = double => {
        if (lastBreak === null) {
            // The only time it should be null is at the beginning of document
            return;
        }

        if (double) {
            lastBreak = breakType.DOUBLE;
        } else if (lastBreak !== breakType.DOUBLE) {
            lastBreak = breakType.SINGLE;
        }
    };
    const processBreaks = () => {
        if (!lastBreak) {
            return;
        }

        switch (lastBreak) {
            case breakType.SINGLE:
                runs.push("\n");
                break;
            case breakType.DOUBLE:
                runs.push("\n\n");
                break;
        }

        lastBreak = breakType.NONE;
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

        if(lastBreak === null ){
            lastBreak = breakType.NONE;
        }

        runs.push(trimBeginAndEnd(collapseWhitespace(trimmed)));
        text = [];
    };

    const processBlockConstruct = (tag, opening) => {
        if (phrasingConstructs.includes(tag)) {
            return;
        }

        // Not a phrasing construct, therefore is Block
        if (tag === "th" || tag === "td") {
            // Special Block
            if (opening) {
                // I'm assuming the DOM will fix all table element malformations
                if (!haveEncounteredFirstCell) {
                    haveEncounteredFirstCell = true;
                } else {
                    processBreaks();
                    runs.push("\t");
                }
            } else {
                processText()
            }
            return;
        }

        // Regular Blocks
        processText();

        if (tag === "tr") {
            haveEncounteredFirstCell = false;
        }

        if (tag === "p") {
            addBreak(true);
        }

        addBreak(false);
    };

    const processTextNode = node => {
        const string = node.textContent.normalize();

        // Trim
        const trimmed = trimBeginAndEnd(string);
        if (trimmed) {
            processBreaks();
        }

        text.push(string);
    };
    const processElementNode = node => {
        const tag = node.tagName && node.tagName.toLowerCase();

        // Special case for Preformatted
        if (tag === "pre") {
            processText();
            addBreak(false);
            processBreaks();

            runs.push(node.textContent);
            lastBreak = breakType.SINGLE
            return;
        }

        processBlockConstruct(tag, true);

        if (node.hasChildNodes()) {
            node.childNodes.forEach(child => {
                processNode(child);
            });
        }

        processBlockConstruct(tag, false);

        // Process other tags
        switch (tag) {
            case "br":
                processText();
                processBreaks();
                runs.push("\n");
                break;
            case "wbr":
                text.push("\u200B");
                break;
        }

        if (node.hasAttribute("alt")) {
            text.push(` ${node.getAttribute("alt")} `);
        }
    };

    const processNode = node => {
        if (node.nodeType === Node.TEXT_NODE) {
            processTextNode(node);
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (blacklist.includes(node.tagName.toLowerCase())) {
                // console.log(tag)
                return;
            }
            processElementNode(node);
        }
    };

    processNode(parentNode);

    // Get any stragglers
    processText();

    // console.log(runs);
    // console.log(lastBreak);

    return runs.join("");
};
