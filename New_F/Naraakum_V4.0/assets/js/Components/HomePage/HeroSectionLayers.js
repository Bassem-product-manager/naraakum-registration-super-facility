(function () {
  const layers = document.querySelectorAll(
    "#HeroFirstLayer, #HomeVisitsLayer, #MonitoringLayer"
  );

  if (!layers.length) {
    return;
  }

  const monitoringLayer = document.getElementById("MonitoringLayer");
  const monitoringRotatorEnabled =
    monitoringLayer?.getAttribute("data-monitoring-rotator") === "true";
  const monitoringImage = monitoringLayer?.querySelector(
    ".monitoringInfoBox .videoBox.monitoringRawMedia img"
  );
  const monitoringTitle = monitoringLayer?.querySelector(
    ".monitoringInfoBox .textBox h1"
  );
  const monitoringDescription = monitoringLayer?.querySelector(
    ".monitoringInfoBox .textBox p"
  );

  const homeVisitsSection = document.querySelector(".HomeVisitsSection");
  const homeVisitsArticle = homeVisitsSection?.querySelector(
    ".sectionHead article"
  );
  const homeVisitsMedia = homeVisitsSection?.querySelector(
    ".sectionHead .video-side"
  );
  const homeVisitsCardsRow = homeVisitsSection?.querySelector(".sectionBody .row");

  const homePlansContainer = document.querySelector(
    "#home-plans-preview .container"
  );
  const specialtiesSection = document.querySelector(".SpecialtiesSection");
  const blogSection = document.querySelector(".BlogSection");
  const blogTitle = blogSection?.querySelector(".sectionHead h1");
  const blogDescription = blogSection?.querySelector(".sectionHead p");
  const blogCards = blogSection
    ? Array.from(blogSection.querySelectorAll(".blogCard"))
    : [];
  const featuresSection = document.querySelector(".FeaturesSection");
  const featuresTitle = featuresSection?.querySelector(".sectionHead h1");
  const featuresDescription = featuresSection?.querySelector(".sectionHead p");
  const featureCards = featuresSection
    ? Array.from(featuresSection.querySelectorAll(".FeaturesCard"))
    : [];

  const defaultHomeVisitsState = {
    articleMarkup: homeVisitsArticle?.innerHTML || "",
    mediaMarkup: homeVisitsMedia?.innerHTML || "",
    cardsMarkup: homeVisitsCardsRow?.innerHTML || "",
  };

  const defaultPlansMarkup = homePlansContainer?.innerHTML || "";
  const defaultBlogState = {
    title: blogTitle?.textContent.trim() || "",
    description: blogDescription?.textContent.trim() || "",
    cards: blogCards.map((card) => ({
      href:
        card.querySelector(".cardHead a")?.getAttribute("href") ||
        card.querySelector(".cardBody a")?.getAttribute("href") ||
        "#",
      image: card.querySelector("img")?.getAttribute("src") || "",
      alt: card.querySelector("img")?.getAttribute("alt") || "",
      title: card.querySelector(".cardBody a")?.textContent.trim() || "",
      date: card.querySelector(".cardBody p")?.textContent.trim() || "",
    })),
  };
  const defaultFeaturesState = {
    title: featuresTitle?.textContent.trim() || "",
    description: featuresDescription?.textContent.trim() || "",
    cards: featureCards.map((card) => ({
      iconMarkup: card.querySelector(".cardHead")?.innerHTML || "",
      title: card.querySelector(".cardBody h2")?.textContent.trim() || "",
      description: card.querySelector(".cardBody p")?.textContent.trim() || "",
    })),
  };

  const monitoringSlides = [
    {
      title: "خدمة مراقبة ذكية وشاملة",
      description:
        "حل ذكي لمتابعة مستوى السكر، ضغط الدم، والمؤشرات الحيوية الأخرى على مدار الساعة، مع إمكانية التنبؤ المبكر بالمخاطر الصحية وتقديم تدخل علاجي دقيق في الوقت المناسب.",
      image:
        "./Elderly%20Arab%20man%20with%20glucose%20monitor.png",
      alt: "شاب يرتدي جهاز قياس السكر ويتابع حالته عبر الهاتف",
    },
    {
      title: "تغذية ومتابعة في مسار واحد",
      description:
        "اجمع بين النظام الغذائي والمتابعة عن بُعد في تجربة واحدة تساعدك على الالتزام، وتحسين قراءاتك، ومراجعة حالتك بشكل أوضح.",
      image: "assets/images/Fit figure with Riyadh skyline.png",
      alt: "رجل رياضي يعكس نمط حياة صحي مع المتابعة عن بُعد",
    },
  ];

  const monitoringServicesContent = {
    title: "خدمات المتابعة عن بُعد",
    description:
      "خدمات مرنة لمتابعة سكر الدم والوزن وضغط الدم والنشاط البدني مع استشارات تغذية وتقارير متابعة مستمرة.",
    buttonText: "ابدأ المتابعة",
    buttonHref: "MonitoringStep_1.html",
    cards: [
      {
        title: "متابعة سكر الدم",
        image: "assets/images/Blood-sugar.svg",
        alt: "متابعة سكر الدم",
        href: "MonitoringStep_1.html",
        className: "MonitoringSugarBG",
      },
      {
        title: "متابعة ضغط الدم",
        image: "assets/images/Blood-pressure.svg",
        alt: "متابعة ضغط الدم",
        href: "MonitoringStep_1.html",
        className: "MonitoringPressureBG",
      },
      {
        title: "متابعة الوزن",
        image: "assets/images/Diet.svg",
        alt: "متابعة الوزن",
        href: "MonitoringStep_1.html",
        className: "MonitoringWeightBG",
      },
      {
        title: "متابعة النشاط البدني",
        image: "assets/images/Physical-activity.svg",
        alt: "متابعة النشاط البدني",
        href: "MonitoringStep_1.html",
        className: "MonitoringActivityBG",
      },
      {
        title: "استشارة تغذية علاجية",
        image: "assets/images/rasheeqNutrition.svg",
        alt: "استشارة تغذية علاجية",
        href: "MonitoringStep_1.html",
        className: "MonitoringNutritionBG",
      },
      {
        title: "تقرير متابعة شامل",
        image: "assets/images/Monitoring.svg",
        alt: "تقرير متابعة شامل",
        href: "MonitoringStep_1.html",
        className: "MonitoringReportBG",
      },
    ],
  };

  const monitoringPackagesContent = {
    title: "اختر الباكدج المناسبة لك",
    description:
      "باكدجات تجمع بين الاستشارات، مراجعة التحاليل والأشعة، والمتابعة المنتظمة حسب هدفك الصحي.",
    nutritionTitle: "باكدجات النظام الغذائي وخسارة الوزن",
    nutritionDescription:
      "باكدجات مرنة للتغذية العلاجية وخسارة الوزن، مع مراجعة الحالة وبناء مسار واضح للالتزام.",
    nutritionPackages: [
      {
        badge: "باكدج مجانية",
        title: "باكدج البداية المجانية",
        description:
          "مدخل سريع للتعرف على احتياجك الغذائي قبل الانتقال إلى باكدجات المتابعة الكاملة.",
        benefits: [
          "استشارة تغذية أولية مجانية",
          "مراجعة تحليل أساسي مع قراءة سونار البطن أو سونار الكبد إذا كان مرفقًا",
          "توصيات غذائية أولية لمدة 3 أيام",
          "تحديد الهدف المناسب للحالة",
        ],
        href: "MonitoringStep_1.html",
        buttonLabel: "ابدأ مجانًا",
      },
      {
        badge: "الأكثر طلبًا",
        title: "باكدج التوازن الذكي",
        description:
          "باكدج مناسبة لمن يريد تنظيم غذائه اليومي مع متابعة عملية بدون تعقيد.",
        benefits: [
          "2 استشارة تغذية خلال الشهر",
          "مراجعة تحليلين مع قراءة سونار الكبد الدهني أو سونار البطن",
          "خطة غذائية أسبوعية متجددة",
          "متابعة وزن ومقاسات بشكل دوري",
        ],
        href: "MonitoringStep_1.html",
        buttonLabel: "اطلب هذه الباكدج",
        featured: true,
      },
      {
        badge: "لخسارة الوزن",
        title: "باكدج النزول المستمر",
        description:
          "تركيز أعلى على خسارة الوزن بثبات مع تعديلات أسرع حسب الاستجابة والالتزام.",
        benefits: [
          "3 استشارات تغذية علاجية",
          "مراجعة 3 تحاليل مع قراءة سونار الغدة أو سونار البطن حسب الحالة",
          "خطة وجبات محسوبة حسب الهدف",
          "تحديث أسبوعي لمسار النزول",
        ],
        href: "MonitoringStep_1.html",
        buttonLabel: "اطلب هذه الباكدج",
      },
      {
        badge: "متابعة شهرية",
        title: "باكدج التحكم الكامل",
        description:
          "باكدج شاملة لمن يريد متابعة أقرب وقراءة أوضح للتطور الغذائي والصحي.",
        benefits: [
          "4 استشارات تغذية خلال الشهر",
          "مراجعة ملفات التحاليل مع قراءة تقارير السونار والأشعة المرتبطة بالحالة",
          "خطة غذائية وخيارات بديلة",
          "تقرير متابعة شهري شامل",
        ],
        href: "MonitoringStep_1.html",
        buttonLabel: "اطلب هذه الباكدج",
      },
    ],
    sugarTitle: "باكدجات سكر الدم",
    sugarDescription:
      "باكدجات لمتابعة القراءات اليومية وربطها بالتحاليل والاستشارات الغذائية والطبية.",
    sugarPackages: [
      {
        badge: "باكدج مجانية",
        title: "باكدج سكر البداية المجانية",
        description:
          "تعرف على وضعك الحالي وابدأ بخطوات أولية واضحة قبل الاشتراك في المتابعة الممتدة.",
        benefits: [
          "استشارة تعريفية مجانية",
          "مراجعة آخر تحليل سكر مع قراءة سونار الكلى أو سونار البطن إذا كان مرفقًا",
          "ملف متابعة لأول 3 قراءات",
          "توصيات أولية لنظام القياس",
        ],
        href: "MonitoringStep_1.html",
        buttonLabel: "ابدأ مجانًا",
      },
      {
        badge: "متابعة يومية",
        title: "باكدج الاطمئنان اليومي",
        description:
          "باكدج مناسبة لمن يحتاج تنظيم قراءات السكر والمتابعة المستمرة بشكل واضح.",
        benefits: [
          "2 استشارة متابعة شهرية",
          "مراجعة تحاليل السكر مع قراءة إيكو القلب أو دوبلر الشرايين عند الحاجة",
          "متابعة قراءات السكر اليومية",
          "تنبيهات وتوصيات مرتبطة بالقراءات",
        ],
        href: "MonitoringStep_1.html",
        buttonLabel: "اطلب هذه الباكدج",
      },
      {
        badge: "الأكثر شمولًا",
        title: "باكدج السيطرة المتقدمة",
        description:
          "باكدج متكاملة لمن يحتاج ربط السكر بالوجبات والنشاط والتقارير العلاجية بشكل أوسع.",
        benefits: [
          "4 استشارات سكر وتغذية",
          "مراجعة 4 تحاليل مع قراءة دوبلر شرايين الساقين أو سونار الكلى أو إيكو القلب",
          "تقارير أسبوعية مفصلة للقراءات",
          "تنسيق أوضح مع الخطة العلاجية",
        ],
        href: "MonitoringStep_1.html",
        buttonLabel: "اطلب هذه الباكدج",
        featured: true,
      },
    ],
  };

  const monitoringBlogContent = {
    title: "مدونة التغذية والمتابعة عن بُعد",
    description:
      "مقالات عملية عن التغذية العلاجية، سكر الدم، ضغط الدم، وكيف تبني نمط حياة صحي مع متابعة مستمرة.",
    cards: [
      {
        href: "MonitoringStep_1.html",
        image: "assets/images/blog-img-1.png",
        alt: "متابعة سكر الدم",
        title: "كيف تتابع سكر الدم يوميًا بطريقة صحيحة؟",
        date: "10 يناير 2025",
      },
      {
        href: "MonitoringStep_1.html",
        image: "assets/images/blog-img-2.png",
        alt: "متابعة ضغط الدم",
        title: "متى تحتاج متابعة ضغط الدم عن بُعد وما المؤشرات الأهم؟",
        date: "12 يناير 2025",
      },
      {
        href: "rasheeqTherapeuticNutrition.html",
        image: "assets/images/blog-img-3.png",
        alt: "التغذية العلاجية وخسارة الوزن",
        title: "كيف تساعدك التغذية العلاجية في خسارة الوزن بثبات؟",
        date: "15 يناير 2025",
      },
      {
        href: "MonitoringStep_1.html",
        image: "assets/images/blog-img-4.png",
        alt: "المتابعة عن بُعد للمؤشرات الحيوية",
        title: "ما أهم المؤشرات التي تستحق متابعة منتظمة عن بُعد؟",
        date: "18 يناير 2025",
      },
    ],
  };
  const monitoringFeaturesContent = {
    title: "لماذا المتابعة عن بُعد؟",
    description:
      "متابعة يومية تربط القراءات الحيوية بالتغذية والنشاط وتقارير المراجعة، لتفهم حالتك بشكل أوضح وتتدخل في الوقت المناسب.",
    cards: [
      {
        image: "assets/images/monitoring-feature-sugar.svg",
        alt: "متابعة سكر الدم",
        title: "متابعة سكر الدم",
        description:
          "قراءات يومية موثقة تساعدك على فهم التذبذب ومراجعة النتائج بسهولة.",
      },
      {
        image: "assets/images/monitoring-feature-pressure.svg",
        alt: "متابعة ضغط الدم",
        title: "متابعة ضغط الدم",
        description:
          "مراقبة منتظمة للضغط مع عرض واضح للمؤشرات الأساسية والتنبيهات المهمة.",
      },
      {
        image: "assets/images/monitoring-feature-weight.svg",
        alt: "متابعة الوزن",
        title: "متابعة الوزن",
        description:
          "ربط الوزن بالمستهدف الغذائي والتغيرات الأسبوعية في مسار واحد واضح.",
      },
      {
        image: "assets/images/monitoring-feature-activity.svg",
        alt: "متابعة النشاط البدني",
        title: "متابعة النشاط البدني",
        description:
          "قياس النشاط والحركة اليومية مع توصيات أدق لرفع الالتزام وتحسين النتائج.",
      },
    ],
  };

  let monitoringIndex = 0;
  let monitoringTimer = null;
  let monitoringSwitchInProgress = false;

  function hideAll() {
    layers.forEach((layer) => layer.classList.remove("active-layer"));
  }

  function createHomeServiceCardMarkup(card) {
    return `
      <div class="item col">
        <div class="visitsTypeCard">
          <div class="cardHead">
            <a href="${card.href}" class="${card.className}">
              <img src="${card.image}" alt="${card.alt}" />
            </a>
          </div>
          <div class="cardBody">
            <a href="${card.href}">${card.title}</a>
            <p>
              تبدأ من
              <span>299</span>
              <i class="icon-saudi_riyal"></i>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  function createMonitoringHeroArticleMarkup() {
    return `
      <span class="monitoringServiceEyebrow">رعاية مستمرة عن بُعد</span>
      <h1>خدمات متابعة يومية بتجربة أوضح وأسهل</h1>
      <p>
        متابعة سكر الدم والوزن وضغط الدم والنشاط البدني داخل مسار واحد، مع
        استشارات تغذية وتقارير متابعة تساعدك على قراءة حالتك بشكل أدق.
      </p>
      <div class="monitoringServiceChips">
        <span>سكر الدم</span>
        <span>ضغط الدم</span>
        <span>الوزن</span>
        <span>النشاط البدني</span>
      </div>
      <a href="${monitoringServicesContent.buttonHref}" class="btn btn-44">
        ${monitoringServicesContent.buttonText}
      </a>
    `;
  }

  function createMonitoringHeroMediaMarkup() {
    return `
      <div class="monitoringMediaCard">
        <div class="monitoringMediaGlow"></div>
        <div class="monitoringMediaMetric monitoringMetricSugar">
          <span>سكر الدم</span>
          <strong>98</strong>
          <small>mg/dL</small>
        </div>
        <div class="monitoringMediaMetric monitoringMetricPressure">
          <span>ضغط الدم</span>
          <strong>120/80</strong>
          <small>mmHg</small>
        </div>
        <div class="monitoringMediaMetric monitoringMetricWeight">
          <span>الوزن</span>
          <strong>82</strong>
          <small>kg</small>
        </div>
        <div class="monitoringMediaMetric monitoringMetricActivity">
          <span>النشاط</span>
          <strong>7.4k</strong>
          <small>خطوة</small>
        </div>
        <img
          class="monitoringMediaPerson"
          src="./Elderly%20Arab%20man%20with%20glucose%20monitor.png"
          alt="متابعة المؤشرات الحيوية عبر الجوال"
        />
      </div>
    `;
  }

  function createFeatureIconMarkup(card) {
    return `<img src="${card.image}" alt="${card.alt}" />`;
  }

  function createBenefitsMarkup(benefits) {
    return benefits.map((benefit) => `<li>${benefit}</li>`).join("");
  }

  function createPackageCardMarkup(pkg) {
    const buttonClass = pkg.featured
      ? "btn btn-primary btn-36"
      : "btn btn-outline-primary btn-36";

    return `
      <div class="col">
        <article class="RasheeqPlanCard${pkg.featured ? " is-featured" : ""}">
          <span class="RasheeqBadge">${pkg.badge}</span>
          <h3>${pkg.title}</h3>
          <p>${pkg.description}</p>
          <ul class="RasheeqBenefits">
            ${createBenefitsMarkup(pkg.benefits)}
          </ul>
          <a href="${pkg.href}" class="${buttonClass}">${pkg.buttonLabel}</a>
        </article>
      </div>
    `;
  }

  function applyMonitoringServicesContent() {
    if (!homeVisitsCardsRow) {
      return;
    }

    homeVisitsCardsRow.innerHTML = monitoringServicesContent.cards
      .map(createHomeServiceCardMarkup)
      .join("");
  }

  function restoreDefaultServicesContent() {
    if (
      !homeVisitsArticle ||
      !homeVisitsMedia ||
      !homeVisitsCardsRow
    ) {
      return;
    }

    homeVisitsSection?.classList.remove("is-monitoring-mode");
    homeVisitsArticle.innerHTML = defaultHomeVisitsState.articleMarkup;
    homeVisitsMedia.innerHTML = defaultHomeVisitsState.mediaMarkup;
    homeVisitsCardsRow.innerHTML = defaultHomeVisitsState.cardsMarkup;
  }

  function applyMonitoringFeaturesContent() {
    if (!featuresTitle || !featuresDescription || !featureCards.length) {
      return;
    }

    featuresSection?.classList.add("is-monitoring-mode");
    featuresTitle.textContent = monitoringFeaturesContent.title;
    featuresDescription.textContent = monitoringFeaturesContent.description;

    featureCards.forEach((card, index) => {
      const cardContent = monitoringFeaturesContent.cards[index];
      if (!cardContent) {
        return;
      }

      const cardHead = card.querySelector(".cardHead");
      const cardTitle = card.querySelector(".cardBody h2");
      const cardDescription = card.querySelector(".cardBody p");

      if (cardHead) {
        cardHead.innerHTML = createFeatureIconMarkup(cardContent);
      }

      if (cardTitle) {
        cardTitle.textContent = cardContent.title;
      }

      if (cardDescription) {
        cardDescription.textContent = cardContent.description;
      }
    });
  }

  function restoreDefaultFeaturesContent() {
    if (!featuresTitle || !featuresDescription || !featureCards.length) {
      return;
    }

    featuresSection?.classList.remove("is-monitoring-mode");
    featuresTitle.textContent = defaultFeaturesState.title;
    featuresDescription.textContent = defaultFeaturesState.description;

    featureCards.forEach((card, index) => {
      const cardContent = defaultFeaturesState.cards[index];
      if (!cardContent) {
        return;
      }

      const cardHead = card.querySelector(".cardHead");
      const cardTitle = card.querySelector(".cardBody h2");
      const cardDescription = card.querySelector(".cardBody p");

      if (cardHead) {
        cardHead.innerHTML = cardContent.iconMarkup;
      }

      if (cardTitle) {
        cardTitle.textContent = cardContent.title;
      }

      if (cardDescription) {
        cardDescription.textContent = cardContent.description;
      }
    });
  }

  function applyMonitoringPackagesContent() {
    if (!homePlansContainer) {
      return;
    }

    homePlansContainer.innerHTML = `
      <div class="RasheeqSectionHead">
        <h2>${monitoringPackagesContent.title}</h2>
        <p>${monitoringPackagesContent.description}</p>
      </div>

      <div class="RasheeqSectionHead is-secondary">
        <h2>${monitoringPackagesContent.nutritionTitle}</h2>
        <p>${monitoringPackagesContent.nutritionDescription}</p>
      </div>

      <div class="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4">
        ${monitoringPackagesContent.nutritionPackages
          .map(createPackageCardMarkup)
          .join("")}
      </div>

      <div class="RasheeqPlansDivider">
        <div class="RasheeqSectionHead is-secondary">
          <h2>${monitoringPackagesContent.sugarTitle}</h2>
          <p>${monitoringPackagesContent.sugarDescription}</p>
        </div>

        <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          ${monitoringPackagesContent.sugarPackages
            .map(createPackageCardMarkup)
            .join("")}
        </div>
      </div>
    `;
  }

  function restoreDefaultPackagesContent() {
    if (!homePlansContainer || !defaultPlansMarkup) {
      return;
    }

    homePlansContainer.innerHTML = defaultPlansMarkup;
  }

  function applyBlogContent(content) {
    if (!blogTitle || !blogDescription || !blogCards.length) {
      return;
    }

    blogTitle.textContent = content.title;
    blogDescription.textContent = content.description;

    blogCards.forEach((card, index) => {
      const cardContent = content.cards[index];
      if (!cardContent) {
        return;
      }

      const imageLink = card.querySelector(".cardHead a");
      const image = card.querySelector("img");
      const titleLink = card.querySelector(".cardBody a");
      const date = card.querySelector(".cardBody p");

      imageLink?.setAttribute("href", cardContent.href);
      titleLink?.setAttribute("href", cardContent.href);

      if (image) {
        image.setAttribute("src", cardContent.image);
        image.setAttribute("alt", cardContent.alt);
      }

      if (titleLink) {
        titleLink.textContent = cardContent.title;
      }

      if (date) {
        date.textContent = cardContent.date;
      }
    });

    if (typeof window.jQuery === "function") {
      window.jQuery(".bolgCarousel").trigger("refresh.owl.carousel");
    }
  }

  function restoreDefaultBlogContent() {
    applyBlogContent(defaultBlogState);
  }

  function syncHomePageMode(mode) {
    const isMonitoringMode = mode === "monitoring";

    if (specialtiesSection) {
      specialtiesSection.hidden = isMonitoringMode;
    }

    restoreDefaultServicesContent();
    restoreDefaultFeaturesContent();
    restoreDefaultPackagesContent();
    restoreDefaultBlogContent();

    if (isMonitoringMode) {
      applyMonitoringServicesContent();
      applyMonitoringFeaturesContent();
      applyMonitoringPackagesContent();
      applyBlogContent(monitoringBlogContent);
    }
  }

  function applyMonitoringSlide(index) {
    if (!monitoringImage || !monitoringTitle || !monitoringDescription) {
      return;
    }

    const slide = monitoringSlides[index];
    monitoringTitle.textContent = slide.title;
    monitoringDescription.textContent = slide.description;
    monitoringImage.setAttribute("src", slide.image);
    monitoringImage.setAttribute("alt", slide.alt);
  }

  function playMonitoringReveal() {
    if (!monitoringLayer) {
      return;
    }

    monitoringLayer.classList.remove("monitoring-transition-in");
    void monitoringLayer.offsetWidth;
    monitoringLayer.classList.add("monitoring-transition-in");

    window.setTimeout(() => {
      monitoringLayer.classList.remove("monitoring-transition-in");
    }, 1000);
  }

  function switchMonitoringSlide(nextIndex) {
    if (!monitoringLayer || monitoringSwitchInProgress) {
      return;
    }

    monitoringSwitchInProgress = true;
    monitoringLayer.classList.add("monitoring-transition-out");

    window.setTimeout(() => {
      applyMonitoringSlide(nextIndex);
      monitoringLayer.classList.remove("monitoring-transition-out");
      playMonitoringReveal();

      window.setTimeout(() => {
        monitoringSwitchInProgress = false;
      }, 960);
    }, 260);
  }

  function stopMonitoringCycle() {
    if (monitoringTimer) {
      window.clearInterval(monitoringTimer);
      monitoringTimer = null;
    }

    if (monitoringLayer) {
      monitoringLayer.classList.remove(
        "monitoring-transition-in",
        "monitoring-transition-out"
      );
    }

    monitoringSwitchInProgress = false;
  }

  function startMonitoringCycle() {
    if (
      !monitoringRotatorEnabled ||
      !monitoringLayer ||
      !monitoringImage ||
      !monitoringTitle ||
      !monitoringDescription
    ) {
      return;
    }

    stopMonitoringCycle();
    monitoringIndex = 0;
    applyMonitoringSlide(monitoringIndex);
    playMonitoringReveal();

    monitoringTimer = window.setInterval(() => {
      const nextIndex = (monitoringIndex + 1) % monitoringSlides.length;
      monitoringIndex = nextIndex;
      switchMonitoringSlide(nextIndex);
    }, 6500);
  }

  function showLayer(id) {
    hideAll();

    const targetLayer = document.getElementById(id);
    if (!targetLayer) {
      return;
    }

    targetLayer.classList.add("active-layer");

    if (typeof window.setSpecialtiesMode === "function") {
      window.setSpecialtiesMode("default");
    }

    syncHomePageMode(id === "MonitoringLayer" ? "monitoring" : "default");

    if (id === "MonitoringLayer") {
      startMonitoringCycle();
    } else {
      stopMonitoringCycle();
    }
  }

  document.querySelectorAll("[data-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-target");
      if (!target) {
        return;
      }
      showLayer(target);
    });
  });

  showLayer("HeroFirstLayer");
})();
