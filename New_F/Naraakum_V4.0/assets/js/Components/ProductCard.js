(function () {
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-name]");
    if (!btn) return;
    const card = btn.closest(".productCard");
    const action = btn.dataset.name;

    if (action === "addProductToCard") {
      card.classList.add("selectedCard");
    }
    if (action === "removeProductFromCard") {
      card.classList.remove("selectedCard");
    }
  });
})();
