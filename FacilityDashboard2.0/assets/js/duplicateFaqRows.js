let faqCounter = 2;

function addFaqRow() {
  const container = document.getElementById("faqContainer");

  const block = document.createElement("div");
  block.className = "row g-2 faq-block mb-12";

  block.innerHTML = `
  <div class="col-12 radius-12 " style="background-color: antiquewhite;">
    <div class="row justify-content-between p-12">
      <div class="col-auto semiBold">السؤال  </div>
      <div class="col-auto">
        <button type="button" class="btn btn-outline-danger" onclick="deleteFaqRow(this)">حذف</button>
      </div>
    </div>
  </div>
  <div class="col-12">
    <input type="text"  placeholder="عنوان السؤال" class="form-control form-control-40" required />
  </div>
  <div class="col-12">
    <textarea rows="2" placeholder="الإجابة" class="form-control" required></textarea>
  </div>
`;

  container.appendChild(block);
  faqCounter++;
}

function deleteFaqRow(button) {
  const block = button.closest(".faq-block");
  block.remove();
}