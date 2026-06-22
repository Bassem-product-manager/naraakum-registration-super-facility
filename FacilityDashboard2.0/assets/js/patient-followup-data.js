window.patientFollowUpData = (function () {
  function normalizeReportType(value) {
    var normalized = (value || "").toLowerCase().trim();

    if (normalized === "blood" || normalized === "blood-sugar") return "blood-sugar";
    if (normalized === "diet" || normalized === "diet-weight") return "diet-weight";

    return "weight";
  }

  function humanizePatient(value) {
    if (!value) return "Bassem Ahmed";

    return value
      .split("-")
      .filter(Boolean)
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  var mealImagePool = {
    breakfastA:
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80",
    breakfastB:
      "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=1200",
    breakfastC:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
    lunchA:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
    lunchB:
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200",
    lunchC:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    dinnerA:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    dinnerB:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    dinnerC:
      "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=1200",
    snackA:
      "https://images.unsplash.com/photo-1517093728432-0af0f7b4e4af?auto=format&fit=crop&w=1200&q=80",
    snackB:
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=80",
    snackC:
      "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1200",
    saladA:
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1200&q=80",
    bowlA:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    fishA:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80"
  };

  function createMeal(slotKey, slotLabel, timeLabel, title, image, ingredients, temporalState) {
    return {
      slotKey: slotKey,
      slot: slotLabel,
      timeLabel: timeLabel,
      title: title,
      image: image,
      ingredients: ingredients,
      temporalState: temporalState
    };
  }

  return {
    helpers: {
      normalizeReportType: normalizeReportType,
      humanizePatient: humanizePatient,
      clone: clone
    },
    patient: {
      slug: "bassem-ahmed",
      code: "PT-00001",
      name: "Bassem Ahmed",
      phone: "+966 55 220 8104",
      gender: "Male",
      careProvider: "Dr. Sror Rashad",
      hospital: "Bassam Medical Center",
      recordDate: "12/12/2023",
      serviceName: "Remote Follow-Up 30min"
    },
    landing: {
      reports: [
        { key: "blood-sugar", label: "Blood Sugar Report" },
        { key: "diet-weight", label: "Diet & Weight Report" }
      ],
      sessionRecords: [
        {
          kind: "session",
          reportType: "Weight",
          key: "weight",
          careProvider: "Dr. Sror Rashad",
          hospital: "Bassam Medical Center",
          recordDate: "12/12/2023",
          actionLabel: "View Session Record",
          statusLabel: "Online",
          statusTone: "dark"
        },
        {
          kind: "report",
          reportType: "Blood Sugar",
          key: "blood-sugar",
          careProvider: "Dr. Sror Rashad",
          hospital: "Bassam Medical Center",
          recordDate: "12/12/2023",
          actionLabel: "View Record Information"
        }
      ]
    },
    history: {
      weight: {
        reportLabel: "Weight",
        latestChange: "1 day ago",
        planName: "Weekly Weight Control Follow-Up",
        doctor: "Dr. Sror Rashad",
        hospital: "Bassam Medical Center",
        planChips: [
          "Morning weight tracking",
          "Body composition review",
          "Meal adherence check"
        ],
        packageDescription:
          "Weight package focused on morning readings, body composition updates, and plan adjustments based on weekly progress.",
        packageDetails: [
          { label: "Package type", value: "Weight follow-up" },
          { label: "Package duration", value: "10/12/2023 - 10/01/2024" },
          { label: "Monitoring style", value: "Weekly structured follow-up" },
          { label: "Scale reviews", value: "7 readings / week" },
          { label: "Requested files", value: "Scale photos and InBody updates" },
          { label: "Doctor", value: "Dr. Sror Rashad" }
        ],
        updates: [
          {
            tone: "plan",
            tag: "Plan Update",
            title: "Plan upgraded to intensive weight follow-up",
            date: "11 Dec 2023",
            details: [
              { label: "Previous plan", value: "Partial Follow-Up" },
              { label: "New plan", value: "Intensive Weight Follow-Up" }
            ],
            doctor: "Dr. Sror Rashad"
          },
          {
            tone: "request",
            tag: "Request Update",
            title: "Requested updated body composition image",
            date: "12 Dec 2023",
            details: [
              { label: "Requested file", value: "Morning scale or InBody image" },
              { label: "Request date", value: "12/12/2023" }
            ],
            doctor: "Dr. Sror Rashad"
          },
          {
            tone: "meal",
            tag: "Meal Update",
            title: "Meal schedule tightened for evening control",
            date: "10 Dec 2023",
            details: [
              { label: "Previous dinner window", value: "08:00 PM to 10:00 PM" },
              { label: "Updated window", value: "07:00 PM to 08:30 PM" },
              { label: "Effective from", value: "10/12/2023" }
            ],
            doctor: "Dr. Sror Rashad"
          }
        ]
      }
    },
    reports: {
      "blood-sugar": {
        label: "Blood Sugar",
        pageHeading: "Blood Sugar Report",
        lastUpdated: "4 minutes ago",
        metrics: [
          { label: "Current Blood Sugar Reading", value: "95 mg/dL" },
          { label: "Last Reading Time", value: "4 minutes ago" },
          { label: "Diabetes Type", value: "Type 1" },
          { label: "Target Range", value: "80 - 140 mg/dL" },
          { label: "Unit", value: "mg/dL" },
          { label: "Diabetes Treatment", value: "Insulin Pump" },
          { label: "Smart Monitoring Devices", value: "BGM&CGM" },
          { label: "BGM Device", value: "Accu Chek Instant (Connected)" },
          { label: "CGM Device", value: "No Connected Device" }
        ],
        indicatorSeries: [
          {
            key: "glucose",
            label: "Blood Glucose",
            unit: "mg/dL",
            reference: "Reference range 80 - 140 mg/dL",
            range: [80, 140],
            valueText: "95 mg/dL",
            color: "#239ea0",
            points: [
              { date: "2023-12-06", label: "06 Dec", value: 96 },
              { date: "2023-12-07", label: "07 Dec", value: 108 },
              { date: "2023-12-08", label: "08 Dec", value: 122 },
              { date: "2023-12-09", label: "09 Dec", value: 118 },
              { date: "2023-12-10", label: "10 Dec", value: 128 },
              { date: "2023-12-11", label: "11 Dec", value: 114 },
              { date: "2023-12-12", label: "12 Dec", value: 95 }
            ]
          },
          {
            key: "hba1c",
            label: "HbA1c",
            unit: "%",
            reference: "Goal usually below 7%",
            range: [4, 7],
            valueText: "6.8 %",
            color: "#7f98d8",
            points: [
              { date: "2023-12-06", label: "06 Dec", value: 7.8 },
              { date: "2023-12-07", label: "07 Dec", value: 7.6 },
              { date: "2023-12-08", label: "08 Dec", value: 7.4 },
              { date: "2023-12-09", label: "09 Dec", value: 7.2 },
              { date: "2023-12-10", label: "10 Dec", value: 7.0 },
              { date: "2023-12-11", label: "11 Dec", value: 6.9 },
              { date: "2023-12-12", label: "12 Dec", value: 6.8 }
            ]
          },
          {
            key: "fasting",
            label: "Fasting Glucose",
            unit: "mg/dL",
            reference: "Reference range 70 - 99 mg/dL",
            range: [70, 99],
            valueText: "99 mg/dL",
            color: "#d99736",
            points: [
              { date: "2023-12-06", label: "06 Dec", value: 103 },
              { date: "2023-12-07", label: "07 Dec", value: 110 },
              { date: "2023-12-08", label: "08 Dec", value: 118 },
              { date: "2023-12-09", label: "09 Dec", value: 101 },
              { date: "2023-12-10", label: "10 Dec", value: 116 },
              { date: "2023-12-11", label: "11 Dec", value: 107 },
              { date: "2023-12-12", label: "12 Dec", value: 99 }
            ]
          },
          {
            key: "cpeptide",
            label: "C-Peptide",
            unit: "ng/mL",
            reference: "Review with insulin production context",
            range: [0.5, 2.0],
            valueText: "1.2 ng/mL",
            color: "#6e56cf",
            points: [
              { date: "2023-12-06", label: "06 Dec", value: 0.9 },
              { date: "2023-12-07", label: "07 Dec", value: 1.0 },
              { date: "2023-12-08", label: "08 Dec", value: 1.1 },
              { date: "2023-12-09", label: "09 Dec", value: 1.0 },
              { date: "2023-12-10", label: "10 Dec", value: 1.2 },
              { date: "2023-12-11", label: "11 Dec", value: 1.3 },
              { date: "2023-12-12", label: "12 Dec", value: 1.2 }
            ]
          }
        ],
        insulin: {
          currentDate: "12/12/2023",
          doseWindows: [
            { key: "morning", label: "Morning dose", timeLabel: "08:00 AM" },
            { key: "afternoon", label: "Afternoon dose", timeLabel: "01:00 PM" },
            { key: "evening", label: "Evening dose", timeLabel: "06:00 PM" },
            { key: "bedtime", label: "Bedtime dose", timeLabel: "10:00 PM" }
          ],
          today: [10, 8, 10, 6],
          futureOptions: [
            { key: "tomorrow", pillLabel: "Tomorrow", label: "Tomorrow", date: "13/12/2023" },
            {
              key: "next3",
              pillLabel: "Next 3 Days",
              label: "Next 3 Days",
              date: "13/12/2023 - 15/12/2023"
            },
            {
              key: "nextWeek",
              pillLabel: "Next Week",
              label: "Next Week",
              date: "13/12/2023 - 19/12/2023"
            },
            {
              key: "nextMonth",
              pillLabel: "Next Month",
              label: "Next Month",
              date: "13/12/2023 - 12/01/2024"
            }
          ],
          futurePlans: {
            tomorrow: [10, 7, 10, 6],
            next3: [9, 7, 9, 6],
            nextWeek: [9, 8, 9, 5],
            nextMonth: [8, 7, 8, 5]
          }
        },
        summary: [
          { label: "High", value: "30%" },
          { label: "In Target", value: "25%" },
          { label: "Low", value: "45%" },
          { label: "Change Rate", value: "47%" },
          { label: "Average", value: "180 mg/dL" },
          { label: "Lows Count", value: "4" }
        ]
      },
      "diet-weight": {
        label: "Diet & Weight",
        pageHeading: "Diet & Weight Report",
        lastUpdated: "1 day ago",
        metrics: [
          { label: "Current Weight", value: "91.4 kg" },
          { label: "Goal Weight", value: "80 kg" },
          { label: "Remaining To Goal", value: "11.4 kg" },
          { label: "Adherence To Plan", value: "76%" },
          { label: "Active Plan", value: "Balanced Carb Plan" },
          { label: "Plan Status", value: "Active" }
        ],
        comparison: {
          copy: "Pick an English date to redraw the weight graph and review the logged progress.",
          goalValue: 80,
          records: [
            { date: "2023-09-13", value: 101.2, meta: "Diet plan review at 08:30 AM" },
            { date: "2023-11-12", value: 96.4, meta: "Clinic nutrition follow-up at 09:10 AM" },
            { date: "2023-12-05", value: 93.1, meta: "Morning meal-plan check-in at 08:00 AM" },
            { date: "2023-12-09", value: 92.3, meta: "Morning meal-plan check-in at 08:00 AM" },
            { date: "2023-12-10", value: 92.0, meta: "Morning meal-plan check-in at 08:05 AM" },
            { date: "2023-12-11", value: 91.7, meta: "Morning meal-plan check-in at 08:10 AM" },
            { date: "2023-12-12", value: 91.4, meta: "Morning meal-plan check-in at 08:00 AM" }
          ]
        },
        meals: {
          filterOptions: [
            { key: "current", label: "Today" }
          ],
          collections: {
            current: [
              createMeal(
                "breakfast",
                "Breakfast",
                "08:00 AM",
                "Turkey egg wrap with greens",
                mealImagePool.breakfastB,
                ["Egg wrap", "Turkey slices", "Baby spinach", "Avocado"],
                "current-completed"
              ),
              createMeal(
                "lunch",
                "Lunch",
                "02:00 PM",
                "Greek salad bowl",
                mealImagePool.saladA,
                ["Romaine lettuce", "Feta cubes", "Tomatoes", "Olives"],
                "current-completed"
              ),
              createMeal(
                "dinner",
                "Dinner",
                "08:00 PM",
                "Shrimp pasta light plate",
                mealImagePool.dinnerB,
                ["Shrimp", "Whole wheat pasta", "Tomato sauce", "Parsley"],
                "current-upcoming"
              ),
              createMeal(
                "snack",
                "Snack",
                "10:00 PM",
                "Greek yogurt fruit cup",
                mealImagePool.snackB,
                ["Greek yogurt", "Berries", "Banana slices", "Chia seeds"],
                "current-upcoming"
              )
            ],
            "3d": [
              createMeal(
                "breakfast",
                "Breakfast",
                "08:00 AM",
                "Oat protein bowl",
                mealImagePool.breakfastC,
                ["Protein oats", "Berries", "Greek yogurt", "Honey"],
                "future"
              ),
              createMeal(
                "lunch",
                "Lunch",
                "02:00 PM",
                "Chicken quinoa lunch",
                mealImagePool.lunchA,
                ["Chicken breast", "Quinoa", "Greens", "Cucumber"],
                "future"
              ),
              createMeal(
                "dinner",
                "Dinner",
                "08:00 PM",
                "Salmon recovery plate",
                mealImagePool.fishA,
                ["Salmon", "Leafy greens", "Lemon", "Olive oil"],
                "future"
              ),
              createMeal(
                "snack",
                "Snack",
                "10:00 PM",
                "High-protein yogurt snack",
                mealImagePool.snackB,
                ["Greek yogurt", "Berries", "Chia seeds", "Granola"],
                "future"
              )
            ],
            "7d": [
              createMeal(
                "breakfast",
                "Breakfast",
                "08:00 AM",
                "Avocado omelette plate",
                mealImagePool.breakfastA,
                ["Eggs", "Avocado", "Spinach", "Cherry tomatoes"],
                "future"
              ),
              createMeal(
                "lunch",
                "Lunch",
                "02:00 PM",
                "Turkey rice power bowl",
                mealImagePool.bowlA,
                ["Turkey slices", "Brown rice", "Broccoli", "Carrots"],
                "future"
              ),
              createMeal(
                "dinner",
                "Dinner",
                "08:00 PM",
                "Lean beef balance plate",
                mealImagePool.dinnerC,
                ["Lean beef", "Brown rice", "Broccoli", "Sesame"],
                "future"
              ),
              createMeal(
                "snack",
                "Snack",
                "10:00 PM",
                "Mixed nuts snack cup",
                mealImagePool.snackA,
                ["Almonds", "Cashews", "Walnuts", "Pumpkin seeds"],
                "future"
              )
            ],
            "30d": [
              createMeal(
                "breakfast",
                "Breakfast",
                "08:00 AM",
                "Egg white toast breakfast",
                mealImagePool.breakfastA,
                ["Egg whites", "Whole grain toast", "Avocado", "Tomatoes"],
                "future"
              ),
              createMeal(
                "lunch",
                "Lunch",
                "02:00 PM",
                "Harvest chicken salad",
                mealImagePool.saladA,
                ["Chicken breast", "Feta", "Tomatoes", "Olives"],
                "future"
              ),
              createMeal(
                "dinner",
                "Dinner",
                "08:00 PM",
                "Low-carb salmon tray",
                mealImagePool.fishA,
                ["Salmon", "Zucchini", "Asparagus", "Lemon"],
                "future"
              ),
              createMeal(
                "snack",
                "Snack",
                "10:00 PM",
                "Apple peanut butter bites",
                mealImagePool.snackC,
                ["Apple slices", "Peanut butter", "Cinnamon", "Oats"],
                "future"
              )
            ],
            "90d": [
              createMeal(
                "breakfast",
                "Breakfast",
                "08:00 AM",
                "Lean wrap breakfast",
                mealImagePool.breakfastB,
                ["Egg wrap", "Turkey", "Spinach", "Cucumber"],
                "future"
              ),
              createMeal(
                "lunch",
                "Lunch",
                "02:00 PM",
                "Shrimp greens bowl",
                mealImagePool.lunchC,
                ["Shrimp", "Greens", "Rice", "Parsley"],
                "future"
              ),
              createMeal(
                "dinner",
                "Dinner",
                "08:00 PM",
                "Steak target plate",
                mealImagePool.dinnerC,
                ["Lean steak", "Vegetables", "Sweet potato", "Herbs"],
                "future"
              ),
              createMeal(
                "snack",
                "Snack",
                "10:00 PM",
                "Fruit yogurt reset",
                mealImagePool.snackB,
                ["Greek yogurt", "Banana", "Walnuts", "Honey"],
                "future"
              )
            ]
          }
        },
        summary: [
          { label: "Number Of Measurements", value: "14" },
          { label: "Missed Updates", value: "3" },
          { label: "Overall Diet Compliance", value: "76%" },
          { label: "Status", value: "Needs Review" }
        ],
        insight:
          "Weight trend is positive with moderate nutrition adherence. Improve meal logging consistency and late snack control."
      }
    }
  };
})();
