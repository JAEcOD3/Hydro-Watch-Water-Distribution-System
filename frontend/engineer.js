// ==========================================
// HYDROWATCH - ENGINEER MAINTENANCE
// Handles the engineer's pipeline repair checklist.
// ==========================================

// Find all maintenance checklist items.
const repairTasks = document.querySelectorAll(".repair-task");

// Find the progress display.
const repairProgress = document.getElementById("repair-progress");

// Find the maintenance completion button.
const completeButton = document.getElementById("complete-maintenance-button");

// Find the maintenance status message.
const maintenanceStatus = document.getElementById("maintenance-status");

// Find the failed pipeline information display.
const engineerPipeline = document.getElementById("engineer-pipeline");

// Retrieve the failed pipeline ID saved by the main dashboard.
const failedPipelineId = localStorage.getItem("failedPipelineId");

// Display the pipeline assigned for maintenance.
engineerPipeline.textContent = failedPipelineId
    ? `Pipeline P${failedPipelineId} — Awaiting inspection and repair.`
    : "No failed pipeline has been assigned.";

// Store the total number of required maintenance tasks.
const totalTasks = repairTasks.length;

// Update the checklist progress whenever a task changes.
function updateRepairProgress() {

    // Count how many tasks the engineer has checked.
    const completedTasks = document.querySelectorAll(".repair-task:checked").length;

    // Update the progress text.
    repairProgress.textContent =
        `${completedTasks} of ${totalTasks} maintenance tasks completed.`;

    // Unlock the completion button only when every task is checked.
    completeButton.disabled = completedTasks !== totalTasks;
}

// Listen for changes to every maintenance checkbox.
repairTasks.forEach(task => {

    // Update the progress whenever the engineer checks or unchecks a task.
    task.addEventListener("change", updateRepairProgress);

});

// Handle the engineer's maintenance completion confirmation.
completeButton.addEventListener("click", () => {

    // Confirm that every maintenance task has been completed.
    const allTasksCompleted = document.querySelectorAll(".repair-task:checked").length === totalTasks;

    // Stop if any maintenance task is still incomplete.
    if (!allTasksCompleted) return;

    // Save the ID of the pipeline that the engineer has repaired.
localStorage.setItem(
    "maintenanceCompletePipelineId",
    failedPipelineId
);
// Return to the main dashboard after a short confirmation delay.
setTimeout(() => {
    window.location.href = "index.html";
}, 1500);
    // Update the maintenance status message.
    maintenanceStatus.textContent =
        "MAINTENANCE COMPLETE — Pipeline approved for restoration.";

    // Change the button to show successful completion.
    completeButton.textContent = "MAINTENANCE COMPLETED";

    // Prevent submitting the checklist again.
    completeButton.disabled = true;

});