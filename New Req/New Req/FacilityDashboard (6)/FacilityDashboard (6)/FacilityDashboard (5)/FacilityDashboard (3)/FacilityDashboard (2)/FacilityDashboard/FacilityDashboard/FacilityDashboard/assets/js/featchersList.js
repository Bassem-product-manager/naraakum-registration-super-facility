
function addInput() {
const fields = document.querySelector(".fields");

const container = document.createElement("div");
container.className = "row g-2 mb-2 input-container align-items-center";

const inputCol = document.createElement("div");
inputCol.className = "col-md-10";
const input = document.createElement("input");
input.type = "text";
input.className = "form-control form-control-44";
input.placeholder = "Write the feature";
inputCol.appendChild(input);

const btnCol = document.createElement("div");
btnCol.className = "col-md-2";
const deleteBtn = document.createElement("span");
deleteBtn.className = "btn btn-32 btn-outline-danger w-100";
deleteBtn.textContent = "Remove";
deleteBtn.onclick = function () {
    container.remove();
};
btnCol.appendChild(deleteBtn);

container.appendChild(inputCol);
container.appendChild(btnCol);

fields.appendChild(container);
}

function deleteInput(button) {
button.closest(".input-container").remove();
}
