console.log("admin login page loaded");

import { apiRequest } from "./api.js";
import { CONFIG } from "./config.js";
import { withTimeout } from "./timeout.js";

const loader = document.getElementById("loader");
const form = document.getElementById("adminLoginForm");
const errorBox = document.getElementById("errorMsg");
const loginBtn = document.getElementById("loginBtn");

init();

function init() {
  showLoader("checking session...");
  checkAuth();
}

async function checkAuth() {
  try {

    const res = await withTimeout(
      apiRequest(`${CONFIG.SERVER_URL}/api/v1/auth/current-user`, {
        method: "GET",
        credentials: "include"
      }),
      8000
    );

    if (!res.ok) {
      return;
    }

    let data;
    try {
      data = await res.json();
    } catch {
      return;
    }

    if (!data.success) {
      return;
    }

    if (data.data?.role === "admin") {
      redirectToDashboard();
    }

  } catch (error) {

    if (error.message === "TIMEOUT") {
      showError("server is waking up, please wait");
    } else if (error.message === "NETWORK") {
      showError("check your internet connection");
    }

  } finally {
    hideLoader();
  }
}

form.addEventListener("submit", handleLoginSubmit);

async function handleLoginSubmit(e) {
  e.preventDefault();

  clearError();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await loginAdmin(email, password);
}

async function loginAdmin(email, password) {

  setLoadingState(true);

  try {

    const res = await withTimeout(
      apiRequest(`${CONFIG.SERVER_URL}/api/v1/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      }),
      10000
    );

    let data = {};
    try {
      data = await res.json();
    } catch {}

    if (!res.ok) {
      showError(data.message || "admin login failed");
      return;
    }

    redirectToDashboard();

  } catch (err) {

    if (err.message === "TIMEOUT") {
      showError("server is slow, try again");
    } else if (err.message === "NETWORK") {
      showError("check your internet connection");
    } else {
      showError("server error");
    }

  } finally {
    setLoadingState(false);
  }
}

function redirectToDashboard() {
  window.location.href = "/pages/admin-dashboard.html";
}

function showError(message) {
  errorBox.textContent = message;
}

function clearError() {
  errorBox.textContent = "";
}

function showLoader(message = "loading...") {
  loader.classList.remove("hidden");
  loader.querySelector("p").textContent = message;
}

function hideLoader() {
  loader.classList.add("hidden");
}

function setLoadingState(isLoading) {

  if (!loginBtn) return;

  if (isLoading) {
    loginBtn.disabled = true;
    loginBtn.innerHTML = `
      <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
      logging in...
    `;
  } else {
    loginBtn.disabled = false;
    loginBtn.innerHTML = "Sign in as Admin";
  }
}