(function () {
  const audience = document.body?.dataset?.audience;

  if (!audience) return;

  const SECTION_TITLES = {
    homeVisit: "زيارة طبيب منزلية",
    online: "استشارة عن بعد",
    clinic: "استشر طبيبك بالعيادة",
  };

  const SPECIALTY_ASSETS = {
    "الطب العام": {
      src: "assets/images/General_Medicine.svg",
      alt: "General_Medicine",
    },
    القلب: {
      src: "assets/images/Cardiology.svg",
      alt: "Cardiology",
    },
    "المخ والأعصاب": {
      src: "assets/images/Neurology.svg",
      alt: "Neurology",
    },
    "انف واذن وحنجرة": {
      src: "assets/images/Ear_Nose.svg",
      alt: "Ear_Nose",
    },
    "المسالك البولية": {
      src: "assets/images/Urology.svg",
      alt: "Urology",
    },
    "طب العظام": {
      src: "assets/images/Orthopedics.svg",
      alt: "Orthopedics",
    },
    الكلى: {
      src: "assets/images/Kidney.svg",
      alt: "Kidney",
    },
    الصدرية: {
      src: "assets/images/Pulmonary.svg",
      alt: "Pulmonary",
    },
    "طب الأطفال": {
      src: "assets/images/Pediatrics.svg",
      alt: "Pediatrics",
    },
    "النساء والولادة": {
      src: "assets/images/Obstetrics.svg",
      alt: "Obstetrics",
    },
    "الطب النفسي": {
      src: "assets/images/Psychiatry.svg",
      alt: "Psychiatry",
    },
    "الجلدية والتجميل": {
      src: "assets/images/Dermatology.svg",
      alt: "Dermatology",
    },
    التغذية: {
      src: "assets/images/rasheeqNutrition.svg",
      alt: "Nutrition",
    },
  };

  const AUDIENCE_PRESETS = {
    women: {
      label: "صحة المرأة",
      specialties: [
        "النساء والولادة",
        "التغذية",
        "الطب النفسي",
        "الجلدية والتجميل",
        "الطب العام",
      ],
      sections: {
        homeVisit: {
          cards: [
            {
              name: "د. عائشة محمد عسيري",
              image: "assets/images/providerWomen.png",
              role: "استشارية",
              specialty: "النساء والولادة",
              description:
                "متابعة منزلية لصحة المرأة تشمل الفحوصات الوقائية والمراجعات الدورية وخطط متابعة تناسب كل مرحلة.",
              centerName: "مركز صحة المرأة",
            },
            {
              name: "د. عبير",
              image: "assets/images/providerWomen.png",
              role: "أخصائية",
              specialty: "التغذية",
              description:
                "زيارات منزلية للتغذية العلاجية وتنظيم الوزن ومتابعة الاحتياجات الغذائية المرتبطة بصحة المرأة.",
              centerName: "مركز BMC",
            },
          ],
        },
        online: {
          cards: [
            {
              name: "د. ديما",
              image: "assets/images/providerWomen.png",
              role: "استشارية",
              specialty: "النساء والولادة",
              description:
                "استشارة عن بعد لأسئلة صحة المرأة والمتابعة الوقائية والاطمئنان على الأعراض والخطة العلاجية.",
              hideCenter: true,
            },
          ],
        },
        clinic: {
          cards: [
            {
              name: "د. بسام الحمصي",
              image: "assets/images/providerMan.png",
              role: "استشاري",
              specialty: "النساء والولادة",
              description:
                "موعد عيادة لمتابعة صحة المرأة مع تقييم الحالة ووضع خطة مراجعة مناسبة للحالة الحالية.",
              centerName: "مركز صحة المرأة",
            },
          ],
        },
      },
    },
    men: {
      label: "صحة الرجل",
      specialties: [
        "المسالك البولية",
        "القلب",
        "التغذية",
        "الطب النفسي",
        "الطب العام",
      ],
      sections: {
        homeVisit: {
          cards: [
            {
              name: "رياض حماد المالكي",
              image: "assets/images/providerMan.png",
              role: "استشاري",
              specialty: "المسالك البولية",
              description:
                "زيارة منزلية موجهة لصحة الرجل تشمل تقييم الأعراض ومتابعة الحالات الشائعة وخطة علاجية واضحة.",
              centerName: "مركز الدكتور بسام الطبي",
            },
            {
              name: "د. محمود المصري",
              image: "assets/images/providerMan.png",
              role: "استشاري",
              specialty: "القلب",
              description:
                "زيارات منزلية لمتابعة صحة القلب وضغط الدم واللياقة القلبية ضمن مسار يناسب صحة الرجل الوقائية.",
              centerName: "مركز الدكتور سليمان الحبيب",
            },
          ],
        },
        online: {
          cards: [
            {
              name: "رياض حماد المالكي",
              image: "assets/images/providerMan.png",
              role: "استشاري",
              specialty: "المسالك البولية",
              description:
                "استشارة عن بعد لصحة الرجل لمراجعة الأعراض والنتائج والفحوصات ووضع الخطوة التالية بثقة.",
              hideCenter: true,
            },
          ],
        },
        clinic: {
          cards: [
            {
              name: "د. بسام الحمصي",
              image: "assets/images/providerMan.png",
              role: "استشاري",
              specialty: "الطب العام",
              description:
                "موعد عيادة لصحة الرجل لتقييم الحالة العامة والفحوصات الوقائية وربطها بخطة متابعة متكاملة.",
              centerName: "مركز BMC",
            },
          ],
        },
      },
    },
    children: {
      label: "صحة الأطفال",
      specialties: [
        "طب الأطفال",
        "انف واذن وحنجرة",
        "التغذية",
        "الجلدية والتجميل",
        "الطب العام",
      ],
      sections: {
        homeVisit: {
          cards: [
            {
              name: "د. ديما",
              image: "assets/images/providerWomen.png",
              role: "استشارية",
              specialty: "طب الأطفال",
              description:
                "زيارة منزلية للأطفال لمتابعة النمو والأعراض اليومية والتعامل السريع مع المشكلات الشائعة بأمان.",
              centerName: "مركز الأطفال",
            },
            {
              name: "د. عبير",
              image: "assets/images/providerWomen.png",
              role: "أخصائية",
              specialty: "التغذية",
              description:
                "متابعة تغذية الأطفال في المنزل لدعم النمو السليم وبناء روتين غذائي مناسب لكل مرحلة عمرية.",
              centerName: "مركز BMC",
            },
          ],
        },
        online: {
          cards: [
            {
              name: "د. عائشة محمد عسيري",
              image: "assets/images/providerWomen.png",
              role: "استشارية",
              specialty: "طب الأطفال",
              description:
                "استشارة عن بعد لمشكلات الأطفال اليومية ولمراجعة النمو والتطعيمات والخطة العلاجية بوضوح.",
              hideCenter: true,
            },
          ],
        },
        clinic: {
          cards: [
            {
              name: "د. بسام الحمصي",
              image: "assets/images/providerMan.png",
              role: "استشاري",
              specialty: "طب الأطفال",
              description:
                "زيارة عيادية للأطفال للفحص السريري الكامل وربط الأعراض الحالية بتاريخ الحالة والنمو.",
              centerName: "مركز الأطفال",
            },
          ],
        },
      },
    },
    seniors: {
      label: "صحة كبار السن",
      specialties: [
        "الطب العام",
        "القلب",
        "المخ والأعصاب",
        "طب العظام",
        "الكلى",
        "الصدرية",
        "التغذية",
      ],
      sections: {
        homeVisit: {
          cards: [
            {
              name: "د. محمود المصري",
              image: "assets/images/providerMan.png",
              role: "استشاري",
              specialty: "الطب العام",
              description:
                "زيارة منزلية لكبار السن لمراجعة الحالة العامة والقياسات الحيوية والأدوية وخطة الرعاية اليومية.",
              centerName: "مركز الرعاية المنزلية",
            },
            {
              name: "رياض حماد المالكي",
              image: "assets/images/providerMan.png",
              role: "استشاري",
              specialty: "القلب",
              description:
                "متابعة قلبية منزلية لكبار السن تشمل فحص المؤشرات المهمة وربطها بخطة مريحة داخل المنزل.",
              centerName: "مركز الدكتور بسام الطبي",
            },
          ],
        },
        online: {
          cards: [
            {
              name: "د. ديما",
              image: "assets/images/providerWomen.png",
              role: "استشارية",
              specialty: "المخ والأعصاب",
              description:
                "استشارة عن بعد لكبار السن لمتابعة الذاكرة والتوازن والأعراض العصبية وتوجيه الأسرة للخطوة المناسبة.",
              hideCenter: true,
            },
          ],
        },
        clinic: {
          cards: [
            {
              name: "د. عائشة محمد عسيري",
              image: "assets/images/providerWomen.png",
              role: "استشارية",
              specialty: "طب العظام",
              description:
                "زيارة عيادية لكبار السن لمتابعة الحركة والمفاصل وآلام العظام مع خطة مراجعة تدريجية وواضحة.",
              centerName: "مركز كبار السن",
            },
          ],
        },
      },
    },
  };

  const preset = AUDIENCE_PRESETS[audience];

  if (!preset) return;

  function replaceText(root, replacements) {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => {
      let value = node.nodeValue;

      Object.entries(replacements).forEach(([from, to]) => {
        value = value.split(from).join(to);
      });

      node.nodeValue = value;
    });
  }

  function findSection(prefix) {
    return Array.from(document.querySelectorAll("main .ContentWrapper")).find(
      (section) => section.querySelector(".ServiceTitleBar h2")?.textContent.includes(prefix),
    );
  }

  function setSectionTitle(section, title, count) {
    const titleEl = section?.querySelector(".ServiceTitleBar h2");
    const countEl = section?.querySelector(".ServiceTitleBar p");

    if (titleEl) titleEl.textContent = title;
    if (countEl) countEl.textContent = `عدد النتائج (${count})`;
  }

  function rekeyRadios(root, prefix) {
    root.querySelectorAll('input[type="radio"]').forEach((input, index) => {
      const oldId = input.id;
      input.name = `${prefix}-${input.name || "radio"}`;
      input.id = `${prefix}-${index}`;

      const label = oldId ? root.querySelector(`label[for="${oldId}"]`) : null;
      if (label) label.setAttribute("for", input.id);
    });
  }

  function ensureMetaNode(providerData) {
    let meta = providerData?.querySelector(":scope > span.d-flex.gap-1");

    if (!providerData) return null;

    if (!meta) {
      meta = document.createElement("span");
      meta.className = "d-flex gap-1 fsize-14 semiBold";

      const description = providerData.querySelector(".text-wrap-element");
      if (description) {
        providerData.insertBefore(meta, description);
      } else {
        providerData.appendChild(meta);
      }
    }

    return meta;
  }

  function setCard(cardWrapper, config) {
    const card =
      cardWrapper?.classList?.contains("providerCard")
        ? cardWrapper
        : cardWrapper?.querySelector(".providerCard");

    if (!card) return;

    const providerInfo = card.querySelector(".providerInfo");
    const providerData = providerInfo?.querySelector(".providerData");
    const image = card.querySelector(".providerImage img");
    const name = providerData?.querySelector(".name");
    const description = card.querySelector(".text-wrap-element .text");
    const meta = ensureMetaNode(providerData);
    const centerLink = card.querySelector(".providerDataRow .d-flex.gap-2 a");
    const centerRow = centerLink?.closest(".d-flex.gap-2");

    if (image && config.image) {
      image.src = config.image;
      image.alt = config.name;
    }

    if (name) {
      name.textContent = config.name;
    }

    if (meta) {
      meta.innerHTML =
        config.meta ||
        `<a href="#">${config.role || "استشاري"}</a> - <a href="#">${config.specialty}</a>`;
    }

    if (description) {
      description.textContent = config.description;
    }

    if (centerRow && config.hideCenter) {
      centerRow.hidden = true;
      centerRow.classList.add("d-none");
    } else if (centerLink && config.centerName) {
      if (centerRow) {
        centerRow.hidden = false;
        centerRow.classList.remove("d-none");
      }
      centerLink.textContent = config.centerName;
    } else if (centerRow) {
      centerRow.hidden = false;
      centerRow.classList.remove("d-none");
    }
  }

  function cloneCard(template, prefix) {
    const clone = template.cloneNode(true);
    rekeyRadios(clone, prefix);
    return clone;
  }

  function applySection(section, key, config) {
    if (!section || !config) return;

    setSectionTitle(section, `${SECTION_TITLES[key]} / ${preset.label}`, config.cards.length);

    const row = section.querySelector(":scope > .row.g-3");
    const firstCard = row?.querySelector(":scope > .col-12");

    if (!row || !firstCard) return;

    let cards = Array.from(row.querySelectorAll(":scope > .col-12"));

    while (cards.length < config.cards.length) {
      const clone = cloneCard(firstCard, `${audience}-${key}-${cards.length}`);
      row.appendChild(clone);
      cards = Array.from(row.querySelectorAll(":scope > .col-12"));
    }

    cards.forEach((card, index) => {
      if (index < config.cards.length) {
        card.hidden = false;
        card.classList.remove("d-none");
        setCard(card, config.cards[index]);
      } else {
        card.hidden = true;
        card.classList.add("d-none");
      }
    });
  }

  function applySpecialties(specialties) {
    const items = Array.from(document.querySelectorAll(".Modal-specialties-list li"));

    if (!items.length) return;

    items.forEach((item, index) => {
      const specialty = specialties[index];
      const input = item.querySelector('input[type="radio"]');
      const label = item.querySelector("label");
      const image = item.querySelector("img");
      const text = item.querySelector("p");

      if (!specialty) {
        item.hidden = true;
        item.style.display = "none";
        if (input) input.checked = false;
        return;
      }

      const asset = SPECIALTY_ASSETS[specialty] || SPECIALTY_ASSETS["الطب العام"];
      item.hidden = false;
      item.style.display = "";

      if (text) text.textContent = specialty;
      if (image && asset) {
        image.src = asset.src;
        image.alt = asset.alt;
      }
      if (input) {
        input.checked = false;
        input.value = specialty;
      }
      if (label && input?.id) {
        label.setAttribute("for", input.id);
      }
    });

    document.querySelectorAll(".specialty-search").forEach((input) => {
      input.value = "";
    });

    document.querySelectorAll('[data-name="submit-specialty"]').forEach((button) => {
      button.disabled = true;
    });
  }

  function applySummaryTexts() {
    const replacements = {
      "زيارة طبيب منزلية / مسالك بولية": `زيارة طبيب منزلية / ${preset.label}`,
      "استشارة عن بعد / مسالك بولية": `استشارة عن بعد / ${preset.label}`,
      "استشارة عن بعد (30 دقيقة) / مسالك بولية": `استشارة عن بعد (30 دقيقة) / ${preset.label}`,
      "استشر طبيبك بالعيادة / مسالك بولية": `استشر طبيبك بالعيادة / ${preset.label}`,
    };

    [".CartSide", "#ServicesCartModal", "#DoctorCalendarModal"].forEach((selector) => {
      document.querySelectorAll(selector).forEach((node) => {
        replaceText(node, replacements);
      });
    });
  }

  const sections = {
    homeVisit: findSection(SECTION_TITLES.homeVisit),
    online: findSection(SECTION_TITLES.online),
    clinic: findSection(SECTION_TITLES.clinic),
  };

  applySection(sections.homeVisit, "homeVisit", preset.sections.homeVisit);
  applySection(sections.online, "online", preset.sections.online);
  applySection(sections.clinic, "clinic", preset.sections.clinic);
  applySpecialties(preset.specialties);
  applySummaryTexts();

  document.title = `${preset.label} | نرعاكم`;
})();
