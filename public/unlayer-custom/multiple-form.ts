/// <reference path="../../types/unlayer.d.ts" />
const minimalCSS = `
/* Basic Body Styling (can be done inline, but cleaner here) */
body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #f8f9fa;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 50px;
    min-height: 100vh;
    margin: 0;
}

/* Toggle Switch Appearance & Behavior */
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-switch .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px; }
.toggle-switch .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; }
.toggle-switch input:checked + .slider { background-color: #343a40; }
.toggle-switch input:checked + .slider:before { transform: translateX(20px); }

/* Range Slider Thumb/Track Styling */
.range-slider { appearance: none; -webkit-appearance: none; width: 100%; height: 6px; background: #e9ecef; border-radius: 3px; cursor: pointer; }
.range-slider::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; width: 16px; height: 16px; background: #343a40; border-radius: 50%; cursor: pointer; margin-top: -5px; }
.range-slider::-moz-range-thumb { width: 16px; height: 16px; background: #343a40; border-radius: 50%; cursor: pointer; border: none; }

/* Basic Hover Effects (simpler than JS listeners for this demo) */
 .btn-primary:hover { background-color: #23272b !important; border-color: #1d2124 !important; }
 .btn-secondary:hover { background-color: #f8f9fa !important; border-color: #adb5bd !important; }
 .input-field:focus { outline: none; border-color: #86b7fe !important; box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important; }

 /* Dropdown Arrow for Secondary Button */
 .btn-secondary .arrow { margin-left: 8px; font-size: 10px; color: #6c757d; }

`;

type HTMLInputTypeAttribute =
  | "button"
  | "checkbox"
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "file"
  | "hidden"
  | "image"
  | "month"
  | "number"
  | "password"
  | "radio"
  | "range"
  | "reset"
  | "search"
  | "submit"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week"
  | (string & {});

interface Window {
  formValue: formValue;
}

type formValue = {
  mainLink: string;
  viewOnstep: number;
  steps: {
    id: number;
    title: string;
    type: string;
    picture: {
      url: string | null;
      width_auto: boolean;
      width: string;
      loading: string;
    };
    spacing: string;
    button_size: string;
    button_rounded: string;
    button_color: string;
    text_color: string;
    options: {
      display: string;
      value: string;
      id: number;
      url: string;
    }[];
  }[];
};
type SingleStepType = formValue["steps"][number];

unlayer.registerPropertyEditor({
  name: "form",
  layout: "bottom",
  Widget: unlayer.createWidget({
    render(value: formValue) {
      return multipleForm(value).outerHTML;
    },
    mount(
      node: HTMLElement,
      value: formValue,
      updateValue: (value: formValue) => void,
    ) {
      const form = node.getElementsByClassName("form")[0] as HTMLFormElement;
      const mainInputURL = node.getElementsByClassName(
        `input_url`,
      )[0] as HTMLInputElement;
      mainInputURL.value = value.mainLink;
      mainInputURL.required = true;
      mainInputURL.onblur = (e) => {
        form.reportValidity();
      };
      mainInputURL.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        updateValue({
          ...value,
          mainLink: target.value,
        });
      };
      for (const step of value.steps) {
        const inputTitle = node.getElementsByClassName(
          `form_${step.id}_input_title`,
        )[0] as HTMLInputElement;
        inputTitle.value = step.title;
        inputTitle.onblur = (e) => {
          form.reportValidity();
        };
        inputTitle.onchange = (event) => {
          const target = event.target as HTMLInputElement;
          updateValue({
            viewOnstep: step.id,
            mainLink: value.mainLink,
            steps: value.steps.map((prev) => {
              if (prev.id === step.id) {
                return { ...prev, title: target.value };
              }
              return prev;
            }),
          });
        };
        const inputType = node.getElementsByClassName(
          `form_${step.id}_input_type`,
        )[0] as HTMLInputElement;
        inputType.value = step.type;
        inputType.required = true;
        inputType.onblur = (e) => {
          form.reportValidity();
        };
        inputType.onchange = (event) => {
          const target = event.target as HTMLInputElement;
          updateValue({
            viewOnstep: step.id,
            mainLink: value.mainLink,
            steps: value.steps.map((prev) => {
              if (prev.id === step.id) {
                return { ...prev, type: target.value };
              }
              return prev;
            }),
          });
        };
        const loadingImage = node.getElementsByClassName(
          `${step.id}_loading_image`,
        )[0] as HTMLSpanElement;
        const displayImage = node.getElementsByClassName(
          `${step.id}_previewImage`,
        )[0] as HTMLImageElement;
        const inputImage = node.getElementsByClassName(
          `${step.id}_imageInput`,
        )[0] as HTMLInputElement;
        const inputURL = node.getElementsByClassName(
          `${step.id}_imageUrlInput`,
        )[0] as HTMLInputElement;
        const toggleCheckbox = node.getElementsByClassName(
          `${step.id}_toggleCheckbox`,
        )[0] as HTMLInputElement;
        const rangeSlider = node.getElementsByClassName(
          `${step.id}_rangeSlider_image`,
        )[0] as HTMLInputElement;

        if (step.picture.url) {
          inputURL.value = step.picture.url;
        }

        inputURL.onblur = (e) => {
          form.reportValidity();
        };
        inputURL.onchange = (event: Event) => {
          const target = event.target as HTMLInputElement;
          updateValue({
            viewOnstep: step.id,
            mainLink: value.mainLink,
            steps: value.steps.map((prev) => {
              if (prev.id === step.id) {
                return {
                  ...prev,
                  picture: {
                    ...prev.picture,
                    url: target.value,
                  },
                };
              }
              return prev;
            }),
          });
        };

        inputImage.onchange = async (event: Event) => {
          const target = event.target as HTMLInputElement;
          const file: File | null = target.files ? target.files[0] : null;

          if (file) {
            try {
              loadingImage.textContent = "...Loading";
              const signURL = await GetSignURLService({
                fileName: file.name,
                fileType: file.type,
                category: "other-library",
              });
              await UploadSignURLService({
                file: file,
                signURL: signURL.signURL,
                contentType: file.type,
              });
              loadingImage.textContent = "";
              updateValue({
                viewOnstep: step.id,
                mainLink: value.mainLink,
                steps: value.steps.map((prev) => {
                  if (prev.id === step.id) {
                    return {
                      ...prev,
                      picture: {
                        ...prev.picture,
                        url: signURL.originalURL,
                      },
                    };
                  }
                  return prev;
                }),
              });
              displayImage.src = signURL.originalURL;
              displayImage.style.display = "block";
              console.log(signURL);
            } catch (error) {
              loadingImage.textContent = "";
              alert("Upload File Error");
            }
          } else {
            displayImage.src = "#";
            displayImage.style.display = "none";
          }
        };
        toggleCheckbox.checked = step.picture.width_auto;
        toggleCheckbox.onchange = (e: Event) => {
          const target = e.target as HTMLInputElement;

          updateValue({
            viewOnstep: step.id,
            mainLink: value.mainLink,
            steps: value.steps.map((prev) => {
              if (prev.id === step.id) {
                return {
                  ...prev,
                  picture: {
                    ...prev.picture,
                    width_auto: target.checked,
                  },
                };
              }
              return prev;
            }),
          });
        };
        rangeSlider.value = step.picture.width;
        rangeSlider.textContent = `${rangeSlider.value}%`;
        rangeSlider.disabled = step.picture.width_auto;
        rangeSlider.onchange = (e: Event) => {
          const target = e.target as HTMLInputElement;
          target.textContent = `${target.value}%`;
          updateValue({
            viewOnstep: step.id,
            mainLink: value.mainLink,
            steps: value.steps.map((prev) => {
              if (prev.id === step.id) {
                return {
                  ...prev,
                  picture: {
                    ...prev.picture,
                    width: target.value,
                  },
                };
              }
              return prev;
            }),
          });
        };

        const button_color = node.getElementsByClassName(
          `${step.id}_color_button`,
        )[0] as HTMLInputElement;

        button_color.value = step.button_color;
        button_color.onchange = (e) => {
          const target = e.target as HTMLInputElement;
          updateValue({
            viewOnstep: step.id,
            mainLink: value.mainLink,
            steps: value.steps.map((prev) => {
              if (prev.id === step.id) {
                return {
                  ...prev,
                  button_color: target.value,
                };
              }
              return prev;
            }),
          });
        };
        const text_color = node.getElementsByClassName(
          `${step.id}_color_text`,
        )[0] as HTMLInputElement;

        text_color.value = step.text_color;
        text_color.onchange = (e) => {
          const target = e.target as HTMLInputElement;
          updateValue({
            viewOnstep: step.id,
            mainLink: value.mainLink,
            steps: value.steps.map((prev) => {
              if (prev.id === step.id) {
                return {
                  ...prev,
                  text_color: target.value,
                };
              }
              return prev;
            }),
          });
        };

        const rangeSlider_button = node.getElementsByClassName(
          `spacing_${step.id}_rangeSlider`,
        )[0] as HTMLInputElement;

        rangeSlider_button.value = step.spacing;
        rangeSlider_button.onchange = (e: Event) => {
          const target = e.target as HTMLInputElement;
          target.textContent = `${target.value}%`;
          updateValue({
            viewOnstep: step.id,
            mainLink: value.mainLink,
            steps: value.steps.map((prev) => {
              if (prev.id === step.id) {
                return {
                  ...prev,
                  spacing: target.value,
                };
              }
              return prev;
            }),
          });
        };

        const rangeSlider_button_size = node.getElementsByClassName(
          `button_size_${step.id}_rangeSlider`,
        )[0] as HTMLInputElement;

        rangeSlider_button_size.value = step.button_size;
        rangeSlider_button_size.onchange = (e: Event) => {
          const target = e.target as HTMLInputElement;
          target.textContent = `${target.value}%`;
          updateValue({
            viewOnstep: step.id,
            mainLink: value.mainLink,
            steps: value.steps.map((prev) => {
              if (prev.id === step.id) {
                return {
                  ...prev,
                  button_size: target.value,
                };
              }
              return prev;
            }),
          });
        };

        const rangeSlider_button_rounded = node.getElementsByClassName(
          `button_rounded_${step.id}_rangeSlider`,
        )[0] as HTMLInputElement;

        rangeSlider_button_rounded.value = step.button_rounded;
        rangeSlider_button_rounded.onchange = (e: Event) => {
          const target = e.target as HTMLInputElement;
          target.textContent = `${target.value}%`;
          updateValue({
            viewOnstep: step.id,
            mainLink: value.mainLink,
            steps: value.steps.map((prev) => {
              if (prev.id === step.id) {
                return {
                  ...prev,
                  button_rounded: target.value,
                };
              }
              return prev;
            }),
          });
        };

        const addMoreStep = node.getElementsByClassName(
          `add_more_step_${step.id}`,
        )[0] as HTMLButtonElement;
        addMoreStep.onclick = function (event: Event) {
          updateValue({
            viewOnstep: step.id,
            mainLink: value.mainLink,
            steps: [
              ...value.steps,
              {
                title: "",
                type: "",
                picture: {
                  url: null,
                  width_auto: true,
                  width: "",
                  loading: "",
                },
                spacing: "5px",
                button_rounded: "3px",
                button_size: "5px",
                button_color: "#dc2626",
                text_color: "#fff",
                id: value.steps.length + 1,
                options: [{ display: "", value: "", id: 1, url: "" }],
              },
            ],
          });
        };

        const removeStep = node.getElementsByClassName(
          `remove_step_${step.id}`,
        )[0] as HTMLButtonElement;

        if (removeStep) {
          removeStep.onclick = function (event: Event) {
            const updated = value.steps.filter(
              (prevStep) => prevStep.id !== step.id,
            );
            updateValue({
              viewOnstep: step.id,
              mainLink: value.mainLink,
              steps: updated.map((data, index) => {
                return {
                  ...data,
                  step: index + 1,
                };
              }),
            });
          };
        }

        for (const option of step.options) {
          const addOption = node.getElementsByClassName(
            `form_${step.id}_add_option_${option.id}`,
          )[0] as HTMLButtonElement;
          addOption.onclick = function (event: Event) {
            updateValue({
              viewOnstep: step.id,
              mainLink: value.mainLink,
              steps: [
                ...value.steps.map((s) => {
                  if (s.id === step.id) {
                    return {
                      ...s,
                      options: [
                        ...step.options,
                        {
                          id: step.options.length + 1,
                          display: "",
                          value: "",
                          url: "",
                        },
                      ],
                    };
                  }
                  return s;
                }),
              ],
            });
          };

          const removeOption = node.getElementsByClassName(
            `form_${step.id}_remove_option_${option.id}`,
          )[0] as HTMLButtonElement;

          if (removeOption) {
            removeOption.onclick = function (event: Event) {
              updateValue({
                viewOnstep: step.id,
                mainLink: value.mainLink,
                steps: value.steps.map((s) => {
                  if (s.id !== step.id) {
                    return s;
                  }
                  return {
                    ...s,
                    options: step.options.filter((f) => f.id !== option.id),
                  };
                }),
              });
            };
          }

          const inputDisplay = node.getElementsByClassName(
            `form_${step.id}_input_display_${option.id}`,
          )[0] as HTMLInputElement;
          inputDisplay.value = option.display;
          inputDisplay.required = true;
          inputDisplay.onblur = (e) => {
            form.reportValidity();
          };
          inputDisplay.onchange = (e) => {
            const target = e.target as HTMLInputElement;

            updateValue({
              viewOnstep: step.id,
              mainLink: value.mainLink,
              steps: [
                ...value.steps.map((s) => {
                  if (s.id === step.id) {
                    return {
                      ...s,
                      options: step.options.map((old) => {
                        if (old.id === option.id) {
                          return { ...old, display: target.value };
                        }
                        return old;
                      }),
                    };
                  }
                  return s;
                }),
              ],
            });
          };

          const optionInputURL = node.getElementsByClassName(
            `form_${step.id}_input_url_${option.id}`,
          )[0] as HTMLInputElement;

          optionInputURL.value = option.url;
          optionInputURL.onblur = (event) => {
            form.reportValidity();
          };
          optionInputURL.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            updateValue({
              viewOnstep: step.id,
              mainLink: value.mainLink,
              steps: [
                ...value.steps.map((s) => {
                  if (s.id === step.id) {
                    return {
                      ...s,
                      options: step.options.map((old) => {
                        if (old.id === option.id) {
                          return { ...old, url: target.value };
                        }
                        return old;
                      }),
                    };
                  }
                  return s;
                }),
              ],
            });
          };

          const inputValue = node.getElementsByClassName(
            `form_${step.id}_input_value_${option.id}`,
          )[0] as HTMLInputElement;
          inputValue.value = option.value;
          inputValue.required = true;
          inputValue.onblur = (e) => {
            form.reportValidity();
          };
          inputValue.onchange = (e) => {
            const target = e.target as HTMLInputElement;

            updateValue({
              viewOnstep: step.id,
              mainLink: value.mainLink,
              steps: [
                ...value.steps.map((s) => {
                  if (s.id === step.id) {
                    return {
                      ...s,
                      options: step.options.map((old) => {
                        if (old.id === option.id) {
                          return { ...old, value: target.value };
                        }
                        return old;
                      }),
                    };
                  }
                  return s;
                }),
              ],
            });
          };
        }
      }
    },
  }),
});

function multipleForm(value: formValue) {
  // --- Inject Minimal Necessary CSS ---
  // Styles that are hard/impossible to set purely with element.style

  const styleElement = document.createElement("style");
  styleElement.textContent = minimalCSS;
  document.head.appendChild(styleElement);
  const form = document.createElement("form");
  form.style.display = "flex";
  form.style.width = "100%";
  form.style.flexDirection = "column";
  form.style.gap = "0.5rem";
  form.className = "form";
  const inputURL = createTextInput("URL", "input_url", "url");
  form.appendChild(inputURL);

  if (value.steps.length > 0) {
    value.steps.forEach((step) => {
      const createStep = createformStep({
        number: step.id,
        options: value.steps.find((list) => list.id === step.id)?.options ?? [],
      });
      form.appendChild(createStep);
    });
  }

  return form;
}

//  DOM Manipulation with TypeScript
function createformStep(data: {
  number: number;
  options: {
    display: string;
    value: string;
    id: number;
  }[];
}) {
  const div = document.createElement("div");
  div.style.padding = "1rem";
  div.style.border = "1px solid";
  div.style.borderRadius = "0.375rem";

  // header part
  const header = document.createElement("header");
  header.style.width = "100%";
  header.style.display = "flex";
  header.style.flexDirection = "row";
  header.style.justifyContent = "space-between";
  header.style.marginBottom = "2rem";

  div.appendChild(header);
  const titleSpan = document.createElement("span");
  titleSpan.textContent = `Step ${data.number}`;
  header.appendChild(titleSpan);
  const inputTitle = createTextInput(
    "Title",
    `form_${data.number}_input_title`,
    "text",
  );

  div.appendChild(inputTitle);
  const inputType = createTextInput(
    "Type",
    `form_${data.number}_input_type`,
    "text",
  );
  div.appendChild(inputType);

  const inputImage = createImageBlock(data.number.toString());
  div.appendChild(inputImage);
  const buttonColor = createTextInput(
    "Color Buttons",
    `${data.number}_color_button`,
    "color",
  );

  div.appendChild(buttonColor);
  const textColor = createTextInput(
    "Color Text",
    `${data.number}_color_text`,
    "color",
  );

  div.appendChild(textColor);
  const spacing = createSliderInput(
    `spacing_${data.number}`,
    "Spacing Between Buttons",
  );

  div.appendChild(spacing);

  const button_size = createSliderInput(
    `button_size_${data.number}`,
    "Button Size",
  );

  div.appendChild(button_size);

  const button_rounded = createSliderInput(
    `button_rounded_${data.number}`,
    "Button Rounded",
  );

  div.appendChild(button_rounded);

  const groupButtons = document.createElement("div");
  groupButtons.style.display = "flex";
  groupButtons.style.gap = "0.5rem";
  const addMore = createButton({
    text: "Add Next Step",
    width: "9rem",
    backgroundColor: "#05df72",
    textColor: "#000000",
    fontSize: "1rem",
  });
  addMore.className = `add_more_step_${data.number}`;

  const remove = createButton({
    text: "Remove Step",
    width: "7rem",
    backgroundColor: "#fb2c36",
    textColor: "#fff",
    fontSize: "1rem",
  });
  remove.className = `remove_step_${data.number}`;

  if (data.number !== 1) {
    groupButtons.appendChild(remove);
  }
  groupButtons.appendChild(addMore);

  header.appendChild(groupButtons);

  //body part
  const body = document.createElement("ul");
  body.style.display = "flex";
  body.style.width = "100%";
  body.style.flexDirection = "column";
  body.style.gap = "0.5rem";

  data.options.forEach((option) => {
    const createOption = createOptionButton(`form_${data.number}`, option.id);

    body.appendChild(createOption);
  });
  div.appendChild(body);

  return div; // Return the DOM element
}

function createSliderInput(id: string, placeholder: string) {
  const container = document.createElement("div");
  const span = document.createElement("span");
  span.textContent = placeholder;
  container.appendChild(span);
  const rangeSlider = document.createElement("input");
  rangeSlider.type = "range";
  rangeSlider.min = "0";
  rangeSlider.max = "100";
  rangeSlider.classList.add("range-slider", `${id}_rangeSlider`);
  const rangeValueDisplay = document.createElement("div");
  // Apply styles directly
  rangeValueDisplay.style.textAlign = "right";
  rangeValueDisplay.style.fontSize = "12px";
  rangeValueDisplay.style.color = "#6c757d";
  rangeValueDisplay.style.marginTop = "5px";
  container.appendChild(rangeSlider);
  container.appendChild(rangeValueDisplay);

  return container;
}

function createImageBlock(id: string) {
  const container = document.createElement("div");

  // --- Apply Styles to Container ---
  container.style.backgroundColor = "#ffffff";
  container.style.borderRadius = "8px";

  // --- 1. Create Button Row ---
  const buttonRow = document.createElement("div");
  // Apply styles directly
  buttonRow.style.display = "flex";
  buttonRow.style.marginBottom = "20px";
  buttonRow.style.gap = "10px";

  // Upload Button
  const uploadLabel = document.createElement("label");
  uploadLabel.textContent = "Upload Image";
  uploadLabel.className = "btn-primary"; // Use class for hover (defined in injected CSS)
  // Apply styles directly
  uploadLabel.style.flex = "1";
  uploadLabel.style.padding = "10px 15px";
  uploadLabel.style.border = "1px solid #343a40";
  uploadLabel.style.borderRadius = "6px";
  uploadLabel.style.fontSize = "14px";
  uploadLabel.style.fontWeight = "500";
  uploadLabel.style.cursor = "pointer";
  uploadLabel.style.transition =
    "background-color 0.2s ease, border-color 0.2s ease";
  uploadLabel.style.backgroundColor = "#343a40";
  uploadLabel.style.color = "#ffffff";

  const inputElement = document.createElement("input");
  inputElement.type = "file";
  inputElement.className = `${id}_imageInput`;
  inputElement.accept = "image/*";
  inputElement.style.display = "none";
  uploadLabel.appendChild(inputElement);

  // Create the image element for preview
  const imageElement = document.createElement("img");
  imageElement.className = `${id}_previewImage`;
  imageElement.src = "#";
  imageElement.alt = "Preview";
  imageElement.style.display = "none";
  imageElement.style.width = "200px"; // or whatever size you want

  // Add an event listener to the input element
  // Create a container div (optional, but good practice)

  // More Images Button

  // Add text and arrow span (since ::after isn't possible with element.style)

  buttonRow.appendChild(uploadLabel);

  const loadingIndicator = document.createElement("span");
  loadingIndicator.className = `${id}_loading_image`;
  loadingIndicator.textContent = "";

  container.appendChild(loadingIndicator);
  container.appendChild(buttonRow);

  // --- 3. Create Image URL Input ---
  const imageUrlGroup = document.createElement("div");
  // Apply styles directly
  imageUrlGroup.style.marginBottom = "20px";

  const imageUrlLabelRow = document.createElement("div");
  // Apply styles directly
  imageUrlLabelRow.style.display = "flex";
  imageUrlLabelRow.style.justifyContent = "space-between";
  imageUrlLabelRow.style.alignItems = "baseline";
  imageUrlLabelRow.style.marginBottom = "8px";
  imageUrlLabelRow.style.fontSize = "14px";

  const imageUrlLabel = document.createElement("span");
  imageUrlLabel.textContent = "Image URL";
  // Apply styles directly
  imageUrlLabel.style.color = "#495057";
  imageUrlLabel.style.fontWeight = "500";

  const imageUrlHint = document.createElement("span");
  imageUrlHint.textContent = "1600 × 400"; // Example dimensions
  // Apply styles directly
  imageUrlHint.style.color = "#6c757d";
  imageUrlHint.style.fontSize = "12px";

  imageUrlLabelRow.appendChild(imageUrlLabel);
  imageUrlLabelRow.appendChild(imageUrlHint);

  const imageUrlInput = document.createElement("input");
  imageUrlInput.type = "text";
  imageUrlInput.placeholder = "Enter image URL";
  imageUrlInput.className = `${id}_imageUrlInput`;
  // Apply styles directly
  imageUrlInput.style.width = "100%";
  imageUrlInput.style.padding = "8px 12px";
  imageUrlInput.style.border = "1px solid #ced4da";
  imageUrlInput.style.borderRadius = "6px";
  imageUrlInput.style.fontSize = "14px";
  imageUrlInput.style.boxSizing = "border-box";
  imageUrlInput.style.color = "#495057";
  // Focus style handled by injected CSS

  imageUrlGroup.appendChild(imageUrlLabelRow);
  imageUrlGroup.appendChild(imageUrlInput);
  container.appendChild(imageUrlGroup);
  container.appendChild(imageElement);

  // --- 4. Create Width Control ---
  const widthControl = document.createElement("div");
  // Apply styles directly
  widthControl.style.marginTop = "20px";
  widthControl.style.marginBottom = "20px";

  container.appendChild(widthControl);

  const widthLabelToggleRow = document.createElement("div");
  // Apply styles directly
  widthLabelToggleRow.style.display = "flex";
  widthLabelToggleRow.style.justifyContent = "space-between";
  widthLabelToggleRow.style.alignItems = "center";
  widthLabelToggleRow.style.marginBottom = "15px";

  const widthLabel = document.createElement("span");
  widthLabel.textContent = "Width Image";
  // Apply styles directly
  widthLabel.style.color = "#495057";
  widthLabel.style.fontWeight = "500";
  widthLabel.style.fontSize = "14px";

  // Toggle Switch Container
  const toggleContainer = document.createElement("div");
  // Apply styles directly
  toggleContainer.style.display = "flex";
  toggleContainer.style.alignItems = "center";
  toggleContainer.style.gap = "8px";

  const toggleText = document.createElement("span");
  toggleText.textContent = "Auto On";
  // Apply styles directly
  toggleText.style.color = "#6c757d";
  toggleText.style.fontSize = "12px";

  // Toggle Switch uses classes defined in injected CSS for appearance
  const toggleSwitchLabel = document.createElement("label");
  toggleSwitchLabel.className = "toggle-switch"; // Use class for structure/style
  // Apply styles directly (positioning)
  toggleSwitchLabel.style.position = "relative";
  toggleSwitchLabel.style.display = "inline-block";
  toggleSwitchLabel.style.width = "40px";
  toggleSwitchLabel.style.height = "20px";

  const toggleCheckbox = document.createElement("input");
  toggleCheckbox.type = "checkbox";
  toggleCheckbox.checked = true; // Initial state
  toggleCheckbox.className = `${id}_toggleCheckbox`;

  const sliderSpan = document.createElement("span");
  sliderSpan.className = "slider"; // Use class for appearance/animation

  toggleSwitchLabel.appendChild(toggleCheckbox);
  toggleSwitchLabel.appendChild(sliderSpan);

  toggleContainer.appendChild(toggleText);
  toggleContainer.appendChild(toggleSwitchLabel);

  widthLabelToggleRow.appendChild(widthLabel);
  widthLabelToggleRow.appendChild(toggleContainer);

  container.appendChild(widthLabelToggleRow);

  // Range Slider
  const rangeSlider = document.createElement("input");
  rangeSlider.type = "range";
  rangeSlider.min = "0";
  rangeSlider.max = "100";
  rangeSlider.classList.add("range-slider", `${id}_rangeSlider_image`);
  const rangeValueDisplay = document.createElement("div");
  // Apply styles directly
  rangeValueDisplay.style.textAlign = "right";
  rangeValueDisplay.style.fontSize = "12px";
  rangeValueDisplay.style.color = "#6c757d";
  rangeValueDisplay.style.marginTop = "5px";

  container.appendChild(rangeSlider);
  container.appendChild(rangeValueDisplay);

  return container;
}

const createOptionButton = (formId: string, id: number) => {
  const option = document.createElement("div");
  option.style.padding = "0.5rem";
  option.style.border = "0.5px solid";
  option.style.borderRadius = "0.375rem";
  option.style.display = "flex";
  option.style.flexDirection = "column";
  option.style.gap = "0.5rem";
  option.style.width = "100%";

  const optionHeader = document.createElement("header");
  optionHeader.style.width = "100%";
  optionHeader.style.display = "flex";
  optionHeader.style.flexDirection = "row";
  optionHeader.style.justifyContent = "end";
  optionHeader.style.gap = "0.5rem";
  const addOption = createButton({
    text: "Add Option",
    width: "7rem",
    backgroundColor: "#05df72",
    textColor: "#000000",
    fontSize: "1rem",
  });
  addOption.className = `${formId}_add_option_${id}`;
  const removeOption = createButton({
    text: "Remove Option",
    width: "8rem",
    backgroundColor: "#fb2c36",
    textColor: "#000000",
    fontSize: "1rem",
  });
  removeOption.className = `${formId}_remove_option_${id}`;
  if (id !== 1) {
    optionHeader.appendChild(removeOption);
  }
  optionHeader.appendChild(addOption);
  option.appendChild(optionHeader);

  const inputDisplay = createTextInput(
    "Display Text",
    `${formId}_input_display_${id}`,
    "text",
  );

  const inputValue = createTextInput(
    "Value",
    `${formId}_input_value_${id}`,
    "text",
  );
  const inputUrl = createTextInput("URL", `${formId}_input_url_${id}`, "url");

  option.appendChild(inputDisplay);
  option.appendChild(inputValue);
  option.appendChild(inputUrl);

  return option;
};

const createTextInput = (
  labelText: string,
  id: string,
  type: HTMLInputTypeAttribute,
): HTMLDivElement => {
  // Create the main container div
  const container = document.createElement("div");

  // Create the label
  const label = document.createElement("label");
  label.textContent = labelText;
  label.style.fontSize = "0.875rem";
  container.appendChild(label);

  // Create the input element
  const input = document.createElement("input");
  input.type = type;
  input.className = id;
  container.appendChild(input);

  // Create the button

  // Apply some basic styling (you can customize this further with CSS classes)
  container.style.display = "flex";
  container.style.alignItems = "start";
  container.style.flexDirection = "column";
  container.style.gap = "0.2rem"; // Adjust spacing as needed
  container.style.marginBottom = "1rem"; // Add some margin below the input group

  label.style.marginRight = "0.5rem";
  if (type === "color") {
  } else {
    input.style.flexGrow = "1"; // Allow input to take up available space
    input.style.padding = "0.5rem";
    input.style.width = "100%";
    input.style.border = "1px solid #ccc";
    input.style.borderRadius = "0.25rem";
  }

  return container;
};

const createButton = (input: {
  text: string;
  width: string;
  backgroundColor: string;
  textColor: string;
  fontSize: string;
  padding?: string;
  rounded?: string;
  fontFamily?: string;
  value?: { [key: string]: string };
}) => {
  const button = document.createElement("button");
  if (input.fontFamily) {
    button.style.fontFamily = input.fontFamily;
  }
  button.textContent = input.text;
  button.style.minWidth = input.width;
  button.style.width = "max-content";
  button.style.borderRadius = input.rounded ? `${input.rounded}px` : "0.35rem";
  button.style.backgroundColor = input.backgroundColor;
  button.style.paddingTop = input.padding ? `${input.padding}px` : "0.25rem";
  button.style.paddingInline = input.padding
    ? `${Number(input.padding) * 1.05}px`
    : "0.35rem";
  button.style.paddingBottom = input.padding ? `${input.padding}px` : "0.25rem";
  button.style.fontSize = input.fontSize;
  button.style.color = input.textColor;
  button.style.cursor = "pointer";
  button.style.transition = "background-color 0.3s ease"; // Smooth transiti
  button.style.boxShadow =
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";

  if (input.value) {
    button.setAttribute("value", JSON.stringify(input.value));
  }
  return button;
};

function displayForm(data: MultipleFormValues, isViewer: boolean) {
  const value = data.form;

  // Create the main div container

  const body = document.createElement("div");
  if (data?.text) {
    body.style.fontFamily = data.text.value;
  }
  // Create the "Pick your age!" span
  const script = document.createElement("script");
  script.src = `https://oxyclick.com/unlayer-custom/script-multiple-form.js`; // Path to your JS file

  script.type = "text/javascript";
  script.className = "script_multiple_form";
  script.setAttribute("value", JSON.stringify({ link: value.mainLink }));

  script.defer = true; // Optional: load after parsing HTML
  body.appendChild(script); // or document.head.appendChild(script);

  const scriptDevelopment = document.createElement("script");
  scriptDevelopment.src = `http://localhost:8080/unlayer-custom/script-multiple-form.js`; // Path to your JS file

  scriptDevelopment.type = "text/javascript";
  scriptDevelopment.className = "script_multiple_form";
  scriptDevelopment.setAttribute(
    "value",
    JSON.stringify({ link: value.mainLink }),
  );

  scriptDevelopment.defer = true; // Optional: load after parsing HTML
  body.appendChild(scriptDevelopment); // or document.head.appendChild(script);
  for (const step of value.steps) {
    const container = document.createElement("div");
    if (step.id === 1 && isViewer === false) {
      container.style.display = "flex";
    } else if (isViewer === true && value.viewOnstep === step.id) {
      container.style.display = "flex";
    } else if (isViewer === true && !value.viewOnstep && step.id === 1) {
      container.style.display = "flex";
    } else {
      container.style.display = "none";
    }
    container.style.width = "100%";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.gap = "3px";
    container.className = `form_step`;
    container.id = `form_step_${step.id}`;

    if (step.title && step.title !== "") {
      const titleSpan = document.createElement("div");
      titleSpan.textContent = step.title;
      titleSpan.style.backgroundColor = "#fff";
      titleSpan.style.padding = "0.25rem";
      titleSpan.style.minWidth = "15rem";
      titleSpan.style.textAlign = "center";
      titleSpan.style.paddingInline = "0.45rem";
      titleSpan.style.borderRadius = "0.375rem";
      titleSpan.style.marginBottom = "1rem";
      container.appendChild(titleSpan);
    }

    const imageElement = document.createElement("img");
    if (step.picture && step.picture.url) {
      imageElement.className = "previewImage";
      imageElement.src = step.picture.url;
      imageElement.alt = "Preview";
      imageElement.style.width =
        step.picture.width_auto === true ? "100%" : `${step.picture.width}%`; // or whatever size you want
      container.appendChild(imageElement);
    }
    const divider = document.createElement("div");
    divider.style.minWidth = "15rem";
    divider.style.height = "2px";
    divider.style.backgroundColor = "#000";
    container.appendChild(divider);
    const buttonContaner = document.createElement("div");
    buttonContaner.style.display = "flex";
    buttonContaner.style.width = "100%";
    buttonContaner.style.flexDirection = "column";
    buttonContaner.style.alignItems = "center";
    buttonContaner.style.justifyContent = "center";
    buttonContaner.style.gap = step.spacing ? `${step.spacing}px` : "5px";
    buttonContaner.className = "button-containers";
    for (const option of step.options) {
      const button = createButton({
        text: option.display,
        width: "15rem",
        padding: step.button_size,
        rounded: step.button_rounded,
        backgroundColor: step.button_color,
        ...(data.text && data.text.value && { fontFamily: data.text.value }),
        textColor: step.text_color,
        value: {
          [step.type]: option.value,
          ...(option.url !== "" && { url: option.url }),
        },
        fontSize: "1.5rem",
      });
      button.className = `form_${step.id}_button_${option.id}`;

      buttonContaner.appendChild(button);
    }
    container.appendChild(buttonContaner);

    body.appendChild(container);
  }

  return body; // Return the container element
}

interface MultipleFormOptions {
  dropdown: {
    title: string;
    position: number;
    options: {
      text: {
        label: "Font Family"; // Label for Property
        defaultValue: {
          label: string;
          value: string;
        };
        widget: "font_family"; // Property Editor Widget: color_picker
      };
      form: {
        label: string;
        defaultValue: formValue;
        widget: string;
      };
    };
  };
}

type ExtractDefaultValues<
  T extends { dropdown: { options: Record<string, { defaultValue: any }> } },
> = {
  [K in keyof T["dropdown"]["options"]]: T["dropdown"]["options"][K]["defaultValue"];
};

// ✅ Final Result
type MultipleFormValues = ExtractDefaultValues<MultipleFormOptions>;

unlayer.registerTool({
  name: "multiple_form",
  label: "Multiple Form",
  icon: "fa-list",
  supportedDisplayModes: ["web"],
  options: {
    dropdown: {
      title: "Edit Form Info",
      position: 1,
      options: {
        text: {
          label: "Font Family",
          defaultValue: {
            label: "Arial",
            value: "arial,helvetica,sans-serif",
          },
          widget: "font_family",
        },
        form: {
          label: "Edit Form Info",
          defaultValue: {
            mainLink: "",
            viewOnstep: 1,
            steps: [
              {
                title: "",
                type: "",
                picture: {
                  url: null,
                  width_auto: true,
                  width: "",
                },
                spacing: "",
                button_rounded: "",
                button_size: "",
                button_color: "#dc2626",
                text_color: "#fff",
                id: 1,
                options: [{ display: "", value: "", id: 1, url: "" }],
              } as SingleStepType,
            ],
          },
          widget: "form",
        },
      },
    },
  } as MultipleFormOptions,
  values: {},
  renderer: {
    Viewer: unlayer.createViewer({
      render(values: MultipleFormValues) {
        return displayForm(values, true).outerHTML;
      },
    }),
    exporters: {
      web: function (values: MultipleFormValues) {
        return displayForm(values, false).outerHTML;
      },
    },
    head: {
      css: function (values: MultipleFormValues) {},
      js: function (values: MultipleFormValues) {},
    },
  },
});

type CategoryFile =
  | "image-library"
  | "favicon-library"
  | "video-library"
  | "document-library"
  | "audio-library"
  | "other-library";

type RequestGetSignURLService = {
  fileName: string;
  fileType: string;
  category: CategoryFile;
};

function parseCookies(): { [key: string]: string } {
  const cookies: { [key: string]: string } = {};
  if (typeof document === "undefined") {
    return {};
  }
  document.cookie.split(";").forEach((cookie) => {
    const [key, ...value] = cookie.trim().split("=");
    cookies[key] = value.join("=");
  });
  return cookies;
}

async function GetSignURLService(input: RequestGetSignURLService): Promise<{
  signURL: string;
  originalURL: string;
  contentType: string;
  fileName: string;
}> {
  try {
    console.log(window);
    const url = new URL(
      `https://server-dashboard.oxyclick.com/v1/cloud-storage/get-signURL/public`,
    );
    url.search = new URLSearchParams(input).toString();

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(errorData);
      throw errorData;
    }

    const signURLData = await response.json();
    return signURLData;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
}

type RequestUploadSignURLService = {
  contentType: string;
  file: File;
  signURL: string;
};
async function UploadSignURLService(
  input: RequestUploadSignURLService,
): Promise<{
  message: "success" | "error";
}> {
  try {
    await fetch(input.signURL, {
      method: "PUT",
      headers: {
        "Content-Type": `${input.contentType}`,
      },
      body: input.file,
    });
    return { message: "success" };
  } catch (error: any) {
    console.error(error.response.data);
    throw "error";
  }
}
