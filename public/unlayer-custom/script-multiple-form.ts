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

function convertToObject(filters: FormDataItem[]): FormDataItem {
  let query: FormDataItem = {};

  filters.forEach((filter) => {
    const key = Object.keys(filter)[0] as keyof FormDataItem;
    const value = filter[key];
    if (key && value) {
      query[key] = value;
    }
  });

  return query;
}

function buildQueryString(params: FormDataItem) {
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
      const button = child as HTMLButtonElement;
      console.log(`Button ${j + 1}:`, button.textContent);

      const value = JSON.parse(button.getAttribute("value") as string) as {
        [key: string]: string;
        url: string;
      };

      button.onclick = (event) => {
        const currentForm = document.getElementById(`form_step_${i}`);
        const nextPage = document.getElementById(`form_step_${i + 1}`);
        if (value.url && value.url !== "") {
          window.open(value.url, "_blank");
        }
        if (value) {
          multipleFormData.push(value);
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
