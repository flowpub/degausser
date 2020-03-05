globalThis.hypotext = input => {
  var div = document.createElement("div");
  div.innerHTML = input;
  document.body.appendChild(div);
  Array.from(div.querySelectorAll("a, img, area, input")).forEach(el => {
    if (el.childNodes.length === 0) {
      el.outerHTML = el.alt || "";
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
