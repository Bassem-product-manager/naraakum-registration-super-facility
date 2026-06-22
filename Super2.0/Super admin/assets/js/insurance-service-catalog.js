(function (global) {
  "use strict";

  var SERVICES = [
    { id: "SS-01", service: "Video Consultation", main: "Telemedicine", price: 150.0, active: 1 },
    { id: "SS-02", service: "Audio Consultation", main: "Telemedicine", price: 120.0, active: 1 },
    { id: "SS-03", service: "Chronic Case Follow-up", main: "Remote Follow-up", price: 110.0, active: 1 },
    { id: "SS-04", service: "Post-Visit Follow-up", main: "Remote Follow-up", price: 95.0, active: 1 },
    { id: "SS-05", service: "Lab Sample Collection", main: "Laboratory Tests", price: 120.0, active: 1 },
    { id: "SS-06", service: "Comprehensive Blood Panel", main: "Laboratory Tests", price: 180.0, active: 1 },
    { id: "SS-07", service: "General Clinic Consultation", main: "In-Clinic Doctor Consultation", price: 200.0, active: 1 },
    { id: "SS-08", service: "Specialist Clinic Consultation", main: "In-Clinic Doctor Consultation", price: 280.0, active: 1 }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function norm(value) {
    return String(value || "").trim().toUpperCase();
  }

  function getById(id) {
    var key = norm(id);
    var found = SERVICES.find(function (item) {
      return norm(item.id) === key;
    });
    return found ? clone(found) : null;
  }

  global.NKInsuranceServiceCatalog = {
    version: 1,
    services: clone(SERVICES),
    getServices: function () {
      return clone(SERVICES);
    },
    getById: getById
  };
})(window);
