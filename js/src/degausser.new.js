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
    // const addBreak = double => {
    //     if (breakEntity === null) {
    //         // The only time it should be null is at the beginning of document
    //         return;
    //     }

    //     processText();
    //     if (double) {
    //         breakEntity = breakType.DOUBLE;
    //     } else if (breakEntity !== breakType.DOUBLE) {
    //         breakEntity = breakType.SINGLE;
    //     }
    // };
    
    // const processBreaks = () => {
    //     if (!breakEntity) {
    //         return;
    //     }

    //     switch (breakEntity) {
    //         case breakType.SINGLE:
    //             runs.push("\n");
    //             break;
    //         case breakType.DOUBLE:
    //             runs.push("\n\n");
    //             break;
    //     }

    //     breakEntity = breakType.NONE;
    // };

    const processTextNode = node => {};
    const processElementNode = node => {

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
};
