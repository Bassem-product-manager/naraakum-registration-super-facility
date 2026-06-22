      document.querySelectorAll(".text-wrapper").forEach((wrapper) => {
        const textContainer = wrapper.querySelector(".text-container");
        const button = wrapper.querySelector(".toggle-button");

        const fullHeight = textContainer.scrollHeight;
        const collapsedHeight = 60;

        if (fullHeight <= collapsedHeight + 10) {
          button.style.display = "none";
        } else {
          textContainer.style.maxHeight = collapsedHeight + "px";

          button.addEventListener("click", () => {
            const isExpanded =
              textContainer.style.maxHeight !== collapsedHeight + "px";

            if (isExpanded) {
              textContainer.style.maxHeight = collapsedHeight + "px";
              button.textContent = "Show More";
            } else {
              textContainer.style.maxHeight = fullHeight + "px";
              button.textContent = "Show Less";
            }
          });
        }
      });