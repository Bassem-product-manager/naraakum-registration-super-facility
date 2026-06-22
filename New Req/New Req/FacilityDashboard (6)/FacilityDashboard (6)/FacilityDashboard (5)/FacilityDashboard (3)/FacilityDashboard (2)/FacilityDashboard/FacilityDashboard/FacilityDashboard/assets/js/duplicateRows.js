function addRow() {
    const container = document.getElementById("rows-container");

   
    const wrapper = document.createElement("div");
    wrapper.className = "row-wrapper";

     
    wrapper.innerHTML = `
      <div class="row g-1">
        <div class="col-4">
          <input type="text" placeholder="الصف الدراسي" class="form-control form-control-40" required />
        </div>
        <div class="col-4">
          <input type="text" placeholder="المستوى" class="form-control form-control-40" required />
        </div>
        <div class="col-2">
          <input type="text" placeholder="عدد الاسئلة" class="form-control form-control-40" required />
        </div>
        <div class="col-2">
          <input type="text" placeholder="المدة بالدقايق" class="form-control form-control-40" required />
        </div>
      </div>
      <div class="delete-container">
        <button type="button" class="delete-btn" onclick="deleteRow(this)"></button>
      </div>
    `;

    container.appendChild(wrapper);
  }

  function deleteRow(button) {
    const wrapper = button.closest(".row-wrapper");
    wrapper.remove();
  }