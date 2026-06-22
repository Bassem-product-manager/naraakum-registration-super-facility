document.addEventListener("DOMContentLoaded", function () {
  const pendingList = document.querySelector("[data-pending-task-list]");
  const completedList = document.querySelector("[data-completed-task-list]");
  const pendingCount = document.querySelector("[data-pending-count]");
  const completedCount = document.querySelector("[data-completed-count]");
  const pendingEmpty = document.querySelector("[data-pending-empty]");
  const completedEmpty = document.querySelector("[data-completed-empty]");
  const scaleStatusBadge = document.querySelector("[data-scale-device-status]");
  const scaleStatusName = document.querySelector("[data-scale-device-name]");
  const scaleStatusLabel = document.querySelector("[data-scale-device-label]");
  const scaleActionSlot = document.querySelector("[data-scale-device-action]");

  function refreshTaskCounts() {
    if (!pendingList || !completedList) {
      return;
    }

    const pendingItems = pendingList.querySelectorAll("[data-task-id]");
    const completedItems = completedList.querySelectorAll("[data-task-id]");

    if (pendingCount) {
      pendingCount.textContent = pendingItems.length;
    }

    if (completedCount) {
      completedCount.textContent = completedItems.length;
    }

    if (pendingEmpty) {
      pendingEmpty.classList.toggle("d-none", pendingItems.length > 0);
    }

    if (completedEmpty) {
      completedEmpty.classList.toggle("d-none", completedItems.length > 0);
    }
  }

  function markScaleAsConnected() {
    if (scaleStatusBadge) {
      scaleStatusBadge.textContent = "\u0645\u062a\u0635\u0644";
      scaleStatusBadge.classList.remove("text-bg-warning");
      scaleStatusBadge.classList.add("text-bg-success");
    }

    if (scaleStatusLabel) {
      scaleStatusLabel.textContent =
        "\u062c\u0647\u0627\u0632 \u0642\u064a\u0627\u0633 \u0627\u0644\u0648\u0632\u0646";
    }

    if (scaleStatusName) {
      scaleStatusName.textContent = "Huawei Scale 3 Pro";
    }

    if (scaleActionSlot) {
      scaleActionSlot.innerHTML =
        '<span class="device-sync-note">\u062a\u0645 \u0631\u0628\u0637 \u0627\u0644\u062c\u0647\u0627\u0632</span>';
    }
  }

  function completePatientTask(taskId) {
    if (!pendingList || !completedList) {
      return;
    }

    const taskItem = pendingList.querySelector(`[data-task-id="${taskId}"]`);
    if (!taskItem) {
      return;
    }

    const actionSlot = taskItem.querySelector("[data-task-action-slot]");
    if (actionSlot) {
      actionSlot.innerHTML =
        '<span class="completed-badge">\u062a\u0645\u062a</span>';
    }

    taskItem.classList.add("is-done");
    completedList.prepend(taskItem);

    if (taskId === "scale-connect") {
      markScaleAsConnected();
    }

    refreshTaskCounts();
  }

  document.addEventListener("click", function (event) {
    const completeButton = event.target.closest("[data-complete-patient-task]");
    if (!completeButton) {
      return;
    }

    const taskId = completeButton.getAttribute("data-complete-patient-task");
    completePatientTask(taskId);
  });

  refreshTaskCounts();
});
