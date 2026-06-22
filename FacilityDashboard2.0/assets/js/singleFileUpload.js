 
const imageInputs = document.querySelectorAll(".image-input");
const removeImageBtn = document.querySelectorAll(".remove-btn");
imageInputs.forEach((input) => {
  input.addEventListener("change", function () {
    const file = this.files[0];
    const previewContainer =
      this.parentElement.parentElement.querySelector(
        ".preview-container"
      );
    const previewImage =
      this.parentElement.parentElement.querySelector(".preview-image");
    const removeBtn =
      this.parentElement.parentElement.querySelector(".remove-btn");

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewContainer.style.display = "inline-block";
      };
      reader.readAsDataURL(file);
    }

    removeBtn.addEventListener("click", function () {
      previewImage.src = "";
      previewContainer.style.display = "none";
      input.value = "";
    });
  });
});

removeImageBtn.forEach((item) => {
  item.addEventListener("click", function () {
    this.parentElement.parentElement.querySelector(
      ".preview-container"
    ).style.display = "none";

    this.parentElement.parentElement.querySelector(".image-input").value =
      "";
  });
});
 