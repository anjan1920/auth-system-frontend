// prevent cached dashboard from showing after logout
window.addEventListener("pageshow", function (event) {
  if (
    event.persisted ||
    performance.getEntriesByType("navigation")[0]?.type === "back_forward"
  ) {
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


const globalLoader = document.getElementById("globalLoader");




init();

async function init() {
  await loadAdmin();
}



function showGlobalLoader(message = "Loading...") {
  if (!globalLoader) return;
  globalLoader.classList.remove("hidden");
  globalLoader.querySelector("p").textContent = message;
}

function hideGlobalLoader() {
  if (!globalLoader) return;
  globalLoader.classList.add("hidden");
}


async function loadAdmin() {

  showGlobalLoader("Checking admin access...");

  try {
    const res = await withTimeout(
      apiRequest(`${CONFIG.SERVER_URL}/api/v1/auth/current-user`, {
        method: "GET",
        credentials: "include"
      }),
      15000 
    );

    if (res.status === 401) {
      alert("Session expired. Please login again.");
      return redirectToLogin();
    }

    if (!res.ok) {
      alert("Unauthorized access");
      return redirectToLogin();
    }

    let data = {};
    try {
      data = await res.json();
    } catch {}

    if (!data?.data || data.data.role !== "admin") {
      alert("Access denied (Admin only)");
      return redirectToLogin();
    }

    pageBody.classList.remove("hidden");
    adminName.innerText = `Welcome ${data.data?.username || "Admin"}`;

  }catch (error) {
    console.error(error);

    if (error.message === "TIMEOUT") {
      displayBox.innerHTML = `
        <p class="text-red-400">Server is slow (cold start). Try again.</p>
      `;
    } else if (error.message === "NETWORK") {
      displayBox.innerHTML = `
        <p class="text-red-400">Check your internet connection.</p>
      `;
    } else {
      displayBox.innerHTML = `
        <p class="text-red-400">Something went wrong.</p>
      `;
    }
} finally {
    hideGlobalLoader();
  }
}

// common redirect
function redirectToLogin() {
  window.location.href = "./admin-Login.html";
}

// server health
document
  .getElementById("serverHealthBtn")
  .addEventListener("click", checkServerHealth);

async function checkServerHealth() {

  showBoxLoader("Checking server...");

  try {
    const res = await withTimeout(
      apiRequest(`${CONFIG.SERVER_URL}/api/v1/admin/healthcheck`, {
        method: "GET",
        credentials: "include"
      }),
      8000
    );

    let data = {};
    try {
      data = await res.json();
    } catch {}

    if (res.status === 401) {
      alert("Session expired");
      return redirectToLogin();
    }

    if (!res.ok) {
      displayBox.innerHTML = `
        <p class="text-red-400">${data.message || "Failed to fetch server health."}</p>
      `;
      return;
    }

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
    console.error(error);

    displayBox.innerHTML = `
      <p class="text-red-400">Server not reachable.</p>
    `;
  }
}


// users list

document
  .getElementById("checkUsersBtn")
  .addEventListener("click", loadUsers);

async function loadUsers() {

  showBoxLoader("Loading users...");

  try {
    const res = await withTimeout(
      apiRequest(`${CONFIG.SERVER_URL}/api/v1/admin/getAllUsers`, {
        method: "GET",
        credentials: "include"
      }),
      10000
    );

    let data = {};
    try {
      data = await res.json();
    } catch {}

    if (res.status === 401) {
      alert("Session expired");
      return redirectToLogin();
    }

    if (!res.ok) {
      displayBox.innerHTML = `
        <p class="text-red-400">${data.message || "Failed to load users."}</p>
      `;
      return;
    }

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

  }catch (error) {
  console.error(error);

  if (error.message === "TIMEOUT") {
    displayBox.innerHTML = `
      <p class="text-red-400">Server is slow (cold start). Try again.</p>
    `;
  } else if (error.message === "NETWORK") {
    displayBox.innerHTML = `
      <p class="text-red-400">Check your internet connection.</p>
    `;
  } else {
    displayBox.innerHTML = `
      <p class="text-red-400">Something went wrong.</p>
    `;
  }
}
}


// change password

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
      apiRequest(`${CONFIG.SERVER_URL}/api/v1/auth/change-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      }),
      10000
    );

    let data = {};
    try {
      data = await res.json();
    } catch {}

    if (res.status === 401) {
      alert("Session expired");
      return redirectToLogin();
    }

    if (!res.ok) {
      alert(data.message || "Password change failed");
      return;
    }

    alert("Password changed successfully");

  }catch (error) {
  console.error(error);

  if (error.message === "TIMEOUT") {
    displayBox.innerHTML = `
      <p class="text-red-400">Server is slow (cold start). Try again.</p>
    `;
  } else if (error.message === "NETWORK") {
    displayBox.innerHTML = `
      <p class="text-red-400">Check your internet connection.</p>
    `;
  } else {
    displayBox.innerHTML = `
      <p class="text-red-400">Something went wrong.</p>
    `;
  }
}
}

// logout

document
  .getElementById("logoutBtn")
  .addEventListener("click", logoutAdmin);

async function logoutAdmin() {

  try {
    const res = await withTimeout(
      apiRequest(`${CONFIG.SERVER_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include"
      }),
      8000
    );

    if (!res.ok) {
      alert("Logout failed");
      return;
    }

    window.location.href = "./admin-Login.html";

  } catch (error) {
  console.error(error);

  if (error.message === "TIMEOUT") {
    displayBox.innerHTML = `
      <p class="text-red-400">Server is slow (cold start). Try again.</p>
    `;
  } else if (error.message === "NETWORK") {
    displayBox.innerHTML = `
      <p class="text-red-400">Check your internet connection.</p>
    `;
  } else {
    displayBox.innerHTML = `
      <p class="text-red-400">Something went wrong.</p>
    `;
  }
}
}


// delete account
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
      apiRequest(`${CONFIG.SERVER_URL}/api/v1/auth/delete-me`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      }),
      10000
    );

    if (res.status === 401) {
      alert("Session expired");
      return redirectToLogin();
    }

    if (!res.ok) {
      alert("Failed to delete account");
      return;
    }

    alert("Account deleted");
    window.location.href = "./admin-Login.html";

  }catch (error) {
  console.error(error);

  if (error.message === "TIMEOUT") {
    displayBox.innerHTML = `
      <p class="text-red-400">Server is slow (cold start). Try again.</p>
    `;
  } else if (error.message === "NETWORK") {
    displayBox.innerHTML = `
      <p class="text-red-400">Check your internet connection.</p>
    `;
  } else {
    displayBox.innerHTML = `
      <p class="text-red-400">Something went wrong.</p>
    `;
  }
}
}

// helper functions
function showBoxLoader(message = "Loading...") {

  displayBox.classList.remove("hidden");

  displayBox.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-[150px] space-y-3">
      <div class="w-8 h-8 border-4 border-gray-600 border-t-amber-500 rounded-full animate-spin"></div>
      <p class="text-gray-400">${message}</p>
      <p class="text-xs text-gray-500">Server may take a few seconds...</p>
    </div>
  `;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}