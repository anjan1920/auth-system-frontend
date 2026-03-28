console.log("Reset Password JS loaded");

import { withTimeout } from "./timeout.js"
import { CONFIG } from "./config.js";

const form = document.getElementById("resetForm");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");

const loading = document.getElementById("loading");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");


// get token from URL
const params = new URLSearchParams(window.location.search);
const token = params.get("token");


if (!token) {
  message.innerText = "Invalid reset link.";
  message.className = "text-red-400";
  submitBtn.disabled = true; // added (prevent submit)
}


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!token) return; // added safety

  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if (newPassword !== confirmPassword) {
    message.innerText = "Passwords do not match.";
    message.className = "text-red-400";
    return;
  }

  try {

    loading.classList.remove("hidden");
    submitBtn.disabled = true;
    message.innerText = "";

    const res = await withTimeout(
      
      fetch(`${CONFIG.SERVER_URL}/api/v1/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ newPassword })
      }),
      10000 // timeout added
    );

    let data = {};
    try {
      data = await res.json();
    } catch {}

    if (res.ok) {
      message.innerText = "Password reset successful. Redirecting to login...";
      message.className = "text-green-400";

      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);

    } else {
      message.innerText = data.message || "Reset failed.";
      message.className = "text-red-400";
    }

  } catch (error) {

    console.error(error);

    if (error.message === "TIMEOUT") {
      message.innerText = "Server taking too long. Try again.";
    } else if (error.message === "NETWORK") {
      message.innerText = "Check your internet connection.";
    } else {
      message.innerText = "Something went wrong.";
    }

    message.className = "text-red-400";

  } finally {

    loading.classList.add("hidden");
    submitBtn.disabled = false;

  }

});