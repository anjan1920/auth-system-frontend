//console.log("🚀 Dashboard JS loaded");

import { withTimeout } from "./timeout.js";
import { CONFIG } from "./config.js";

let logoutBtn;
let userName;
let emailText;
let changePasswordBtn;
let deleteAccountBtn;
let loader;


document.addEventListener("DOMContentLoaded", () => {
  //console.log(" DOM loaded - dashboard");

  logoutBtn = document.getElementById("logoutBtn");
  userName = document.getElementById("userName");
  emailText = document.getElementById("email");
  changePasswordBtn = document.getElementById("changePasswordBtn");
  deleteAccountBtn = document.getElementById("deleteAccountBtn");
  loader = document.getElementById("loader");

  

  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
  if (changePasswordBtn) changePasswordBtn.addEventListener("click", handleChangePassword);
  if (deleteAccountBtn) deleteAccountBtn.addEventListener("click", handleDeleteAccount);

  checkAuth();
});




function showLoader() {
  if (loader) loader.classList.remove("hidden");
}

function hideLoader() {
  if (loader) loader.classList.add("hidden");
}




async function checkAuth() {

  ////console.log(" checkAuth START");

  showLoader();

  try {

    const res = await withTimeout(

      fetch(`${CONFIG.SERVER_URL}/api/v1/auth/current-user`, {
        method: "GET",
        credentials: "include"
      }),

      20000
    );

    ////console.log(" Response:", res.status);

    let data = {};
    try {
      data = await res.json();
    } catch {
      console.error(" JSON parse failed");
    }

    ////console.log(" Auth Data:", data);

    if (!res.ok || !data?.success || !data?.data) {
      console.warn(" Not authenticated");
      redirectToLogin();
      return;
    }

    const user = data.data;

    ////console.log(" User:", user);

    // update UI
    if (userName) userName.textContent = user.username;
    if (emailText) emailText.textContent = user.email;

    ////console.log(" UI updated");

  } catch (err) {

    console.error(" Auth error:", err);

    redirectToLogin();

  } finally {
    hideLoader();
    ////console.log(" checkAuth END");
  }
}


//  LOGOUT 

async function handleLogout() {

  ////console.log(" Logout clicked");

  try {

    await withTimeout(

      fetch(`${CONFIG.SERVER_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include"
      }),

      10000
    );

    ////console.log(" Logout success");

  } catch (err) {
    console.error(" Logout error:", err);
  }

  redirectToLogin();
}




async function handleChangePassword() {

  const btn = changePasswordBtn;

  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;

  ////console.log(" Change password clicked");

  if (!oldPassword || !newPassword) {
    alert("Fill all fields");
    return;
  }

  try {

    btn.textContent = "Updating...";
    btn.disabled = true;

    const res = await fetch(`${CONFIG.SERVER_URL}/api/v1/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ oldPassword, newPassword })
    });

    let data = {};
    try {
      data = await res.json();
    } catch {}

    ////console.log(" Change Password Response:", data);

    if (!res.ok) {
      alert(data.message || "Failed to change password");
      return;
    }

    alert(" Password updated successfully");

  } catch (err) {

    console.error(" Change password error:", err);
    alert("Something went wrong");

  } finally {

    btn.textContent = "Change Password";
    btn.disabled = false;
  }
}



async function handleDeleteAccount() {

  const btn = deleteAccountBtn;

  ////console.log(" Delete account clicked");


  const password = prompt("Enter your password to confirm account deletion:");

  if (!password) {
    alert("Password is required");
    return;
  }

  const confirmDelete = confirm("Are you sure? This action cannot be undone!");
  if (!confirmDelete) return;

  try {

    btn.textContent = "Deleting...";
    btn.disabled = true;

    const res = await fetch(`${CONFIG.SERVER_URL}/api/v1/auth/delete-me`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ password }) 
    });

    let data = {};
    try {
      data = await res.json();
    } catch {}

    ////console.log(" Delete Response:", data);

    if (!res.ok) {
      alert(data.message || "Delete failed");
      return;
    }

    alert(" Account deleted successfully");

    redirectToLogin();

  } catch (err) {

    console.error("Delete error:", err);
    alert("Something went wrong");

  } finally {

    btn.textContent = "Delete Account";
    btn.disabled = false;
  }
}


function redirectToLogin() {
  //console.log(" Redirecting to login");
  window.location.href = "./index.html";
}