
// Prevent cached dashboard from showing after logout
window.addEventListener("pageshow", function (event) {
  if (event.persisted || performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
    window.location.reload();
  }
});

console.log("Admin dashboard loaded");

import { apiRequest } from "./api.js";
import { withTimeout } from "./timeout.js";
import { CONFIG } from "./config.js";

const adminName = document.getElementById("adminName");
const displayBox = document.getElementById("displayBox");
const pageBody = document.getElementById("pageBody");

init();

async function init() {
  await loadAdmin();
}

async function loadAdmin() {
  try {

    const res = await withTimeout(
      apiRequest(
        `${CONFIG.SERVER_URL}/api/v1/auth/current-user`,
        {
          method: "GET",
          credentials: "include"
        }
      ),
      8000 // timeout added
    );

    if (!res.ok) {
      window.location.href = "./admin-login.html";
      return;
    }

    let data = {};
    try {
      data = await res.json();
    } catch {}

    // show dashboard only after auth success
    pageBody.classList.remove("hidden");

   // console.log(data);

    adminName.innerText = `Welcome ${data.data?.username || "Admin"}`;

  } catch (error) {
    window.location.href = "./admin-login.html";
  }
}

//Server Health Check Section
document
  .getElementById("serverHealthBtn")
  .addEventListener("click", checkServerHealth);

async function checkServerHealth() {

  showBoxLoader("Checking server...");

  try {

    const res = await withTimeout(
      apiRequest(
        `${CONFIG.SERVER_URL}/api/v1/admin/healthcheck`,
        { method: "GET", credentials: "include" }
      ),
      8000
    );

    if (!res.ok) {
      displayBox.innerHTML = `
        <p class="text-red-400">Failed to fetch server health.</p>
      `;
      return;
    }

    let data = {};
    try {
      data = await res.json();
    } catch {}

    await delay(500);

    const health = data.data;

    displayBox.innerHTML = `
      <h3 class="text-lg font-semibold mb-3">Server Health</h3>

      <p><b>Status:</b> ${health?.status?.server || "Running"}</p>
      <p><b>Message:</b> ${health?.message}</p>
      <p><b>Uptime:</b> ${health?.uptime}</p>
      <p><b>Timestamp:</b> ${health?.timestamp}</p>
      <p><b>Memory used:</b> ${health?.status?.memory_used_percent || "N/A"}%</p>
    `;

  } catch (error) {

    displayBox.innerHTML = `
      <p class="text-red-400">Server not reachable.</p>
    `;

  }
}

//users Management Section
document
  .getElementById("checkUsersBtn")
  .addEventListener("click", loadUsers);

async function loadUsers() {

  showBoxLoader("Loading users...");

  try {

    const res = await withTimeout(
      apiRequest(
        `${CONFIG.SERVER_URL}/api/v1/admin/getAllUsers`,
        { method: "GET", credentials: "include" }
      ),
      10000
    );

    if (!res.ok) {
      displayBox.innerHTML = `
        <p class="text-red-400">Failed to load users.</p>
      `;
      return;
    }

    let data = {};
    try {
      data = await res.json();
    } catch {}

    await delay(500);

    const users = data.users;

    if (!users || users.length === 0) {
      displayBox.innerHTML = "<p>No users found</p>";
      return;
    }

    let html = `
      <h3 class="text-lg font-semibold mb-3">
        Users (${data.totalUsers})
      </h3>

      <div class="space-y-2">
    `;

    users.forEach(user => {

      html += `
        <div class="border-b border-gray-700 pb-2">
          <p>UserName: ${user.username}</p>
          <p>Verified: ${user.isEmailVerified ? "✔ Yes" : "❌ No"}</p>
        </div>
      `;

    });

    html += `</div>`;

    displayBox.innerHTML = html;

  } catch (error) {

    displayBox.innerHTML = `
      <p class="text-red-400">Server error while fetching users.</p>
    `;

  }
}

//change Password Section
document
  .getElementById("changePasswordBtn")
  .addEventListener("click", changePassword);

async function changePassword() {

  const oldPassword = prompt("Enter current password:");

  if (!oldPassword) return;

  const newPassword = prompt("Enter new password:");

  if (!newPassword) return;

  try {

    const res = await withTimeout(
      apiRequest(
        `${CONFIG.SERVER_URL}/api/v1/auth/change-password`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oldPassword,
            newPassword
          })
        }
      ),
      10000
    );

    let data = {};
    try {
      data = await res.json();
    } catch {}

    if (!res.ok) {
      alert(data.message || "Password change failed");
      return;
    }

    alert("Password changed successfully");

  } catch (error) {

    console.error(error);
    alert("Server error");

  }
}

//login

document
  .getElementById("logoutBtn")
  .addEventListener("click", logoutAdmin);

async function logoutAdmin() {

  try {

    const res = await withTimeout(
      apiRequest(
        `${CONFIG.SERVER_URL}/api/v1/auth/logout`,
        {
          method: "POST",
          credentials: "include"
        }
      ),
      8000
    );

    if (!res.ok) {
      alert("Logout failed");
      return;
    }

    window.location.href = "./admin-login.html";

  } catch (error) {

    console.error("Server error:", error);
    alert("Server not reachable. Please try again.");

  }
}

//delete Account Section
document
  .getElementById("deleteAccountBtn")
  .addEventListener("click", deleteAccount);

async function deleteAccount() {

  const confirmDelete = confirm(
    "Are you sure you want to delete your admin account?"
  );

  if (!confirmDelete) return;

  const password = prompt("Enter password to confirm:");

  if (!password) return;

  try {

    const res = await withTimeout(
      apiRequest(
        `${CONFIG.SERVER_URL}/api/v1/delete-me`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password })
        }
      ),
      10000
    );

    if (!res.ok) {
      alert("Failed to delete account");
      return;
    }

    alert("Account deleted");

    window.location.href = "./admin-login.html";

  } catch (error) {

    alert("Server error while deleting account");

  }
}

// Helper Functions
function showBoxLoader(message = "Loading...") {

  displayBox.classList.remove("hidden");

  displayBox.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-[150px] space-y-3">
      <div class="w-8 h-8 border-4 border-gray-600 border-t-amber-500 rounded-full animate-spin"></div>
      <p class="text-gray-400">${message}</p>
    </div>
  `;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}