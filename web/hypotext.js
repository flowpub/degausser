globalThis.hypotext = input => {
  var div = document.createElement("div");
  div.innerHTML = input;
  document.body.appendChild(div);
  Array.from(div.querySelectorAll("a, img")).forEach(el => {
    if (el.childNodes.length === 0) {
      el.outerHTML = el.alt || "";
    }
  });
  const text = div.innerText;
  div.remove();
  return text
    .normalize()
    .replace(/^[ \t\r\n]+/g, "")
    .replace(/[ \t\r\n]+$/g, "");
};
