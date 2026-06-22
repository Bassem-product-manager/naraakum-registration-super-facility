(function (global) {
  "use strict";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  var questionTypes = [
    { id: "text", label: "Text" },
    { id: "single_choice", label: "Single choice" },
    { id: "multiple_choice", label: "Multiple choice" },
    { id: "yes_no", label: "Yes / No" },
    { id: "number", label: "Number" },
    { id: "attachment", label: "Attachment" }
  ];

  var doctors = [
    { id: "DR-00001", name: "Dr. Ahmed Alqahtani", specialtyId: "cardiology", specialtyName: "Cardiology", status: "Active" },
    { id: "DR-00002", name: "Dr. Sara Ibrahim", specialtyId: "dermatology", specialtyName: "Dermatology", status: "Active" },
    { id: "DR-00003", name: "Dr. Noura Hassan", specialtyId: "pediatrics", specialtyName: "Pediatrics", status: "Inactive" },
    { id: "DR-00004", name: "Dr. Khalid Salem", specialtyId: "orthopedic_surgery", specialtyName: "Orthopedic Surgery", status: "Active" },
    { id: "DR-00005", name: "Dr. Laila Omar", specialtyId: "internal_medicine", specialtyName: "Internal Medicine", status: "Active" },
    { id: "DR-00006", name: "Dr. Basma Nader", specialtyId: "nutrition", specialtyName: "Nutrition", status: "Active" },
    { id: "DR-00007", name: "Dr. Sami Khaled", specialtyId: "physical_therapy", specialtyName: "Physical Therapy", status: "Active" }
  ];

  var specialties = [
    { id: "general", name: "General / Uncategorized", isGeneral: true, status: "Active", summaryDoctorCount: 0, summaryQuestionCount: 18 },
    { id: "cardiology", name: "Cardiology", status: "Active", summaryDoctorCount: 14, summaryQuestionCount: 27 },
    { id: "dermatology", name: "Dermatology", status: "Active", summaryDoctorCount: 9, summaryQuestionCount: 22 },
    { id: "internal_medicine", name: "Internal Medicine", status: "Active", summaryDoctorCount: 18, summaryQuestionCount: 31 },
    { id: "nutrition", name: "Nutrition", status: "Active", summaryDoctorCount: 11, summaryQuestionCount: 24 },
    { id: "orthopedic_surgery", name: "Orthopedic Surgery", status: "Active", summaryDoctorCount: 8, summaryQuestionCount: 17 },
    { id: "pediatrics", name: "Pediatrics", status: "Inactive", summaryDoctorCount: 16, summaryQuestionCount: 29 },
    { id: "physical_therapy", name: "Physical Therapy", status: "Active", summaryDoctorCount: 7, summaryQuestionCount: 13 }
  ];

  var questions = [
    {
      id: "RQ-001",
      text: "Do you have any food allergy?",
      textEn: "Do you have any food allergy?",
      helper: "Shown before nutrition and general care questions.",
      type: "Yes / No",
      typeId: "yes_no",
      required: true,
      status: "Active",
      displayOrder: 1,
      specialtyId: "nutrition",
      specialtyName: "Nutrition",
      scope: "All doctors in specialty",
      parentId: "",
      triggerValue: "",
      followUpRequired: false
    },
    {
      id: "RQ-002",
      text: "What type of allergy?",
      textEn: "What type of allergy?",
      helper: "Follow-up when food allergy is yes.",
      type: "Text",
      typeId: "text",
      required: true,
      status: "Active",
      displayOrder: 2,
      specialtyId: "nutrition",
      specialtyName: "Nutrition",
      scope: "All doctors in specialty",
      parentId: "RQ-001",
      triggerValue: "Yes",
      followUpRequired: true
    },
    {
      id: "RQ-003",
      text: "Is there any special formula used?",
      textEn: "Is there any special formula used?",
      helper: "",
      type: "Yes / No",
      typeId: "yes_no",
      required: false,
      status: "Active",
      displayOrder: 3,
      specialtyId: "nutrition",
      specialtyName: "Nutrition",
      scope: "Selected doctors only",
      includedDoctorIds: ["DR-00006"],
      parentId: "",
      triggerValue: "",
      followUpRequired: false
    },
    {
      id: "RQ-004",
      text: "What kind?",
      textEn: "What kind?",
      helper: "Nested follow-up sample.",
      type: "Single choice",
      typeId: "single_choice",
      options: ["Milk-based", "Peptide-based", "Other"],
      required: true,
      status: "Active",
      displayOrder: 4,
      specialtyId: "nutrition",
      specialtyName: "Nutrition",
      scope: "Selected doctors only",
      includedDoctorIds: ["DR-00006"],
      parentId: "RQ-003",
      triggerValue: "Yes",
      followUpRequired: true
    },
    {
      id: "RQ-013",
      text: "Specify the formula kind",
      textEn: "Specify the formula kind",
      helper: "Second-level follow-up shown when Other is selected for formula kind.",
      type: "Text",
      typeId: "text",
      required: true,
      status: "Active",
      displayOrder: 4.5,
      specialtyId: "nutrition",
      specialtyName: "Nutrition",
      scope: "Selected doctors only",
      includedDoctorIds: ["DR-00006"],
      parentId: "RQ-004",
      triggerValue: "Other",
      followUpRequired: true
    },
    {
      id: "RQ-005",
      text: "What is the current diet plan?",
      textEn: "What is the current diet plan?",
      helper: "",
      type: "Single choice",
      typeId: "single_choice",
      options: ["Regular", "Low sodium", "Diabetic diet", "Other"],
      required: true,
      status: "Active",
      displayOrder: 5,
      specialtyId: "nutrition",
      specialtyName: "Nutrition",
      scope: "All doctors in specialty",
      parentId: "",
      triggerValue: "",
      followUpRequired: false
    },
    {
      id: "RQ-006",
      text: "Specify the diet plan",
      textEn: "Specify the diet plan",
      helper: "Shown when Other is selected.",
      type: "Text",
      typeId: "text",
      required: true,
      status: "Active",
      displayOrder: 6,
      specialtyId: "nutrition",
      specialtyName: "Nutrition",
      scope: "All doctors in specialty",
      parentId: "RQ-005",
      triggerValue: "Other",
      followUpRequired: true
    },
    {
      id: "RQ-007",
      text: "Do you have previous reports?",
      textEn: "Do you have previous reports?",
      helper: "",
      type: "Yes / No",
      typeId: "yes_no",
      required: false,
      status: "Active",
      displayOrder: 1,
      specialtyId: "general",
      specialtyName: "General / Uncategorized",
      scope: "General / Uncategorized",
      parentId: "",
      triggerValue: "",
      followUpRequired: false
    },
    {
      id: "RQ-008",
      text: "Attach the previous report",
      textEn: "Attach the previous report",
      helper: "PDF or image is accepted in this static prototype.",
      type: "Attachment",
      typeId: "attachment",
      attachment: { fileType: "Image or PDF", maxFiles: 2, maxSizeMb: 8 },
      required: true,
      status: "Active",
      displayOrder: 2,
      specialtyId: "general",
      specialtyName: "General / Uncategorized",
      scope: "General / Uncategorized",
      parentId: "RQ-007",
      triggerValue: "Yes",
      followUpRequired: true
    },
    {
      id: "RQ-009",
      text: "Describe the skin symptoms",
      textEn: "Describe the skin symptoms",
      helper: "",
      type: "Text",
      typeId: "text",
      required: true,
      status: "Active",
      displayOrder: 1,
      specialtyId: "dermatology",
      specialtyName: "Dermatology",
      scope: "Selected doctors only",
      includedDoctorIds: ["DR-00002"],
      parentId: "",
      triggerValue: "",
      followUpRequired: false
    },
    {
      id: "RQ-010",
      text: "Select known heart conditions",
      textEn: "Select known heart conditions",
      helper: "",
      type: "Multiple choice",
      typeId: "multiple_choice",
      options: ["Hypertension", "Arrhythmia", "Heart failure", "Other"],
      required: false,
      status: "Active",
      displayOrder: 1,
      specialtyId: "cardiology",
      specialtyName: "Cardiology",
      scope: "All doctors except selected",
      excludedDoctorIds: ["DR-00001"],
      parentId: "",
      triggerValue: "",
      followUpRequired: false
    },
    {
      id: "RQ-011",
      text: "When did the pain start?",
      textEn: "When did the pain start?",
      helper: "",
      type: "Text",
      typeId: "text",
      required: true,
      status: "Inactive",
      displayOrder: 1,
      specialtyId: "orthopedic_surgery",
      specialtyName: "Orthopedic Surgery",
      scope: "All doctors in specialty",
      parentId: "",
      triggerValue: "",
      followUpRequired: false
    },
    {
      id: "RQ-012",
      text: "Current pain score",
      textEn: "Current pain score",
      helper: "Use a value from 0 to 10.",
      type: "Number",
      typeId: "number",
      required: true,
      status: "Active",
      displayOrder: 2,
      specialtyId: "physical_therapy",
      specialtyName: "Physical Therapy",
      scope: "All doctors in specialty",
      parentId: "",
      triggerValue: "",
      followUpRequired: false
    }
  ];

  function getDoctorsBySpecialty(specialtyId) {
    return doctors.filter(function (doctor) {
      return doctor.specialtyId === specialtyId;
    });
  }

  function getQuestionsBySpecialty(specialtyId) {
    return questions
      .filter(function (question) {
        return question.specialtyId === specialtyId;
      })
      .sort(function (a, b) {
        return Number(a.displayOrder || 0) - Number(b.displayOrder || 0);
      });
  }

  function getQuestionById(id) {
    var found = questions.find(function (question) {
      return question.id === id;
    });
    return found ? clone(found) : null;
  }

  function getSpecialtySummaries() {
    return specialties.map(function (specialty) {
      var doctorCount = typeof specialty.summaryDoctorCount === "number"
        ? specialty.summaryDoctorCount
        : specialty.isGeneral ? 0 : getDoctorsBySpecialty(specialty.id).length;
      var questionCount = typeof specialty.summaryQuestionCount === "number"
        ? specialty.summaryQuestionCount
        : getQuestionsBySpecialty(specialty.id).length;
      return {
        id: specialty.id,
        name: specialty.name,
        isGeneral: Boolean(specialty.isGeneral),
        doctorCount: doctorCount,
        questionCount: questionCount,
        status: specialty.status || "Active"
      };
    });
  }

  global.NKRegistrationQuestionsData = {
    questionTypes: clone(questionTypes),
    doctors: clone(doctors),
    specialties: clone(specialties),
    questions: clone(questions),
    getQuestionById: getQuestionById,
    getDoctorsBySpecialty: function (specialtyId) {
      return clone(getDoctorsBySpecialty(specialtyId));
    },
    getQuestionsBySpecialty: function (specialtyId) {
      return clone(getQuestionsBySpecialty(specialtyId));
    },
    getSpecialtySummaries: function () {
      return clone(getSpecialtySummaries());
    }
  };
})(window);
