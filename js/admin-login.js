// handle admin login page logic
console.log(" Admin login page loaded");

import { apiRequest } from "./api.js";
import { CONFIG } from "./config.js";
import { withTimeout } from "./timeout.js"; // added for timeout handling

const loader = document.getElementById("loader");

function init() {
  //console.log(" init() called");
  showLoader();
  checkAuth();
}

init();

async function checkAuth() {
  //console.log(" checkAuth() started");

  try {
    //console.log(" Sending request: current-user");

    const res = await withTimeout(
      apiRequest(
        `${CONFIG.SERVER_URL}/api/v1/auth/current-user`,
        {
          method: "GET",
          credentials: "include"
        }
      ),
      8000
    );

    //console.log(" Response received (checkAuth):", res.status);

    if (!res.ok) {
      console.log("Response not OK -->skipping");
      return;
    }

    let data;
    try {
      data = await res.json();
      //console.log(" Parsed JSON (checkAuth):", data);
    } catch (err) {
      //console.log(" JSON parse failed (checkAuth)");
      return;
    }

    if (!data.success) {
      //console.log(" success=false → not logged in");
      return;
    }

    //console.log("Admin already logged in → redirecting");
    redirectToDashboard();

  } catch (error) {
    //console.error(" Error in checkAuth:", error);

    if (error.message === "TIMEOUT") {
      //console.log(" Timeout occurred");
      showError("Server taking too long (cold start)");
    } else {
      console.log(" Admin not logged in");
    }
  } finally {
    //console.log(" checkAuth finally -> hideLoader()");
    hideLoader();
  }
}

//console.log("Attaching submit listener to form");

document.getElementById("adminLoginForm").addEventListener("submit", handleLoginSubmit);

async function handleLoginSubmit(e) {
  //console.log("handleLoginSubmit triggered");

  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  //console.log("Input values:", { email, password });

  await loginAdmin(email, password);
}

async function loginAdmin(email, password) {
  //console.log("loginAdmin() started");

  try {
    //console.log("Showing loader");
    showLoader();

    //console.log("Sending request: admin login");

    const res = await withTimeout(
      apiRequest(
        `${CONFIG.SERVER_URL}/api/v1/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ email, password })
        }
      ),
      10000
    );

    //console.log("Response received (login):", res.status);

    let data = {};
    try {
      data = await res.json();
      //console.log(" Parsed JSON (login):", data);
    } catch (err) {
      //console.log(" JSON parse failed (login)");
    }

    if (!res.ok) {
      //console.log(" Login failed:", data.message);
      showError(data.message || "Admin login failed");
      return;
    }

    //console.log("Login success → redirecting");
    redirectToDashboard();

  } catch (err) {
    //console.error("Error in loginAdmin:", err);

    if (err.message === "TIMEOUT") {
      //console.log(" Timeout error");
      showError("Server slow, try again");
    } else if (err.message === "NETWORK") {
      console.log(" Network error");
      showError("Check internet connection");
    } else {
      //console.log(" Unknown server error");
      showError("Server error");
    }

  } finally {
    c//onsole.log(" loginAdmin finally → hideLoader()");
    hideLoader();
  }
}

function redirectToDashboard() {
  //console.log(" Redirecting to admin-dashboard.html");
  window.location.href = "./admin-dashboard.html";
}

function showError(message) {
  //console.log(" showError:", message);
  document.getElementById("errorMsg").innerText = message;
}

function showLoader() {
  //console.log(" showLoader()");
  loader.classList.remove("hidden");
}

function hideLoader() {
  //console.log("hideLoader()");
  loader.classList.add("hidden");
}