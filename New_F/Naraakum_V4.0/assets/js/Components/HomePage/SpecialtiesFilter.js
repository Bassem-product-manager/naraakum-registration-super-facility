(function () {
  const itemsList = document.getElementById("specialties-list");
  const specialtiesContainer = document.getElementById("specialties-container");
  const moreSpecialtiesBtn = document.getElementById("more-specialties-btn");
  const searchInput = document.getElementById("searchInput");
  const sectionTitle = document.querySelector(".SpecialtiesSection h2");

  if (
    !itemsList ||
    !specialtiesContainer ||
    !moreSpecialtiesBtn ||
    !searchInput ||
    !sectionTitle
  ) {
    return;
  }

  const defaultMarkup = itemsList.innerHTML.trim();
  const buttonLabel = moreSpecialtiesBtn.querySelector("span");
  const buttonIcon = moreSpecialtiesBtn.querySelector(".fi");

  const specialtiesModes = {
    default: {
      title: "تصفح الأطباء حسب التخصص",
      placeholder: "بحث عن التخصص",
      markup: defaultMarkup,
    },
    monitoring: {
      title: "تصفح خدمات المتابعة عن بُعد",
      placeholder: "بحث عن الخدمة",
      items: [
        {
          name: "سكر الدم",
          image: "assets/images/Blood-sugar.svg",
          alt: "Blood sugar",
          href: "MonitoringStep_1.html",
        },
        {
          name: "الوزن",
          image: "assets/images/Diet.svg",
          alt: "Weight",
          href: "MonitoringStep_1.html",
        },
        {
          name: "ضغط الدم",
          image: "assets/images/Blood-pressure.svg",
          alt: "Blood pressure",
          href: "MonitoringStep_1.html",
        },
        {
          name: "النشاط البدني",
          image: "assets/images/Physical-activity.svg",
          alt: "Physical activity",
          href: "MonitoringStep_1.html",
        },
      ],
    },
  };

  function getItems() {
    return itemsList.getElementsByTagName("li");
  }

  function setMoreButtonText(isExpanded) {
    if (!buttonLabel) {
      return;
    }

    buttonLabel.textContent = isExpanded ? "عرض أقل" : "عرض الكل";
  }

  function resetExpandedState() {
    specialtiesContainer.classList.remove("auto-height");
    buttonIcon?.classList.remove("rotate-180");
    setMoreButtonText(false);
  }

  function setMoreButtonVisible(isVisible) {
    moreSpecialtiesBtn.style.display = isVisible ? "" : "none";
    moreSpecialtiesBtn.style.opacity = isVisible ? "1" : "0";
    moreSpecialtiesBtn.style.visibility = isVisible ? "visible" : "hidden";
  }

  function updateMoreButtonVisibility(isFiltering = false) {
    const shouldShowButton = !isFiltering && getItems().length >= 20;
    setMoreButtonVisible(shouldShowButton);
  }

  function createItemMarkup(item) {
    return `
      <li>
        <a href="${item.href}" class="specialty-item">
          <span>
            <img src="${item.image}" alt="${item.alt}" />
          </span>
          <p>${item.name}</p>
        </a>
      </li>
    `;
  }

  function renderSpecialties(mode = "default") {
    const selectedMode = specialtiesModes[mode] || specialtiesModes.default;

    sectionTitle.textContent = selectedMode.title;
    searchInput.placeholder = selectedMode.placeholder;
    searchInput.value = "";

    if (selectedMode.markup) {
      itemsList.innerHTML = selectedMode.markup;
    } else {
      itemsList.innerHTML = selectedMode.items.map(createItemMarkup).join("");
    }

    resetExpandedState();
    filterItems();
  }

  function filterItems() {
    const filter = searchInput.value.trim().toLowerCase();
    const items = getItems();

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const itemText = (item.textContent || item.innerText || "").toLowerCase();
      item.style.display = itemText.indexOf(filter) > -1 ? "" : "none";
    }

    updateMoreButtonVisibility(filter.length > 0);
  }

  moreSpecialtiesBtn.addEventListener("click", function () {
    this.querySelector(".fi")?.classList.toggle("rotate-180");
    specialtiesContainer.classList.toggle("auto-height");
    setMoreButtonText(specialtiesContainer.classList.contains("auto-height"));
  });

  window.filterItems = filterItems;
  window.setSpecialtiesMode = function (mode) {
    renderSpecialties(mode === "monitoring" ? "monitoring" : "default");
  };

  renderSpecialties("default");
})();
