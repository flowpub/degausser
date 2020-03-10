import degausser from "../../src/degausser";

describe("Testing input node types", () => {
    test("Document Node", () => {
        document.documentElement.innerHTML = "<div>Hi!</div>";

        expect(degausser(document)).toBe("Hi!");
    });

    test("DocumentFragment Node", () => {
        const fragment = document.createDocumentFragment();
        
        let element = document.createElement("p");
        element.innerHTML = 'Ho!'
        fragment.appendChild( element );

        element = document.createElement("p");
        element.innerHTML = 'Ho!'
        fragment.appendChild( element );

        expect(degausser(fragment)).toBe("Ho!\n\nHo!");
    });
});
