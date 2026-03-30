import { CONFIG } from "./config.js";
import { withTimeout } from "./timeout.js";
import { apiRequest } from "./api.js";

let form;
let loader;
let errorBox;
let loginBtn;

document.addEventListener("DOMContentLoaded", () => {
  form = document.getElementById("loginForm");
  loader = document.getElementById("loader");
  errorBox = document.getElementById("errorMsg");
  loginBtn = document.querySelector("button[type='submit']");

  init();

  if (!form) return;

  form.addEventListener("submit", handleLoginSubmit);
});

async function init() {
  showPageLoader();

  await Promise.all([
    checkAuth(),
    new Promise(res => setTimeout(res, 500))
  ]);

  hidePageLoader();
}

async function checkAuth() {
  try {
    const res = await withTimeout(
      apiRequest(`${CONFIG.SERVER_URL}/api/v1/auth/current-user`, {
        method: "GET",
        credentials: "include"
      }),
      5000
    );

    if (!res.ok) return;

    const data = await res.json();

    if (data?.success) {
      window.location.href = "./dashboard.html";
    }
  } catch (err) {}
}

async function handleLoginSubmit(e) {
  e.preventDefault();

  clearError();

  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  await loginUser(email, password);
}

async function loginUser(email, password) {
  setLoadingState(true);

  try {
    const res = await withTimeout(
      apiRequest(`${CONFIG.SERVER_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      }),
      20000
    );

    let data = {};
    try {
      data = await res.json();
    } catch {}

    if (!res.ok) {
      showError(data.message || "Invalid credentials");
      return;
    }

    window.location.href = "./dashboard.html";

  } catch (err) {

    if (err.message === "TIMEOUT") {
      showError("Server is waking up. Try again in a few seconds.");
    } 
    else if (err.message === "Failed to fetch") {
      showError("Check your internet connection.");
    } 
    else {
      showError("Login failed");
    }

  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(isLoading) {
  if (!loginBtn) return;

  if (isLoading) {
    loginBtn.disabled = true;
    loginBtn.innerHTML = `
      <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
      Logging in...
    `;
  } else {
    loginBtn.disabled = false;
    loginBtn.innerHTML = "Sign in";
  }
}

function showPageLoader() {
  if (loader) loader.style.display = "flex";
}

function hidePageLoader() {
  if (loader) loader.style.display = "none";
}

function showError(message) {
  if (!errorBox) return;
  errorBox.textContent = message;
}

function clearError() {
  if (!errorBox) return;
  errorBox.textContent = "";
}