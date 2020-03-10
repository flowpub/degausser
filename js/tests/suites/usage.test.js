import degausser from "../../src/degausser";

describe("Testing input node types", () => {
    test("Document Node", () => {
        document.documentElement.innerHTML = "<div>Hi!</div>";

        expect(degausser(document)).toBe("Hi!");
    });

    test("DocumentFragment Node", () => {
        const fragment = document.createDocumentFragment();

        let element = document.createElement("p");
        element.innerHTML = "Ho!";
        fragment.appendChild(element);

        element = document.createElement("p");
        element.innerHTML = "Ho!";
        fragment.appendChild(element);

        expect(degausser(fragment)).toBe("Ho!\n\nHo!");
    });

    test("Element Node", () => {
        const element = document.createElement("p");
        element.innerHTML = "Hey!";

        expect(degausser(element)).toBe("Hey!");
    });

    test("Text Node", () => {
        const text = document.createTextNode("Yo");

        expect(degausser(text)).toBe("Yo");
    });

    test("Comment Node", () => {

        const comment = document.createComment("This is a comment");

        expect(degausser(comment)).toBe("");

    });
});
