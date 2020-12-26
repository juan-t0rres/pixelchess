function alphanumeric(inputtxt) {
  var letterNumber = /^[0-9a-zA-Z]+$/;
  if (inputtxt.value.match(letterNumber)) {
    return true;
  } else {
    return false;
  }
}

document.querySelector("#join-button").addEventListener("click", () => {
  const input = document.querySelector(".room-input").value;
  if (input && alphanumeric(input)) window.location.pathname = "/" + input;
});

document.querySelector("#create-button").addEventListener("click", () => {
  const room = Math.random().toString(36).substr(2, 9);
  window.location.pathname = "/" + room;
});
