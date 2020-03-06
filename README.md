# degausser

Implementations of HTML to plain text conversion.

For when you want to eliminate HTML tags, leaving a reasonable text-only rendering.

The target algorithm is similar to the [`HTMLElement.innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText) property of the HTML5 DOM.
With the limitation of not taking into account layout or styling.
