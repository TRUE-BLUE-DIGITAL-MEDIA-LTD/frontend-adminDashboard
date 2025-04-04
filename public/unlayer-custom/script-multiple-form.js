"use strict";
const multipleforms = document.getElementsByClassName("form_step");
console.log(multipleforms);
for (let i = 1; i <= multipleforms.length; i++) {
    const form = multipleforms[i - 1];
    for (let j = 0; j < form.children.length; j++) {
        const child = form.children[j];
        // Check if the child is a button
        if (child.tagName === "BUTTON") {
            const button = child;
            console.log(`Button ${j + 1}:`, button.textContent);
            button.onclick = (event) => {
                const currentForm = document.getElementById(`form_step_${i}`);
                const nextPage = document.getElementById(`form_step_${i + 1}`);
                if (currentForm) {
                    console.log("Hiding current form:", currentForm);
                    currentForm.style.display = "none";
                }
                if (nextPage) {
                    console.log("Showing next form:", nextPage);
                    nextPage.style.display = "flex";
                }
            };
        }
    }
}
