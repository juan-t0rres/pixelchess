document.querySelector("#join-button").addEventListener("click", () => {
  const input = document.querySelector(".room-input").value;
  if (input) window.location.pathname = "/" + input;
});

document.querySelector("#create-button").addEventListener("click", () => {
  const room = Math.random().toString(36).substr(2, 9);
  window.location.pathname = "/" + room;
});
