"use strict";
const multipleforms = document.getElementsByClassName("form_step");
let multipleFormData = [];
const script = document.getElementsByClassName("script_multiple_form")[0];
const mainLink = JSON.parse(script.getAttribute("value"));
function convertToObject(filters) {
    let query = {};
    filters.forEach((filter) => {
        const key = Object.keys(filter)[0];
        const value = filter[key];
        if (key && value) {
            query[key] = value;
        }
    });
    return query;
}
function buildQueryString(params) {
    const queryString = Object.entries(params)
        .map(([key, value]) => {
        // Encode the key and value for URL safety
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(value);
        return `${encodedKey}=${encodedValue}`;
    })
        .join("&");
    return queryString;
}
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
                const value = button.getAttribute("value");
                if (value) {
                    multipleFormData.push(JSON.parse(value));
                }
                if (i === multipleforms.length) {
                    const object = convertToObject(multipleFormData);
                    const query = buildQueryString(object);
                    window.open(`${mainLink.link}?${query}`, "_self");
                }
                if (currentForm) {
                    currentForm.style.display = "none";
                }
                if (nextPage) {
                    nextPage.style.display = "flex";
                }
            };
        }
    }
}
