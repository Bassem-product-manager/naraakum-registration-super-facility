(function () {
  const restaurants = [
    {
      id: "rasheeq",
      name: "مطعم رشيق",
      rating: "4.8",
      reviews: "122",
      location: "الرياض - حي الندى",
      delivery: "توصيل خلال 35 دقيقة",
      workingHours: "08:00 ص - 11:00 م",
      priceHint: "ابتداءً من 20 ر.س",
      badge: "الأكثر طلبًا",
      summary:
        "مطعم صحي معتمد يركز على الوجبات الكيتونية والخيارات عالية البروتين مع إعداد يومي طازج.",
      cover: "assets/images/Healthy meal options in vibrant cards.png",
      logo: "assets/images/ph-img.png",
      tags: ["وجبات كيتو", "بروتين عالي", "حساب سعرات"],
      meals: [
        {
          type: "وجبات كيتو",
          title: "وجبة كيتو دجاج مشوي - 450 جم",
          description: "دجاج مشوي مع خضار مشوية وصلصة خفيفة مناسبة للأنظمة منخفضة الكربوهيدرات.",
          calories: "450 سعرة",
          price: "20.00",
          image: "assets/images/rasheeq/meals/meal-1.jpg",
        },
        {
          type: "وجبات جاهزة",
          title: "سلطة كينوا بروتين - 300 جم",
          description: "كينوا مع صدور دجاج وخضار طازجة وتتبيلة خفيفة مناسبة للمتابعة اليومية.",
          calories: "300 سعرة",
          price: "20.00",
          image: "assets/images/rasheeq/meals/meal-2.jpg",
        },
        {
          type: "وجبات توازن",
          title: "سلمون وخضار طازجة - 420 جم",
          description: "وجبة غنية بالأوميجا 3 مع خضار موسمية وسعرات محسوبة.",
          calories: "420 سعرة",
          price: "24.00",
          image: "assets/images/rasheeq/meals/meal-4.jpg",
        },
      ],
    },
    {
      id: "huda",
      name: "مطعم الهدى الصحي",
      rating: "4.7",
      reviews: "94",
      location: "الرياض - حي الربيع",
      delivery: "توصيل خلال 40 دقيقة",
      workingHours: "09:00 ص - 10:30 م",
      priceHint: "ابتداءً من 22 ر.س",
      badge: "خيارات يومية",
      summary:
        "مطعم متخصص في الوجبات المتوازنة وخيارات التحكم بالوزن مع قوائم أسبوعية مرنة.",
      cover: "assets/images/rasheeq/meals/meal-3.jpg",
      logo: "assets/images/providerBMC.png",
      tags: ["خسارة وزن", "وجبات يومية", "خيارات نباتية"],
      meals: [
        {
          type: "وجبات متوازنة",
          title: "طبق دجاج بالأعشاب - 430 جم",
          description: "صدور دجاج مع أرز بني وخضار مطهوة على البخار.",
          calories: "430 سعرة",
          price: "22.00",
          image: "assets/images/rasheeq/meals/meal-3.jpg",
        },
        {
          type: "سلطات بروتين",
          title: "سلطة توازن الأفوكادو - 280 جم",
          description: "خضار ورقية مع أفوكادو وبذور ومصدر بروتين خفيف.",
          calories: "280 سعرة",
          price: "21.00",
          image: "assets/images/rasheeq/meals/meal-2.jpg",
        },
        {
          type: "وجبات موصوفة",
          title: "طبق سلمون وخضار - 390 جم",
          description: "وجبة مناسبة للمتابعة الغذائية مع دهون صحية وسعرات مضبوطة.",
          calories: "390 سعرة",
          price: "26.00",
          image: "assets/images/rasheeq/meals/meal-4.jpg",
        },
      ],
    },
    {
      id: "daily-balance",
      name: "مطبخ التوازن اليومي",
      rating: "4.6",
      reviews: "76",
      location: "الرياض - حي الياسمين",
      delivery: "توصيل خلال 30 دقيقة",
      workingHours: "07:30 ص - 09:30 م",
      priceHint: "ابتداءً من 18 ر.س",
      badge: "سريع التوصيل",
      summary:
        "مطبخ يومي يقدّم وجبات صحية سريعة، مناسبة للدوام وللمتابعة الغذائية المستمرة.",
      cover: "assets/images/rasheeq/meals/meal-4.jpg",
      logo: "assets/images/providerManBMC.png",
      tags: ["سريع التوصيل", "وجبات عمل", "سعرات محسوبة"],
      meals: [
        {
          type: "وجبات عمل",
          title: "وجبة لحم مع خضار - 410 جم",
          description: "وجبة عملية متوازنة مناسبة للغداء مع توزيع بروتين وكربوهيدرات معتدل.",
          calories: "410 سعرة",
          price: "18.00",
          image: "assets/images/rasheeq/meals/meal-4.jpg",
        },
        {
          type: "وجبات خفيفة",
          title: "سلطة سيزر صحية - 250 جم",
          description: "نسخة أخف من السيزر مع صوص مخفف ومصدر بروتين مشوي.",
          calories: "250 سعرة",
          price: "19.00",
          image: "assets/images/rasheeq/meals/meal-2.jpg",
        },
        {
          type: "وجبات جاهزة",
          title: "دجاج مشوي مع بطاطا - 430 جم",
          description: "وجبة جاهزة يومية مع خضار طازجة وتوابل خفيفة.",
          calories: "430 سعرة",
          price: "23.00",
          image: "assets/images/rasheeq/meals/meal-1.jpg",
        },
      ],
    },
  ];

  const restaurantOrder = restaurants.map((restaurant) => restaurant.id);

  function currentPage() {
    const parts = window.location.pathname.split("/");
    return parts[parts.length - 1];
  }

  function getRestaurantById(id) {
    return restaurants.find((restaurant) => restaurant.id === id) || restaurants[0];
  }

  function getRestaurantByName(name) {
    const normalizedName = (name || "").trim();
    return (
      restaurants.find((restaurant) => normalizedName.includes(restaurant.name)) ||
      restaurants[0]
    );
  }

  function createRestaurantCardMarkup(restaurant) {
    return `
      <div class="col-12 col-md-6 col-xl-4">
        <article class="restaurantShowcaseCard">
          <div class="restaurantShowcaseMedia">
            <img src="${restaurant.cover}" alt="${restaurant.name}" />
            <div class="restaurantShowcaseOverlay"></div>
            <div class="restaurantShowcaseBadge">${restaurant.badge}</div>
            <img class="restaurantShowcaseLogo" src="${restaurant.logo}" alt="${restaurant.name}" />
          </div>
          <div class="restaurantShowcaseBody">
            <div class="restaurantShowcaseTop">
              <div>
                <h3>${restaurant.name}</h3>
                <p>${restaurant.summary}</p>
              </div>
              <div class="restaurantRateChip">${restaurant.rating} <i class="fi fi-sr-star"></i></div>
            </div>
            <div class="restaurantMeta">
              <span>${restaurant.location}</span>
              <span>${restaurant.delivery}</span>
              <span>${restaurant.priceHint}</span>
            </div>
            <ul class="restaurantFeatureList">
              ${restaurant.tags.map((tag) => `<li>${tag}</li>`).join("")}
            </ul>
            <div class="restaurantActions">
              <a href="rasheeqMealsStep_2.html?restaurant=${restaurant.id}#restaurant-profile" class="btn btn-primary btn-40">
                الملف التعريفي
              </a>
              <a href="rasheeqMealsStep_2.html?restaurant=${restaurant.id}#restaurant-meals" class="btn btn-light btn-40">
                عرض الوجبات
              </a>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  function createMealCardMarkup(meal) {
    return `
      <div class="col-12 col-md-6 col-xl-4">
        <article class="mealPreviewCard">
          <img src="${meal.image}" alt="${meal.title}" />
          <div class="mealPreviewBody">
            <div class="mealPreviewMeta">
              <span class="mealPreviewType">${meal.type}</span>
              <span>${meal.calories}</span>
            </div>
            <h4>${meal.title}</h4>
            <p>${meal.description}</p>
            <div class="mealPreviewFooter">
              <div class="mealPreviewPriceBox">
                <strong>${meal.price}</strong>
                <span>ر.س</span>
              </div>
              <a href="rasheeqMealsOrderSummary.html" class="btn btn-secondary btn-40">
                أضف للسلة
              </a>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  function enhanceStepOne() {
    document.body.classList.add("rasheeq-meals-page", "rasheeq-meals-step1");

    const shopTabButton = document.getElementById("pills-shop-tab");
    if (shopTabButton) {
      shopTabButton.closest("li")?.classList.remove("d-none");
      const label = shopTabButton.querySelector("span");
      if (label) {
        label.textContent = "الوجبات الصحية";
      }
    }

    const uploadTabButton = document.getElementById("pills-Prescription-tab");
    uploadTabButton?.closest("li")?.remove();
    document.getElementById("pills-Prescription")?.remove();

    const historyTabLabel = document.querySelector("#pills-naraakumPrescriptions-tab span");
    if (historyTabLabel) {
      historyTabLabel.textContent = "سجل الوجبات";
    }

    const shopPane = document.getElementById("pills-shop");
    const wrapper = shopPane?.querySelector(".ContentWrapper");
    if (!wrapper) {
      return;
    }

    wrapper.innerHTML = `
      <div class="mealsRestaurantsIntro">
        <div class="mealsRestaurantsHeader">
          <div class="mealsRestaurantsHeaderCopy">
            <span class="mealsEyebrow">الوجبات الصحية</span>
            <h2>اختر المطعم المناسب لوجباتك الصحية</h2>
            <p>استعرض مطاعم صحية معتمدة، وادخل إلى الملف التعريفي لكل مطعم لمشاهدة بياناته والوجبات المتوفرة لديه بشكل واضح.</p>
          </div>
          <div class="mealsRestaurantsSearch search-box-group w-100">
            <input type="text" class="form-control form-control-32" placeholder="بحث عن مطعم أو وجبة صحية" />
            <button type="button" class="btn btn-primary btn-32">
              <i class="fi fi-rr-search"></i>
            </button>
            <button type="button" class="btn btn-primary-revers btn-32" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="تحديث" data-bs-custom-class="custom-tooltip">
              <i class="fi fi-rr-rotate-right"></i>
            </button>
          </div>
        </div>
        <div class="row g-4 mealsRestaurantsGrid">
          ${restaurants.map(createRestaurantCardMarkup).join("")}
        </div>
      </div>
    `;
  }

  function buildRestaurantProfile(restaurant) {
    return `
      <section class="restaurantProfileHero" id="restaurant-profile">
        <div class="restaurantProfileCopy">
          <div>
            <span class="mealsEyebrow">الملف التعريفي للمطعم</span>
            <h2>${restaurant.name}</h2>
          </div>
          <p>${restaurant.summary}</p>
          <div class="restaurantProfileStats">
            <div class="restaurantStat">
              <span>التقييم</span>
              <strong>${restaurant.rating}</strong>
              <small>(${restaurant.reviews} تقييم)</small>
            </div>
            <div class="restaurantStat">
              <span>المنطقة</span>
              <strong>${restaurant.location}</strong>
              <small>تغطية داخل الرياض</small>
            </div>
            <div class="restaurantStat">
              <span>التوصيل</span>
              <strong>${restaurant.delivery}</strong>
              <small>وقت تقريبي</small>
            </div>
            <div class="restaurantStat">
              <span>ساعات العمل</span>
              <strong>${restaurant.workingHours}</strong>
              <small>يوميًا</small>
            </div>
          </div>
          <ul class="restaurantProfileTags">
            ${restaurant.tags.map((tag) => `<li>${tag}</li>`).join("")}
          </ul>
        </div>
        <div class="restaurantProfileCover">
          <img class="restaurantProfileCoverImage" src="${restaurant.cover}" alt="${restaurant.name}" />
          <div class="restaurantProfileCoverOverlay"></div>
          <div class="restaurantProfileBadge">${restaurant.priceHint}</div>
          <img class="restaurantProfileLogo" src="${restaurant.logo}" alt="${restaurant.name}" />
        </div>
      </section>
      <section class="restaurantMealsSection" id="restaurant-meals">
        <div class="restaurantMealsHead">
          <div>
            <span class="mealsEyebrow">الوجبات الصحية</span>
            <h3>وجبات ${restaurant.name}</h3>
            <p>هذه الوجبات المتوفرة حاليًا لهذا المطعم ويمكنك إضافتها مباشرة إلى السلة بعد مراجعة التفاصيل.</p>
          </div>
          <a href="rasheeqMealsStep_1.html" class="btn btn-light btn-40">العودة إلى قائمة المطاعم</a>
        </div>
        <div class="row g-4 restaurantMealsGrid">
          ${restaurant.meals.map(createMealCardMarkup).join("")}
        </div>
      </section>
    `;
  }

  function enhanceStepTwo() {
    document.body.classList.add("rasheeq-meals-page", "rasheeq-meals-step2");

    const selectedId = new URLSearchParams(window.location.search).get("restaurant") || restaurantOrder[0];
    const selectedRestaurant = getRestaurantById(selectedId);

    const serviceTitle = document.querySelector(".ServiceTitleBar h2");
    if (serviceTitle) {
      serviceTitle.textContent = "الوجبات الصحية";
    }

    const serviceSubtitle = document.querySelector(".ServiceTitleBar p");
    if (serviceSubtitle) {
      serviceSubtitle.textContent = `ملف ${selectedRestaurant.name} والوجبات المتوفرة لديه`;
    }

    const searchInput = document.querySelector(".searchBar input");
    if (searchInput) {
      searchInput.placeholder = "بحث عن مطعم صحي";
    }

    const contentWrapper = document.querySelector(".ContentWrapper");
    const tabsContainer = contentWrapper?.querySelector(".shippingAndBranchPickupTabs");
    if (contentWrapper && tabsContainer && !document.getElementById("restaurant-profile")) {
      tabsContainer.insertAdjacentHTML("beforebegin", buildRestaurantProfile(selectedRestaurant));
    }

    const providerCards = document.querySelectorAll(".providerCard.PharmacyCardView");
    providerCards.forEach((card, index) => {
      const restaurant = getRestaurantById(restaurantOrder[index] || restaurantOrder[0]);
      const nameElement = card.querySelector(".providerData a.fsize-18");
      const ratingValue = card.querySelector(".rating .fsize-16");
      const ratingCount = card.querySelector(".rating .fsize-12");
      const providerImage = card.querySelector(".providerImage img");
      const mealsCount = card.querySelector(".priceItems .item .fsize-14");

      card.dataset.restaurantId = restaurant.id;
      if (restaurant.id === selectedRestaurant.id) {
        card.classList.add("is-active-restaurant");
      }

      if (nameElement) {
        nameElement.textContent = restaurant.name;
      }

      if (ratingValue) {
        ratingValue.textContent = restaurant.rating;
      }

      if (ratingCount) {
        ratingCount.textContent = `(${restaurant.reviews} تقييم)`;
      }

      if (providerImage) {
        providerImage.src = restaurant.logo;
        providerImage.alt = restaurant.name;
      }

      if (mealsCount) {
        mealsCount.textContent = `(${restaurant.meals.length}) وجبة متوفرة`;
      }

      const providerLinks = card.querySelectorAll(".providerInfo a");
      providerLinks.forEach((link) => {
        link.setAttribute("href", `rasheeqMealsStep_2.html?restaurant=${restaurant.id}#restaurant-profile`);
      });

      const footer = card.querySelector(".pharmacySelectButtons");
      if (footer && !footer.querySelector(".restaurant-profile-link")) {
        footer.insertAdjacentHTML(
          "afterbegin",
          `<a class="btn btn-40 btn-light restaurant-profile-link" href="rasheeqMealsStep_2.html?restaurant=${restaurant.id}#restaurant-profile">الملف التعريفي</a>`
        );
      }
    });

    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        window.requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  }

  function enhanceOrderSummary() {
    document.body.classList.add("rasheeq-meals-page", "rasheeq-meals-summary");

    document.querySelectorAll(".summaryProviderCard").forEach((card) => {
      const providerName = card.querySelector(".providerData > a");
      if (!providerName || !providerName.textContent.includes("مطعم")) {
        return;
      }

      const restaurant = getRestaurantByName(providerName.textContent);
      const profileButton = card.querySelector(".providerData .btn");
      if (profileButton) {
        profileButton.textContent = "عرض الملف والوجبات";
        profileButton.setAttribute(
          "href",
          `rasheeqMealsStep_2.html?restaurant=${restaurant.id}#restaurant-profile`
        );
        profileButton.classList.add("restaurant-summary-link");
      }
    });

    document.querySelectorAll(".table.table-bordered td").forEach((cell) => {
      if (cell.textContent.trim() === "الوجبات/الخطة الغذائية") {
        cell.textContent = "الوجبات الصحية";
      }
    });

    document.querySelectorAll(".alert-warning").forEach((alert) => {
      if (alert.textContent.includes("الخطة الغذائية")) {
        alert.remove();
      }
    });

    document.querySelector(".OrderfilesBox")?.remove();
  }

  const page = currentPage();
  if (page === "rasheeqMealsStep_1.html") {
    enhanceStepOne();
  }

  if (page === "rasheeqMealsStep_2.html") {
    enhanceStepTwo();
  }

  if (page === "rasheeqMealsOrderSummary.html") {
    enhanceOrderSummary();
  }
})();
