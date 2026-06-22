(function () {
  function round2(value) {
    var n = Number(value) || 0;
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  function moneyPartsFromTotal(total) {
    var gross = round2(total);
    var fees = round2(gross * 0.08);
    var vat = round2(gross * 0.13);
    var subtotal = round2(Math.max(0, gross - fees - vat));
    return {
      subtotal: subtotal,
      vat: vat,
      fees: fees,
      total: gross
    };
  }

  function cityCoords(city) {
    var key = (city || "").toString().trim().toLowerCase();
    var map = {
      riyadh: { lat: 24.7136, lng: 46.6753 },
      jeddah: { lat: 21.5433, lng: 39.1728 },
      dammam: { lat: 26.4207, lng: 50.0888 }
    };
    return map[key] || { lat: 24.7136, lng: 46.6753 };
  }

  function makeRating(stars, comment, createdAt) {
    return {
      stars: stars,
      comment: comment,
      createdAt: createdAt,
      ratedBy: "patient"
    };
  }

  function normalizeCancelSource(value, providerType) {
    var key = (value || "").toString().trim().toLowerCase();
    if (key === "customer" || key === "facility" || key === "individual") return key;

    var typeKey = (providerType || "").toString().trim().toLowerCase();
    if (typeKey === "individual") return "individual";
    if (typeKey === "facility") return "facility";
    return "customer";
  }

  function normalizeCancelType(value) {
    var key = (value || "").toString().trim().toLowerCase();
    var allowed = {
      customer_cancelled: true,
      patient_not_found: true,
      session_no_show: true,
      provider_unavailable: true,
      other: true
    };
    return allowed[key] ? key : "other";
  }

  function normalizeCancellation(cancellation, providerType, status) {
    var statusKey = (status || "").toString().trim().toLowerCase();
    var hasCancellation = statusKey === "cancelled" || statusKey === "canceled" || statusKey === "failed";
    if (!hasCancellation) {
      return {
        source: "",
        type: "",
        note: ""
      };
    }

    var raw = cancellation || {};
    return {
      source: normalizeCancelSource(raw.source, providerType),
      type: normalizeCancelType(raw.type || (statusKey === "failed" ? "provider_unavailable" : "customer_cancelled")),
      note: (raw.note || "").toString()
    };
  }

  function makeBase(seed) {
    var coords = cityCoords(seed.city);
    var parts = moneyPartsFromTotal(seed.total);

    return {
      orderNo: seed.orderNo,
      providerType: seed.providerType,
      institutionName: seed.institutionName,
      institutionCode: seed.institutionCode,
      patient: {
        name: seed.patientName,
        patientCode: (seed.patientCode || "").toString(),
        phone: seed.phone,
        age: seed.age,
        gender: seed.gender,
        nationality: seed.nationality,
        city: seed.city,
        mapLat: coords.lat,
        mapLng: coords.lng
      },
      order: {
        status: seed.status,
        orderDate: seed.orderDate,
        scheduledDate: seed.scheduledDate,
        paymentMethod: seed.paymentMethod,
        subtotal: parts.subtotal,
        vat: parts.vat,
        fees: parts.fees,
        total: parts.total,
        cancellation: normalizeCancellation(seed.cancellation, seed.providerType, seed.status)
      },
      services: [],
      medications: [],
      rating: seed.rating
    };
  }

  var records = [
    makeBase({
      orderNo: "12-03-000001",
      providerType: "facility",
      institutionName: "BMC Hospital",
      institutionCode: "FC-00001",
      patientName: "John Doe",
      phone: "+966 50 111 2233",
      age: 45,
      gender: "Male",
      nationality: "Saudi",
      city: "Riyadh",
      status: "pending",
      orderDate: "2026-01-16T10:15:00",
      scheduledDate: "2026-01-20T01:30:00",
      paymentMethod: "Wallet",
      total: 401.35,
      rating: makeRating(4, "Service quality was good and communication was clear.", "2026-01-21T10:15:00")
    }),
    makeBase({
      orderNo: "122-03-000002",
      providerType: "facility",
      institutionName: "Al Noor Medical Center",
      institutionCode: "FC-00002",
      patientName: "Jane Roe",
      phone: "+966 50 222 3344",
      age: 32,
      gender: "Female",
      nationality: "Saudi",
      city: "Jeddah",
      status: "in-progress",
      orderDate: "2026-01-16T11:05:00",
      scheduledDate: "2026-01-20T09:00:00",
      paymentMethod: "Card",
      total: 115.0,
      rating: makeRating(3, "Waiting time can be improved.", "2026-01-20T12:10:00")
    }),
    makeBase({
      orderNo: "4-03-000003",
      providerType: "facility",
      institutionName: "Green Valley Clinic",
      institutionCode: "FC-00003",
      patientName: "Mike Lee",
      phone: "+966 50 333 4455",
      age: 28,
      gender: "Male",
      nationality: "Jordanian",
      city: "Dammam",
      status: "completed",
      orderDate: "2026-01-15T03:20:00",
      scheduledDate: "2026-01-21T02:15:00",
      paymentMethod: "Card",
      total: 0,
      rating: makeRating(5, "Excellent visit and smooth process.", "2026-01-22T11:30:00")
    }),
    makeBase({
      orderNo: "12-03-000011",
      providerType: "facility",
      institutionName: "BMC Hospital",
      institutionCode: "FC-00001",
      patientName: "Sara Ibrahim",
      phone: "+966 50 000 9911",
      age: 31,
      gender: "Female",
      nationality: "Saudi",
      city: "Riyadh",
      status: "completed",
      orderDate: "2026-02-12T10:30:00",
      scheduledDate: "2026-02-13T12:00:00",
      paymentMethod: "Card",
      total: 506.0,
      rating: makeRating(5, "Great communication and smooth treatment flow.", "2026-02-13T16:10:00")
    }),

    makeBase({
      orderNo: "12-03-000011",
      providerType: "pharmacy",
      institutionName: "BMC Community Pharmacy",
      institutionCode: "PH-00001",
      patientName: "John Doe",
      phone: "+966 50 111 2233",
      age: 45,
      gender: "Male",
      nationality: "Saudi",
      city: "Riyadh",
      status: "pending",
      orderDate: "2026-02-03T10:15:00",
      scheduledDate: "2026-02-03T11:30:00",
      paymentMethod: "Card",
      total: 88.5,
      rating: makeRating(4, "Pharmacy team was helpful and fast.", "2026-02-03T14:00:00")
    }),
    makeBase({
      orderNo: "31-03-000012",
      providerType: "pharmacy",
      institutionName: "Al Noor Pharmacy",
      institutionCode: "PH-00002",
      patientName: "Mohamed Said",
      phone: "+966 50 000 4422",
      age: 36,
      gender: "Male",
      nationality: "Egyptian",
      city: "Jeddah",
      status: "completed",
      orderDate: "2026-02-11T09:10:00",
      scheduledDate: "2026-02-11T09:30:00",
      paymentMethod: "Wallet",
      total: 126.5,
      rating: makeRating(4, "Fast dispensing and clear dosage guidance.", "2026-02-11T12:10:00")
    }),
    makeBase({
      orderNo: "122-03-000012",
      providerType: "pharmacy",
      institutionName: "Al Noor Pharmacy",
      institutionCode: "PH-00002",
      patientName: "Jane Roe",
      phone: "+966 50 222 3344",
      age: 32,
      gender: "Female",
      nationality: "Saudi",
      city: "Jeddah",
      status: "in-progress",
      orderDate: "2026-02-03T11:05:00",
      scheduledDate: "2026-02-04T09:30:00",
      paymentMethod: "Wallet",
      total: 54.0,
      rating: makeRating(3, "Packaging was good, delivery was slightly delayed.", "2026-02-04T12:20:00")
    }),
    makeBase({
      orderNo: "4-03-000013",
      providerType: "pharmacy",
      institutionName: "Green Valley Pharmacy",
      institutionCode: "PH-00003",
      patientName: "Mike Lee",
      phone: "+966 50 333 4455",
      age: 28,
      gender: "Male",
      nationality: "Jordanian",
      city: "Dammam",
      status: "completed",
      orderDate: "2026-02-02T15:20:00",
      scheduledDate: "2026-02-02T17:00:00",
      paymentMethod: "Card",
      total: 289.0,
      rating: makeRating(5, "Medication was available and dispensed quickly.", "2026-02-02T18:00:00")
    }),
    makeBase({
      orderNo: "98-03-000014",
      providerType: "pharmacy",
      institutionName: "Future Care Pharmacy",
      institutionCode: "PH-00004",
      patientName: "Aisha Karim",
      phone: "+966 50 444 5566",
      age: 37,
      gender: "Female",
      nationality: "Saudi",
      city: "Riyadh",
      status: "pending",
      orderDate: "2026-02-01T08:50:00",
      scheduledDate: "2026-02-01T10:15:00",
      paymentMethod: "Wallet",
      total: 21.75,
      rating: makeRating(4, "Good support and clear instructions.", "2026-02-01T11:00:00")
    }),
    makeBase({
      orderNo: "12-03-000015",
      providerType: "pharmacy",
      institutionName: "BMC Community Pharmacy",
      institutionCode: "PH-00001",
      patientName: "Omar Saad",
      phone: "+966 50 667 7788",
      age: 51,
      gender: "Male",
      nationality: "Egyptian",
      city: "Riyadh",
      status: "cancelled",
      orderDate: "2026-01-31T10:10:00",
      scheduledDate: "2026-01-31T12:30:00",
      paymentMethod: "Bank",
      total: 34.2,
      cancellation: {
        source: "customer",
        type: "customer_cancelled",
        note: "Customer cancelled before dispensing."
      },
      rating: makeRating(2, "Order got cancelled before full dispensing.", "2026-01-31T13:10:00")
    }),
    makeBase({
      orderNo: "122-03-000016",
      providerType: "pharmacy",
      institutionName: "Al Noor Pharmacy",
      institutionCode: "PH-00002",
      patientName: "Lina Adel",
      phone: "+966 50 998 1100",
      age: 29,
      gender: "Female",
      nationality: "Saudi",
      city: "Jeddah",
      status: "in-progress",
      orderDate: "2026-01-31T14:40:00",
      scheduledDate: "2026-01-31T17:10:00",
      paymentMethod: "Card",
      total: 76,
      rating: makeRating(4, "Professional service and clear follow up.", "2026-01-31T18:00:00")
    }),
    makeBase({
      orderNo: "29-03-000231",
      providerType: "pharmacy",
      institutionName: "Al Noor Pharmacy",
      institutionCode: "PH-00002",
      patientName: "Mariam Adel",
      phone: "+966 50 741 5521",
      age: 34,
      gender: "Female",
      nationality: "Saudi",
      city: "Jeddah",
      status: "completed",
      orderDate: "2026-02-14T10:00:00",
      scheduledDate: "2026-02-14T11:00:00",
      paymentMethod: "Wallet",
      total: 184,
      rating: makeRating(5, "Perfect packaging and quick handoff.", "2026-02-14T13:00:00")
    }),

    makeBase({
      orderNo: "17-03-000021",
      providerType: "individual",
      institutionName: "Dr. Ahmed Alqahtani",
      institutionCode: "DR-00001",
      patientName: "Salem Faris",
      phone: "+966 50 333 7777",
      age: 59,
      gender: "Male",
      nationality: "Saudi",
      city: "Riyadh",
      status: "pending",
      orderDate: "2026-02-04T09:10:00",
      scheduledDate: "2026-02-05T10:30:00",
      paymentMethod: "Card",
      total: 350,
      rating: makeRating(5, "Doctor was very attentive and clear.", "2026-02-05T13:10:00")
    }),
    makeBase({
      orderNo: "31-03-000022",
      providerType: "individual",
      institutionName: "Dr. Sara Ibrahim",
      institutionCode: "DR-00002",
      patientName: "Lina Yasser",
      phone: "+966 50 123 8877",
      age: 27,
      gender: "Female",
      nationality: "Saudi",
      city: "Jeddah",
      status: "in-progress",
      orderDate: "2026-02-04T11:15:00",
      scheduledDate: "2026-02-05T08:40:00",
      paymentMethod: "Card",
      total: 290,
      rating: makeRating(4, "Good consultation and treatment plan.", "2026-02-05T11:00:00")
    }),
    makeBase({
      orderNo: "45-03-000023",
      providerType: "individual",
      institutionName: "Dr. Noura Hassan",
      institutionCode: "DR-00003",
      patientName: "Omar Adeeb",
      phone: "+966 50 213 9898",
      age: 9,
      gender: "Male",
      nationality: "Saudi",
      city: "Dammam",
      status: "completed",
      orderDate: "2026-02-03T15:00:00",
      scheduledDate: "2026-02-06T10:00:00",
      paymentMethod: "Card",
      total: 210,
      rating: makeRating(5, "Very kind and accurate follow-up.", "2026-02-06T14:20:00")
    }),
    makeBase({
      orderNo: "62-03-000024",
      providerType: "individual",
      institutionName: "Dr. Khalid Salem",
      institutionCode: "DR-00004",
      patientName: "Fahad Raed",
      phone: "+966 50 789 3344",
      age: 41,
      gender: "Male",
      nationality: "Saudi",
      city: "Riyadh",
      status: "pending",
      orderDate: "2026-02-03T17:20:00",
      scheduledDate: "2026-02-07T09:30:00",
      paymentMethod: "Wallet",
      total: 330,
      rating: makeRating(3, "Service was fine but started late.", "2026-02-07T13:00:00")
    }),
    makeBase({
      orderNo: "88-03-000025",
      providerType: "individual",
      institutionName: "Nurse Mona Saleh",
      institutionCode: "NR-00001",
      patientName: "Mona Hamed",
      patientCode: "PT-00006",
      phone: "+966 50 888 3322",
      age: 67,
      gender: "Female",
      nationality: "Saudi",
      city: "Riyadh",
      status: "cancelled",
      orderDate: "2026-02-02T10:30:00",
      scheduledDate: "2026-02-03T09:00:00",
      paymentMethod: "Bank",
      total: 180,
      cancellation: {
        source: "customer",
        type: "customer_cancelled",
        note: "Patient requested cancellation before the visit."
      },
      rating: makeRating(2, "Visit was cancelled and needed rescheduling.", "2026-02-03T11:10:00")
    }),
    makeBase({
      orderNo: "77-03-000105",
      providerType: "facility",
      institutionName: "BMC Hospital",
      institutionCode: "FC-00001",
      patientName: "Ali Rashad",
      phone: "+966 50 120 9811",
      age: 38,
      gender: "Male",
      nationality: "Saudi",
      city: "Riyadh",
      status: "cancelled",
      orderDate: "2026-02-06T08:10:00",
      scheduledDate: "2026-02-07T11:00:00",
      paymentMethod: "Bank",
      total: 190,
      cancellation: {
        source: "facility",
        type: "provider_unavailable",
        note: "Consultation room unavailable during scheduled slot."
      },
      rating: makeRating(2, "Appointment cancelled before full execution.", "2026-02-07T14:00:00")
    }),
    makeBase({
      orderNo: "66-03-000106",
      providerType: "facility",
      institutionName: "Al Noor Medical Center",
      institutionCode: "FC-00002",
      patientName: "Mohamed Said",
      patientCode: "PT-00002",
      phone: "+966 50 000 4422",
      age: 36,
      gender: "Male",
      nationality: "Egyptian",
      city: "Jeddah",
      status: "failed",
      orderDate: "2026-02-08T09:45:00",
      scheduledDate: "2026-02-08T12:00:00",
      paymentMethod: "Card",
      total: 245,
      cancellation: {
        source: "facility",
        type: "provider_unavailable",
        note: "Required diagnostic room was out of service."
      },
      rating: makeRating(2, "Service was not completed due to provider-side issue.", "2026-02-08T16:40:00")
    }),
    makeBase({
      orderNo: "93-03-000026",
      providerType: "individual",
      institutionName: "Nurse Youssef Hamed",
      institutionCode: "NR-00002",
      patientName: "Abdullah Sameer",
      phone: "+966 50 678 5511",
      age: 52,
      gender: "Male",
      nationality: "Saudi",
      city: "Jeddah",
      status: "in-progress",
      orderDate: "2026-02-01T16:40:00",
      scheduledDate: "2026-02-02T08:00:00",
      paymentMethod: "Card",
      total: 205,
      rating: makeRating(4, "Nurse explained all steps clearly.", "2026-02-02T10:20:00")
    }),
    makeBase({
      orderNo: "95-03-000027",
      providerType: "individual",
      institutionName: "Dr. Sara Ibrahim",
      institutionCode: "DR-00002",
      patientName: "Sara Ibrahim",
      patientCode: "PT-00001",
      phone: "+966 50 000 9911",
      age: 31,
      gender: "Female",
      nationality: "Saudi",
      city: "Riyadh",
      status: "failed",
      orderDate: "2026-02-08T10:20:00",
      scheduledDate: "2026-02-09T11:30:00",
      paymentMethod: "Wallet",
      total: 260,
      cancellation: {
        source: "customer",
        type: "session_no_show",
        note: "Customer did not attend the scheduled tele-consultation."
      },
      rating: makeRating(2, "Session did not proceed and required rebooking.", "2026-02-09T12:35:00")
    })
  ];

  var byOrder = {};
  var byOrderAndType = {};

  records.forEach(function (rec) {
    var orderKey = (rec.orderNo || "").toString().trim();
    var typeKey = (rec.providerType || "").toString().trim().toLowerCase();
    if (!orderKey) return;

    if (!byOrder[orderKey]) byOrder[orderKey] = rec;
    byOrderAndType[orderKey + "::" + typeKey] = rec;
  });

  function setServices(orderNo, providerType, rows) {
    var key = (orderNo || "").toString().trim() + "::" + (providerType || "").toString().trim().toLowerCase();
    var rec = byOrderAndType[key] || byOrder[(orderNo || "").toString().trim()];
    if (rec) rec.services = rows || [];
  }

  function setMedications(orderNo, providerType, rows) {
    var key = (orderNo || "").toString().trim() + "::" + (providerType || "").toString().trim().toLowerCase();
    var rec = byOrderAndType[key] || byOrder[(orderNo || "").toString().trim()];
    if (rec) rec.medications = rows || [];
  }

  setServices("12-03-000001", "facility", [{ name: "Consultation", qty: "1 Session", providerName: "Dr. Waleed Anas", phone: "+966530516730", email: "waleed.anas@bmc-sa.com", status: "accepted", price: 401.35 }]);
  setServices("122-03-000002", "facility", [{ name: "X-Ray Scan", qty: "1 Scan", providerName: "Dr. Sara Hamad", phone: "+966540100225", email: "sara.hamad@alnoor.com", status: "in-progress", price: 115.0 }]);
  setServices("4-03-000003", "facility", [{ name: "Annual Checkup", qty: "1 Package", providerName: "Dr. Omar Hasan", phone: "+966531900411", email: "omar.hasan@gvclinic.com", status: "completed", price: 0 }]);
  setServices("12-03-000011", "facility", [{ name: "General Checkup", qty: "1 Session", providerName: "Dr. Ahmed Ali", phone: "+966 50 111 2233", email: "ahmed.ali@bmc-sa.com", status: "completed", price: 506 }]);

  setServices("17-03-000021", "individual", [{ name: "Consultation", qty: "1 Session", providerName: "Dr. Ahmed Alqahtani", phone: "+966 55 110 2200", email: "ahmed.alqahtani@naraakum.com", status: "pending", price: 350 }]);
  setServices("31-03-000022", "individual", [{ name: "Skin Assessment", qty: "1 Session", providerName: "Dr. Sara Ibrahim", phone: "+966 55 334 1122", email: "sara.ibrahim@naraakum.com", status: "in-progress", price: 290 }]);
  setServices("45-03-000023", "individual", [{ name: "Pediatric Follow-up", qty: "1 Session", providerName: "Dr. Noura Hassan", phone: "+966 55 999 7711", email: "noura.hassan@naraakum.com", status: "completed", price: 210 }]);
  setServices("62-03-000024", "individual", [{ name: "Orthopedic Evaluation", qty: "1 Session", providerName: "Dr. Khalid Salem", phone: "+966 55 201 7890", email: "khalid.salem@naraakum.com", status: "pending", price: 330 }]);
  setServices("88-03-000025", "individual", [{ name: "Wound Dressing Visit", qty: "1 Visit", providerName: "Nurse Mona Saleh", phone: "+966 55 112 4433", email: "mona.saleh@naraakum.com", status: "cancelled", price: 180 }]);
  setServices("77-03-000105", "facility", [{ name: "General Consultation", qty: "1 Session", providerName: "Dr. Ahmed Ali", phone: "+966 55 305 1001", email: "ahmed.ali@bmc-sa.com", status: "cancelled", price: 190 }]);
  setServices("66-03-000106", "facility", [{ name: "Ultrasound Screening", qty: "1 Session", providerName: "Dr. Sara Hamad", phone: "+966540100225", email: "sara.hamad@alnoor.com", status: "failed", price: 245 }]);
  setServices("93-03-000026", "individual", [{ name: "IV Therapy Visit", qty: "1 Visit", providerName: "Nurse Youssef Hamed", phone: "+966 55 667 3322", email: "youssef.hamed@naraakum.com", status: "in-progress", price: 205 }]);
  setServices("95-03-000027", "individual", [{ name: "Tele Consultation", qty: "1 Session", providerName: "Dr. Sara Ibrahim", phone: "+966 55 334 1122", email: "sara.ibrahim@naraakum.com", status: "failed", price: 260 }]);

  setMedications("12-03-000011", "pharmacy", [{ name: "Amoxicillin", form: "Capsules", strength: "500 mg", qty: 2, unitPrice: 38.48, vatRate: 0.15, total: 88.5, dispenseStatus: "pending", fulfillment: "pickup" }]);
  setMedications("31-03-000012", "pharmacy", [{ name: "Metformin", form: "Tablets", strength: "850 mg", qty: 2, unitPrice: 55.0, vatRate: 0.15, total: 126.5, dispenseStatus: "completed", fulfillment: "pickup" }]);
  setMedications("122-03-000012", "pharmacy", [{ name: "Metformin", form: "Tablets", strength: "850 mg", qty: 1, unitPrice: 46.96, vatRate: 0.15, total: 54, dispenseStatus: "in-progress", fulfillment: "delivery" }]);
  setMedications("4-03-000013", "pharmacy", [{ name: "Insulin Glargine Pen", form: "Pen", strength: "100 IU/ml", qty: 3, unitPrice: 83.77, vatRate: 0.15, total: 289, dispenseStatus: "completed", fulfillment: "urgent delivery" }]);
  setMedications("98-03-000014", "pharmacy", [{ name: "Ibuprofen", form: "Tablets", strength: "400 mg", qty: 1, unitPrice: 18.91, vatRate: 0.15, total: 21.75, dispenseStatus: "pending", fulfillment: "pickup" }]);
  setMedications("12-03-000015", "pharmacy", [{ name: "Vitamin D3", form: "Softgel", strength: "50000 IU", qty: 1, unitPrice: 29.74, vatRate: 0.15, total: 34.2, dispenseStatus: "cancelled", fulfillment: "delivery" }]);
  setMedications("122-03-000016", "pharmacy", [{ name: "Azithromycin", form: "Tablets", strength: "500 mg", qty: 2, unitPrice: 33.04, vatRate: 0.15, total: 76, dispenseStatus: "in-progress", fulfillment: "pickup" }]);
  setMedications("29-03-000231", "pharmacy", [{ name: "Cough Syrup", form: "Syrup", strength: "120 ml", qty: 2, unitPrice: 80.0, vatRate: 0.15, total: 184, dispenseStatus: "completed", fulfillment: "delivery" }]);

  function getOrder(orderNo, providerType) {
    var orderKey = (orderNo || "").toString().trim();
    var typeKey = (providerType || "").toString().trim().toLowerCase();

    if (!orderKey) return null;
    if (typeKey) {
      var typed = byOrderAndType[orderKey + "::" + typeKey];
      if (typed) return typed;
    }

    return byOrder[orderKey] || null;
  }

  function listOrders(providerType) {
    var typeKey = (providerType || "").toString().trim().toLowerCase();
    var rows = records;
    if (typeKey) {
      rows = records.filter(function (rec) {
        return ((rec.providerType || "").toString().trim().toLowerCase() === typeKey);
      });
    }
    return rows.map(function (rec) {
      return JSON.parse(JSON.stringify(rec));
    });
  }

  function backHref(from, providerType, entityCode) {
    var source = (from || "").toString().trim().toLowerCase();
    if (source === "facility-orders") return "facilities-order.html";
    if (source === "pharmacy-orders") return "pharmacy-order.html";
    if (source === "individual-orders") return "Individuals-order.html";
    if (source === "facility-returns") return "returns-facility.html";
    if (source === "individual-returns") return "returns-individual.html";
    if (source === "pharmacy-returns") return "returns-list.html";
    if (source === "transaction-orders") return "../payment/transaction-orders.html";
    if (source === "insurance-invoices") return "../payment/insurance-invoices.html";
    if (source === "ledger") {
      var base = "../payment/entity-ledger.html";
      return entityCode ? base + "?entity=" + encodeURIComponent(entityCode) : base;
    }

    if (providerType === "pharmacy") return "pharmacy-order.html";
    if (providerType === "individual") return "Individuals-order.html";
    return "facilities-order.html";
  }

  window.NKOrderDetailsData = {
    getOrder: getOrder,
    listOrders: listOrders,
    getBackHref: backHref
  };
})();
