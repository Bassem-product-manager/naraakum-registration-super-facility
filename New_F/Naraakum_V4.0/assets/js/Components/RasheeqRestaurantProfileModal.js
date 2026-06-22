(function () {
  const MEALS_STEP_URL = "rasheeqMealsStep_1.html";
  const DEFAULT_RESTAURANT_NAME = "مطعم رشيق";
  const MEAL_LABEL = "وجبة";
  const STARTING_FROM_LABEL = "تبدأ الوجبة من";
  const REVIEWS_LABEL = "تقييم";

  const restaurantProfiles = {
    [DEFAULT_RESTAURANT_NAME]: {
      name: "مطعم رشيق",
      image: "assets/images/rasheeq/restaurants/rasheeq-restaurant.jpg",
      rating: "4.0",
      reviews: "122",
      summary:
        "مطعم صحي يركز على الوجبات المتوازنة وخيارات البروتين العالية مع إعداد يومي مناسب لخطط التغذية العلاجية.",
      location: "الرياض - حي الندى",
      delivery: "التوصيل خلال اليوم",
      hours: "08:00 ص - 11:00 م",
      meals: [
        {
          type: "وجبات كيتو",
          title: "وجبة كيتو دجاج مشوي - 450 جم",
          description:
            "دجاج مشوي مع خضار طازجة وتتبيلة خفيفة مناسبة للأنظمة منخفضة الكربوهيدرات.",
          price: "20 ر.س",
          image: "assets/images/rasheeq/meals/meal-1.jpg",
        },
        {
          type: "وجبات جاهزة",
          title: "سلطة كينوا بروتين - 300 جم",
          description:
            "كينوا مع خضار طازجة ومصدر بروتين خفيف، مناسبة للمتابعة اليومية.",
          price: "20 ر.س",
          image: "assets/images/rasheeq/meals/meal-2.jpg",
        },
        {
          type: "وجبات بروتين",
          title: "سالمون مشوي مع خضار - 380 جم",
          description:
            "قطعة سالمون مشوي مع خضار موسمية وصوص خفيف مناسب للأنظمة المتوازنة.",
          price: "24 ر.س",
          image: "assets/images/rasheeq/meals/meal-1.jpg",
        },
        {
          type: "وجبات منخفضة الكربوهيدرات",
          title: "وجبة لحم ستيك صحي - 420 جم",
          description:
            "شرائح لحم مع خضار مشوية وبطاطس مهروسة خفيفة بكمية محسوبة.",
          price: "26 ر.س",
          image: "assets/images/rasheeq/meals/meal-3.jpg",
        },
        {
          type: "سلطات مشبعة",
          title: "سلطة تونة وأفوكادو - 320 جم",
          description:
            "تونة خفيفة مع أفوكادو وخس وخيار، مناسبة كوجبة غداء سريعة.",
          price: "21 ر.س",
          image: "assets/images/rasheeq/meals/meal-4.jpg",
        },
        {
          type: "سناك صحي",
          title: "زبادي يوناني ومكسرات - 220 جم",
          description:
            "زبادي يوناني مع مكسرات وتوت طازج كسناك خفيف وغني بالبروتين.",
          price: "14 ر.س",
          image: "assets/images/rasheeq/meals/meal-2.jpg",
        },
      ],
    },
    "مطعم الهدى الصحي": {
      name: "مطعم الهدى الصحي",
      image: "assets/images/rasheeq/restaurants/huda-restaurant.jpg",
      rating: "4.0",
      reviews: "122",
      summary:
        "مطعم يقدم وجبات صحية يومية وخيارات متنوعة مناسبة للتغذية العلاجية وخطط التحكم بالوزن.",
      location: "الرياض - حي الربيع",
      delivery: "التوصيل خلال اليوم",
      hours: "09:00 ص - 10:30 م",
      meals: [
        {
          type: "وجبات متوازنة",
          title: "دجاج بالأعشاب - 430 جم",
          description:
            "صدر دجاج مع أرز بني وخضار مطهوة على البخار ضمن وجبة محسوبة السعرات.",
          price: "22 ر.س",
          image: "assets/images/rasheeq/meals/meal-3.jpg",
        },
        {
          type: "سلطات بروتين",
          title: "سلطة أفوكادو متوازنة - 280 جم",
          description:
            "خضار ورقية مع أفوكادو وبذور ومصدر بروتين خفيف مناسب للوجبات اليومية.",
          price: "21 ر.س",
          image: "assets/images/rasheeq/meals/meal-4.jpg",
        },
        {
          type: "وجبات يومية",
          title: "رز بني ولحم مفروم - 400 جم",
          description:
            "أرز بني مع لحم مفروم قليل الدهن وخضار مشكلة بكمية مناسبة.",
          price: "23 ر.س",
          image: "assets/images/rasheeq/meals/meal-1.jpg",
        },
        {
          type: "ساندويتشات صحية",
          title: "ساندويتش تركي مدخن - 260 جم",
          description:
            "خبز حبوب كاملة مع شرائح تركي وخس وجبن خفيف لوجبة سريعة.",
          price: "18 ر.س",
          image: "assets/images/rasheeq/meals/meal-2.jpg",
        },
      ],
    },
  };

  function createMealMarkup(meal) {
    return `
      <article class="restaurantProfileMealCard">
        <img src="${meal.image}" alt="${meal.title}" />
        <div class="restaurantProfileMealContent">
          <span class="restaurantProfileMealType">${meal.type}</span>
          <h4>${meal.title}</h4>
          <span class="restaurantProfileMealLabel">${MEAL_LABEL}</span>
          <p class="restaurantProfileMealDescription">${meal.description}</p>
          <div class="restaurantProfileMealFooter">
            <div class="restaurantProfileMealPrice">
              <span>${STARTING_FROM_LABEL}</span>
              <strong>${meal.price}</strong>
            </div>
            <a
              href="${MEALS_STEP_URL}"
              class="restaurantProfileMealAction btn btn-secondary btn-40 btn-icon"
              aria-label="اختيار الوجبة"
              title="اختيار الوجبة"
            >
              <i class="fi fi-rr-shopping-cart-add"></i>
            </a>
          </div>
        </div>
      </article>
    `;
  }

  function fillModal(profile) {
    const modal = document.getElementById("RestaurantProfileModal");

    if (!modal || !profile) {
      return;
    }

    modal.querySelector("[data-restaurant-image]").src = profile.image;
    modal.querySelector("[data-restaurant-image]").alt = profile.name;
    modal.querySelector("[data-restaurant-name]").textContent = profile.name;
    modal.querySelector("[data-restaurant-rating]").textContent = profile.rating;
    modal.querySelector(
      "[data-restaurant-reviews]",
    ).textContent = `(${profile.reviews} ${REVIEWS_LABEL})`;
    modal.querySelector("[data-restaurant-summary]").textContent = profile.summary;
    modal.querySelector("[data-restaurant-location]").textContent = profile.location;
    modal.querySelector("[data-restaurant-delivery]").textContent = profile.delivery;
    modal.querySelector("[data-restaurant-hours]").textContent = profile.hours;
    modal.querySelector("[data-restaurant-meals]").innerHTML = profile.meals
      .map(createMealMarkup)
      .join("");
  }

  fillModal(restaurantProfiles[DEFAULT_RESTAURANT_NAME]);

  document.querySelectorAll(".summaryProviderCard").forEach((card) => {
    const providerName = card.querySelector(".providerData > a")?.textContent.trim();
    const profile = restaurantProfiles[providerName];
    const button = card.querySelector(".providerData .btn");

    if (!profile || !button) {
      return;
    }

    button.setAttribute("href", "#");
    button.addEventListener("click", function (event) {
      event.preventDefault();
      fillModal(profile);
      const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("RestaurantProfileModal"),
      );
      modal.show();
    });
  });
})();
