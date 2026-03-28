console.log("Login page loaded");

import { CONFIG } from "./config.js";

let form;
let loader;
let errorBox;
let loginBtn;

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded - login");

  form = document.getElementById("loginForm");
  loader = document.getElementById("loader");
  errorBox = document.getElementById("errorMsg");
  loginBtn = document.querySelector("button[type='submit']"); 

 

  // force hide loader
  if (loader) {
    loader.style.display = "none";
    console.log("Loader hidden");
  }

  if (!form) {
    console.error("Form NOT found ❌");
    return;
  }

  // CLICK DEBUG
  form.addEventListener("click", () => {
    console.log("Form clicked ✅");
  });

  // SUBMIT DEBUG
  form.addEventListener("submit", handleLoginSubmit);

  console.log("Event listener attached ✅");
});


// submit handler
async function handleLoginSubmit(e) {
  e.preventDefault();

 // console.log("FORM SUBMIT TRIGGERED");

  clearError();

  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  console.log("Email:", email);
  console.log("Password:", password);

  await loginUser(email, password);
}


// login function
async function loginUser(email, password) {

  setLoadingState(true); 

  try {
    //console.log(" Sending login request...");

    const res = await fetch(`${CONFIG.SERVER_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ email, password })
    });

    //console.log(" Response received:", res.status);

    let data = {};
    try {
      data = await res.json();
    } catch {}

    //console.log(" Data:", data);

    if (!res.ok) {
      showError(data.message || "Invalid credentials");
      return;
    }

    //console.log("Login success → redirect");

    window.location.href = "./dashboard.html";

  } catch (err) {

    //console.error(" Login error:", err);
    showError("Something went wrong");

  } finally {
    setLoadingState(false); //  added (IMPORTANT)
  }
}


// loading UI (ONLY ADDITION)
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
    loginBtn.innerHTML = "Sign in"; // same as your HTML
  }
}


// ui helpers
function showError(message) {
  if (!errorBox) return;
  errorBox.textContent = message;
}

function clearError() {
  if (!errorBox) return;
  errorBox.textContent = "";
}