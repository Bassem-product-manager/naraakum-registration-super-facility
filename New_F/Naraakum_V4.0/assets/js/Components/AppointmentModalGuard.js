(function () {
  function cleanupModalState() {
    if (document.querySelector(".modal.show")) return;

    document.querySelectorAll(".modal-backdrop").forEach(function (backdrop) {
      backdrop.remove();
    });
    document.body.classList.remove("modal-open");
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-open-after-hide]").forEach(function (button) {
      button.addEventListener("click", function () {
        var targetSelector = button.getAttribute("data-open-after-hide");
        var parentSelector = button.getAttribute("data-parent-modal");
        var targetModal = document.querySelector(targetSelector);
        var parentModal = parentSelector
          ? document.querySelector(parentSelector)
          : button.closest(".modal");

        if (!targetModal || !window.bootstrap) return;

        var showTarget = function () {
          cleanupModalState();
          window.bootstrap.Modal.getOrCreateInstance(targetModal).show();
        };

        if (parentModal && parentModal.classList.contains("show")) {
          parentModal.addEventListener("hidden.bs.modal", showTarget, { once: true });
          window.bootstrap.Modal.getOrCreateInstance(parentModal).hide();
        } else {
          showTarget();
        }
      });
    });

    document.addEventListener("hidden.bs.modal", cleanupModalState);
  });
})();
