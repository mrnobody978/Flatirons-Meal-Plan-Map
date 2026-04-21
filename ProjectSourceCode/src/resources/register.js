function displayErrorText() {
    checkUsername()
    checkPassword()
}

function checkUsername() {
    const usernameValue = document.getElementById("usernameInput").value;
    const usernameRegex = /^[A-Za-z0-9_.\-]{4,50}$/;

    document.getElementById("usernameValidationText").hidden = usernameRegex.test(usernameValue);
}

function checkPassword() {
    const passwordValue = document.getElementById("passwordInput").value;
    const passwordRegex = /^[A-Za-z0-9_.\-]{4,50}$/;

    document.getElementById("passwordValidationText").hidden = passwordRegex.test(passwordValue);
}

function checkPassword2() {
    const passwordValue = document.getElementById("passwordInput").value;
    const passwordValue2 = document.getElementById("passwordInput2").value;

    document.getElementById("password2ValidationText").hidden = passwordValue == passwordValue2;
}

function toggleViewPassword(id) {
    let input = document.getElementById(id);
    let toggle = document.getElementById(id + "Toggle");
    if (input.type == "password") {
        input.type = "text";
        toggle.innerHTML = 'Hide password';
    } else {
        input.type = "password";
        toggle.innerHTML = 'Show password';
    }
}