module.exports = parentNode => {
    if (!parentNode) {
        return null;
    }

    const leafConstructs = [];
    const stack = [];

    // Lets start with the top node
    let currentNode = { node: parentNode, processedChildren: false };

    do {
        const node = currentNode.node;
        const tag = node.tagName && node.tagName.toLowerCase()

        if (
            !currentNode.processedChildren &&
            node.hasChildNodes()
        ) {
            if( tag === 'div' && leafConstructs[leafConstructs.length-1] !== '\n'){
                leafConstructs.push("\n");
            }

            currentNode.processedChildren = true;
            stack.push(currentNode);
            currentNode = {
                node: node.firstChild,
                processedChildren: false
            };
            continue;
        }

        // If node had no children
        if (!currentNode.processedChildren) {
            if (node.nodeType === Node.TEXT_NODE) {
                leafConstructs.push(node.textContent);
            } else {
                if (tag === "br") {
                    leafConstructs.push("\n");
                }
            }
        }

        if( tag === 'div') {
            leafConstructs.push('\n')
        }

        // Move on
        if (node.nextSibling) {
            currentNode = { node: node.nextSibling, processedChildren: false };
        } else {
            // If this is the end of a list of children

            currentNode = stack.pop();
        }
    } while (currentNode);

    const map = leafConstructs.join("");

    return map;
};
