console.log("email verify loaded");

import { withTimeout } from "./timeout.js"; 
import { CONFIG } from "./config.js";

const resultDiv = document.getElementById("result");
const loadingDiv = document.getElementById("loading");

// get token from URL
const params = new URLSearchParams(window.location.search);
const token = params.get("token");
//console.log(token);

async function verifyEmail() {

  if (!token) {
    loadingDiv.style.display = "none";
    resultDiv.classList.remove("hidden");
    resultDiv.innerHTML = `<p class="text-red-400">Invalid verification link</p>`;
    return;
  }

  try {
    console.log("fetching server..");
    
    const res = await withTimeout(
      
      fetch(`${CONFIG.SERVER_URL}/api/v1/auth/verify-email/${token}`),
      10000 // timeout added
    );

    let data = {};
    try {
      data = await res.json();
    } catch {}

    console.log(data);
    

    loadingDiv.style.display = "none";
    resultDiv.classList.remove("hidden");

    if (res.ok) {

      resultDiv.innerHTML = `
        <p class="text-green-400 font-semibold">
        ✅ Email verified successfully
        </p>

        <a href="./index.html"
        class="inline-block mt-4 text-indigo-400 hover:text-indigo-300">
        Go to Login
        </a>
      `;

    } else {

      resultDiv.innerHTML = `
        <p class="text-red-400">
        ${data.message || "Verification failed"}
        </p>
      `;

    }

  } catch (error) {

    console.error(error);

    loadingDiv.style.display = "none";
    resultDiv.classList.remove("hidden");

    if (error.message === "TIMEOUT") {
      resultDiv.innerHTML = `
        <p class="text-red-400">
        Server taking too long. Try again.
        </p>
      `;
    } else if (error.message === "NETWORK") {
      resultDiv.innerHTML = `
        <p class="text-red-400">
        Check your internet connection.
        </p>
      `;
    } else {
      resultDiv.innerHTML = `
        <p class="text-red-400">
        Verification failed. Try again later.
        </p>
      `;
    }
  }

}

verifyEmail();