globalThis.degausser = input => {
  var div = document.createElement("div");
  div.innerHTML = input;
  document.body.appendChild(div);
  Array.from(div.querySelectorAll("a, input")).forEach(el => {
    if (el.childNodes.length === 0) {
      el.outerHTML = el.alt || "";
    }
  });
  Array.from(div.querySelectorAll("img, area, image")).forEach(el => {
    if (el.childNodes.length === 0) {
      el.outerHTML = el.alt || String.fromCharCode(31).repeat(100);
    }
  });
  Array.from(div.querySelectorAll("wbr")).forEach(el => {
    if (el.childNodes.length === 0) {
      el.outerHTML = "&#8203;";
    }
  });
  Array.from(div.querySelectorAll("svg")).forEach(el => {
    el.outerHTML = el.innerHTML;
  });
  const text = div.innerText;
  div.remove();
  return text.normalize();
};
