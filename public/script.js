const API_BASE_URL = `${window.location.origin}/api/auth`;

async function handleFormSubmit(event, endpoint, method = "POST") {
  event.preventDefault();

  const formData = new FormData(event.target);
  const body = {};
  formData.forEach((value, key) => (body[key] = value));
  console.log(body);

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    alert(JSON.stringify(result, null, 2));
  } catch (error) {
    alert("Error: " + error.message);
  }
}

document.getElementById("signUpForm").addEventListener("submit", (e) =>
  handleFormSubmit(e, "sign-up")
);

document.getElementById("verifyEmailForm").addEventListener("submit", (e) =>
  handleFormSubmit(e, "verify-email")
);

document.getElementById("signInForm").addEventListener("submit", (e) =>
  handleFormSubmit(e, "sign-in")
);

document.getElementById("forgotPasswordForm").addEventListener("submit", (e) =>
  handleFormSubmit(e, "forgot-password")
);

document.getElementById("resetPasswordForm").addEventListener("submit", (e) =>
  handleFormSubmit(e, `reset-password/${document.querySelector("#resetPasswordForm input[name='token']").value}`, "PUT")
);
