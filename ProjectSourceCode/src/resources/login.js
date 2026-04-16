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