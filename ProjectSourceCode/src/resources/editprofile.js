function updateImage() {
    console.log("Hello world!");
    const imgObj = document.getElementById("profileImage");
    const file = this.files[0];
    imgObj.file = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        imgObj.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

const fileInput = document.getElementById("profileImageInput");
fileInput.addEventListener("change", updateImage);