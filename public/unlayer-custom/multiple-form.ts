interface Window {
  formValue: formValue;
}
type formValue = {
  steps: {
    id: number;
    title: string;
    options: { display: string; value: string; id: number }[];
  }[];
};
let currentValue;

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
      for (const step of value.steps) {
        const inputTitle = node.getElementsByClassName(
          `form_${step.id}_input_title`,
        )[0] as HTMLInputElement;
        inputTitle.value = step.title;
        inputTitle.onchange = (event) => {
          const target = event.target as HTMLInputElement;
          updateValue({
            steps: value.steps.map((prev) => {
              if (prev.id === step.id) {
                return { ...prev, title: target.value };
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
            steps: [
              ...value.steps,
              {
                title: "",
                id: value.steps.length + 1,
                options: [{ display: "", value: "", id: 1 }],
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
            const noneUpdateDataLists = value.steps.filter(
              (s) => s.id !== step.id,
            );
            updateValue({
              steps: [
                ...noneUpdateDataLists,
                {
                  ...step,
                  options: [
                    ...step.options,
                    {
                      id: step.options.length + 1,
                      display: "",
                      value: "",
                    },
                  ],
                },
              ],
            });
          };

          const removeOption = node.getElementsByClassName(
            `form_${step.id}_remove_option_${option.id}`,
          )[0] as HTMLButtonElement;

          if (removeOption) {
            removeOption.onclick = function (event: Event) {
              const noneUpdateDataLists = value.steps.filter(
                (s) => s.id !== step.id,
              );
              updateValue({
                steps: [
                  ...noneUpdateDataLists,
                  {
                    ...step,
                    options: step.options.filter((f) => f.id !== option.id),
                  },
                ],
              });
            };
          }

          const inputDisplay = node.getElementsByClassName(
            `form_${step.id}_input_display_${option.id}`,
          )[0] as HTMLInputElement;
          inputDisplay.value = option.display;
          inputDisplay.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            const noneUpdateDataLists = value.steps.filter(
              (s) => s.id !== step.id,
            );

            updateValue({
              steps: [
                ...noneUpdateDataLists,
                {
                  ...step,
                  options: step.options.map((old) => {
                    if (old.id === option.id) {
                      return { ...old, display: target.value };
                    }
                    return old;
                  }),
                },
              ],
            });
          };

          const inputValue = node.getElementsByClassName(
            `form_${step.id}_input_value_${option.id}`,
          )[0] as HTMLInputElement;
          inputValue.value = option.value;
          inputValue.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            const noneUpdateDataLists = value.steps.filter(
              (s) => s.id !== step.id,
            );

            updateValue({
              steps: [
                ...noneUpdateDataLists,
                {
                  ...step,
                  options: step.options.map((old) => {
                    if (old.id === option.id) {
                      return { ...old, value: target.value };
                    }
                    return old;
                  }),
                },
              ],
            });
          };
        }
      }
    },
  }),
});

interface MultipleFormOptions {
  default: {
    title: null;
  };
  alignment: {
    title: string;
    position: number;
    options: {
      textAlignment: {
        label: string;
        defaultValue: string;
        widget: string;
      };
    };
  };
  dropdown: {
    title: string;
    position: number;
    options: {
      form: {
        label: string;
        defaultValue: formValue;
        widget: string;
      };
    };
  };
  color_picker: {
    title: string;
    position: number;
    options: {
      color_picker: {
        label: string;
        defaultValue: string;
        widget: string;
      };
    };
  };
}

type MultipleFormValues = {
  [K in keyof MultipleFormOptions as NonNullable<
    MultipleFormOptions[K]
  > extends { options: any }
    ? keyof NonNullable<MultipleFormOptions[K]>["options"]
    : never]: NonNullable<MultipleFormOptions[K]> extends {
    options: { [key: string]: { defaultValue: infer T } };
  }
    ? {
        [key in keyof NonNullable<MultipleFormOptions[K]>["options"]]: T;
      }[keyof NonNullable<MultipleFormOptions[K]>["options"]]
    : never;
};

function multipleForm(value: formValue) {
  const div = document.createElement("div");
  div.style.display = "flex";
  div.style.width = "100%";
  div.style.flexDirection = "column";
  div.style.gap = "0.5rem";
  const step1 = createformStep({
    number: 1,
    options: value.steps.find((step) => step.id === 1)?.options ?? [],
  });
  div.appendChild(step1);

  if (value.steps.length > 1) {
    value.steps
      .filter((step) => step.id !== 1)
      .forEach((step) => {
        const createStep = createformStep({
          number: step.id,
          options:
            value.steps.find((list) => list.id === step.id)?.options ?? [],
        });
        div.appendChild(createStep);
      });
  }

  return div;
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
  );
  div.appendChild(inputTitle);
  const groupButtons = document.createElement("div");
  groupButtons.style.display = "flex";
  groupButtons.style.gap = "0.5rem";
  const addMore = createButton({
    text: "Add Next Step",
    width: "9rem",
    backgroundColor: "#05df72",
    textColor: "#000000",
  });
  addMore.className = `add_more_step_${data.number}`;

  const remove = createButton({
    text: "Remove Step",
    width: "7rem",
    backgroundColor: "#fb2c36",
    textColor: "#fff",
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
    const createOption = createOptionButton(
      `form_${data.number}`,
      option.id,
      option.display,
      option.value,
    );

    body.appendChild(createOption);
  });
  div.appendChild(body);

  return div; // Return the DOM element
}

const createOptionButton = (
  formId: string,
  id: number,
  display: string,
  value: string,
) => {
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
  });
  addOption.className = `${formId}_add_option_${id}`;
  const removeOption = createButton({
    text: "Remove Option",
    width: "8rem",
    backgroundColor: "#fb2c36",
    textColor: "#000000",
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
  );

  const inputValue = createTextInput("Value", `${formId}_input_value_${id}`);

  option.appendChild(inputDisplay);
  option.appendChild(inputValue);

  return option;
};

const createTextInput = (labelText: string, id: string): HTMLDivElement => {
  // Create the main container div
  const container = document.createElement("div");

  // Create the label
  const label = document.createElement("label");
  label.textContent = labelText;
  label.style.fontSize = "0.875rem";
  container.appendChild(label);

  // Create the input element
  const input = document.createElement("input");
  input.type = "text";
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

  input.style.flexGrow = "1"; // Allow input to take up available space
  input.style.padding = "0.5rem";
  input.style.width = "100%";
  input.style.border = "1px solid #ccc";
  input.style.borderRadius = "0.25rem";

  return container;
};

const createButton = (input: {
  text: string;
  width: string;
  backgroundColor: string;
  textColor: string;
}) => {
  const button = document.createElement("button");
  button.textContent = input.text;
  button.style.width = input.width;
  button.style.borderRadius = "0.375rem";
  button.style.backgroundColor = input.backgroundColor;
  button.style.paddingTop = "0.25rem";
  button.style.paddingBottom = "0.25rem";
  button.style.color = input.textColor;
  button.style.cursor = "pointer";
  button.style.transition = "background-color 0.3s ease"; // Smooth transiti
  button.style.boxShadow =
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
  return button;
};

function displayForm(value: formValue) {
  // Create the main div container
  const body = document.createElement("div");
  // Create the "Pick your age!" span
  const script = document.createElement("script");
  script.src = "http://localhost:8080/unlayer-custom/script-multiple-form.js"; // Path to your JS file
  script.type = "text/javascript";
  script.defer = true; // Optional: load after parsing HTML
  body.appendChild(script); // or document.head.appendChild(script);

  for (const step of value.steps) {
    const container = document.createElement("div");
    if (step.id === 1) {
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
    const titleSpan = document.createElement("span");
    titleSpan.textContent = step.title;
    container.appendChild(titleSpan);

    for (const option of step.options) {
      const button = createButton({
        text: option.display,
        width: "15rem",
        backgroundColor: "#dc2626",
        textColor: "#fff",
      });
      button.className = `form_${step.id}_button_${option.id}`;

      container.appendChild(button);
    }

    body.appendChild(container);
  }

  return body; // Return the container element
}

unlayer.registerTool({
  name: "multiple_form",
  label: "Multiple Form",
  icon: "fa-list",
  supportedDisplayModes: ["web"],
  options: {
    default: {
      title: null,
    },
    alignment: {
      title: "Alignment",
      position: 1,
      options: {
        textAlignment: {
          label: "Text Alignment",
          defaultValue: "center",
          widget: "alignment",
        },
      },
    },
    dropdown: {
      title: "Edit Form Info",
      position: 2,
      options: {
        form: {
          label: "Edit Form Info",
          defaultValue: {
            steps: [
              {
                id: 1,
                title: "",
                options: [{ display: "", value: "", id: 1 }],
              },
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
        return displayForm(values.form).outerHTML;
      },
    }),
    exporters: {
      web: function (values: MultipleFormValues) {
        return displayForm(values.form).outerHTML;
      },
    },
    head: {
      css: function (values: MultipleFormValues) {},
      js: function (values: MultipleFormValues) {},
    },
  },
});

// function customJavascript(values: MultipleFormValues) {
//   for (const step of values.form.steps) {
//     for (const option of step.options) {
//       script += `
//         document.addEventListener("DOMContentLoaded", function () {
//           const form_${step.id}_button_${option.id} = document.getElementsByClassName("form_${step.id}_button_${option.id}")[0];
//           if (form_${step.id}_button_${option.id}) {
//             form_${step.id}_button_${option.id}.onclick = function(event) {
//               console.log("Click: form ${step.id}, option ${option.id}");
//               page = ${step.id + 1}
//             };
//           }
//         });
//       `;
//     }
//   }

//   return script;
// }
