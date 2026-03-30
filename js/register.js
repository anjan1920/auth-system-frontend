console.log("Register js loaded");

import { withTimeout } from "./timeout.js";
import { CONFIG } from "./config.js";

const form = document.getElementById("registerForm");
const btnText = document.getElementById("btnText");
const loader = document.getElementById("loader");

const btn = document.getElementById("registerBtn");

const resendBtn = document.getElementById("resendBtn");
const message = document.getElementById("message");

let userEmail = "";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Submit clicked");
  

  const username = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  userEmail = email;

  btnText.textContent = "Registering...";
  loader.classList.remove("hidden");
  btn.disabled = true;

  try {

    const res = await withTimeout(
       
      fetch(`${CONFIG.SERVER_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          email,
          password
        })
      }),
      10000 // timeout added
    );

    let data = {};
    try {
      data = await res.json();
    } catch {}

    if(res.ok){

      form.innerHTML = `
        <p class="text-green-400 text-center">
        Registration successful. Check your email to verify your account.
        </p>
      `;

      resendBtn.classList.remove("hidden");
      message.textContent = "Didn't receive email? Click below to resend.";

    }else{
      document.getElementById("errorMsg").textContent = data.errors || "Registration failed";
    }

  } catch (err) {

    console.error(err);

    if (err.message === "TIMEOUT") {
      document.getElementById("errorMsg").textContent = "Server taking too long. Try again.";
    } else if (err.message === "NETWORK") {
      document.getElementById("errorMsg").textContent = "Check your internet connection.";
    } else {
      document.getElementById("errorMsg").textContent = "Something went wrong";
    }

  } finally {
    btnText.textContent = "Register";
    loader.classList.add("hidden");
    btn.disabled = false;
  }

});


resendBtn.addEventListener("click", async () => {

  if (!userEmail) {
    message.textContent = "Email not found. Please register again.";
    return;
  }

  message.textContent = "Sending verification email again...";

  try {

    const response = await withTimeout(
      
      fetch(`${CONFIG.SERVER_URL}/api/v1/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: userEmail
        })
      }),
      8000 // timeout added
    );

    let data = {};
    try {
      data = await response.json();
    } catch {}

    if(response.ok){
      message.textContent = "Verification email sent again. Check your inbox.";
    }else{
      message.textContent = data.message || "Failed to resend email";
    }

  } catch (error) {

    console.error(error);

    if (error.message === "TIMEOUT") {
      message.textContent = "Server slow. Try again.";
    } else if (error.message === "NETWORK") {
      message.textContent = "Check your connection.";
    } else {
      message.textContent = "Something went wrong.";
    }
  }

});