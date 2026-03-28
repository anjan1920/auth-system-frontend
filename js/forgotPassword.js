console.log(" Forgot Password JS loaded");

import { withTimeout } from "./timeout.js";
import { CONFIG } from "./config.js";

const form = document.getElementById("forgotForm");
const emailInput = document.getElementById("email");
const loading = document.getElementById("loading");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");


form.addEventListener("submit", async (e) => {
  // console.log(" Form submit triggered");

  e.preventDefault();
  //console.log(" Default prevented");

  const email = emailInput.value.trim();
  //console.log(" Email input:", email);

  if (!email) {
    //console.log(" Email empty → showing error");
    message.innerText = "Please enter your email";
    message.className = "text-red-400 text-center mt-4";
    return;
  }

  try {
    //console.log(" Starting forgot-password request");

    // UI loading state
    //console.log("Showing loader + disabling button");
    loading.classList.remove("hidden");
    submitBtn.disabled = true;
    message.innerText = "";

   

    const res = await withTimeout(
      fetch(`${CONFIG.SERVER_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      }),
      10000
    );

    //console.log(" Response received:", res.status);

    let data = {};
    try {
      data = await res.json();
      //console.log(" Parsed JSON:", data);
    } catch (err) {
      //console.log(" JSON parse failed");
    }

    if (res.ok) {
      //console.log("Success → reset link sent");
      message.innerText = "Reset link sent to your email.";
      message.className = "text-green-400 text-center mt-4";
      form.reset();
    } else {
      //console.log(" API error:", data.message);
      message.innerText = data.message || "Failed to send reset email.";
      message.className = "text-red-400 text-center mt-4";
    }

  } catch (error) {
    //console.error(" Catch error:", error);

    if (error.message === "TIMEOUT") {
     // console.log(" Timeout error");
      message.innerText = "Server taking too long. Try again.";
    } else if (error.message === "NETWORK") {
      //console.log("Network error");
      message.innerText = "Check your internet connection.";
    } else {
      //console.log(" Unknown error");
      message.innerText = "Something went wrong.";
    }

    message.className = "text-red-400 text-center mt-4";

  } finally {
    //console.log(" Finally → hide loader + enable button");
    loading.classList.add("hidden");
    submitBtn.disabled = false;
  }
});