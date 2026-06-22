const passwordInput = document.querySelectorAll(".password-input");
passwordInput.forEach((item) => {
  const showPasswordButton = item.querySelector(".fi");
  const passwordInput = item.querySelector("input");

  showPasswordButton.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    //------

    showPasswordButton.classList.toggle("fi-sr-eye");
    showPasswordButton.classList.toggle("fi-sr-eye-crossed");
  });
});
