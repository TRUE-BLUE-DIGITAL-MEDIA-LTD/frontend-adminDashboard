const multipleforms = document.getElementsByClassName("form_step");
type FormDataItem = {
  [key: string]: string;
};

let multipleFormData: FormDataItem[] = [];

const script = document.getElementsByClassName(
  "script_multiple_form",
)[0] as HTMLScriptElement;

const mainLink = JSON.parse(script.getAttribute("value") as string) as {
  link: string;
};

for (let i = 1; i <= multipleforms.length; i++) {
  const form = multipleforms[i - 1];

  for (let j = 0; j < form.children.length; j++) {
    const child = form.children[j];
    // Check if the child is a button
    if (child.classList.contains("button-containers")) {
      for (let d = 0; d < child.children.length; d++) {
        const button = child.children[d] as HTMLButtonElement;
        const value = JSON.parse(button.getAttribute("value") as string) as {
          move_to_step?: string;
          url: string;
        };

        button.onclick = (event) => {
          const currentForm = document.getElementById(`form_step_${i}`);
          const nextPage = document.getElementById(
            `form_step_${value.move_to_step ? value.move_to_step : i + 1}`,
          );
          if (value.url && value.url !== "") {
            window.open(value.url, "_blank");
            return;
          }

          if (value) {
            multipleFormData.push(value);
          }

          if (i === multipleforms.length) {
            window.open(mainLink.link, "_self");
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
}
