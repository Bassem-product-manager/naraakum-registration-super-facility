(function () {
  var patients = [
    {
      patientCode: "PT-00001",
      name: "Sara Ibrahim",
      phone: "+966 50 000 9911",
      gender: "Female",
      nationality: "Saudi",
      city: "Riyadh",
      lastActivityAt: "2026-02-12T10:20:00Z"
    },
    {
      patientCode: "PT-00002",
      name: "Mohamed Said",
      phone: "+966 50 000 4422",
      gender: "Male",
      nationality: "Egyptian",
      city: "Jeddah",
      lastActivityAt: "2026-02-11T15:45:00Z"
    },
    {
      patientCode: "PT-00003",
      name: "Yousef Adel",
      phone: "+966 50 000 7733",
      gender: "Male",
      nationality: "Saudi",
      city: "Riyadh",
      lastActivityAt: "2026-02-10T09:35:00Z"
    },
    {
      patientCode: "PT-00004",
      name: "Nora Al Qahtani",
      phone: "+966 50 000 8855",
      gender: "Female",
      nationality: "Saudi",
      city: "Dammam",
      lastActivityAt: "2026-02-12T08:55:00Z"
    },
    {
      patientCode: "PT-00005",
      name: "Hassan Kamal",
      phone: "+966 50 000 6644",
      gender: "Male",
      nationality: "Jordanian",
      city: "Makkah",
      lastActivityAt: "2026-02-07T07:30:00Z"
    },
    {
      patientCode: "PT-00006",
      name: "Mona Hamed",
      phone: "+966 50 888 3322",
      gender: "Female",
      nationality: "Saudi",
      city: "Riyadh",
      lastActivityAt: "2026-02-03T09:45:00Z"
    }
  ];

  var orders = [
    {
      orderId: "ord-1001",
      orderNo: "BR03-OR-000011",
      patientCode: "PT-00001",
      status: "ongoing",
      createdAt: "2026-02-12T10:20:00Z",
      linkedVisitId: "rec-1",
      itemType: "service",
      title: "Doctor Home Visit",
      price: "210.00 SAR"
    },
    {
      orderId: "ord-1002",
      orderNo: "BR03-OR-000012",
      patientCode: "PT-00001",
      status: "completed",
      createdAt: "2026-02-10T11:10:00Z",
      linkedVisitId: "rec-2",
      itemType: "service",
      title: "Laboratory Analysis",
      price: "120.00 SAR"
    },
    {
      orderId: "ord-1003",
      orderNo: "BR03-OR-000013",
      patientCode: "PT-00001",
      status: "pending",
      createdAt: "2026-02-09T09:00:00Z",
      linkedVisitId: "",
      itemType: "product",
      title: "Medication Refill",
      price: "95.00 SAR"
    },
    {
      orderId: "ord-1004",
      orderNo: "BR03-OR-000014",
      patientCode: "PT-00001",
      status: "completed",
      createdAt: "2026-02-07T08:20:00Z",
      linkedVisitId: "rec-2s",
      itemType: "service",
      title: "Respiratory Session",
      price: "165.00 SAR"
    },

    {
      orderId: "ord-2001",
      orderNo: "BR03-OR-000021",
      patientCode: "PT-00002",
      status: "completed",
      createdAt: "2026-02-11T15:45:00Z",
      linkedVisitId: "rec-3",
      itemType: "service",
      title: "Physiotherapy Package",
      price: "280.00 SAR"
    },
    {
      orderId: "ord-2002",
      orderNo: "BR03-OR-000022",
      patientCode: "PT-00002",
      status: "ongoing",
      createdAt: "2026-02-09T13:20:00Z",
      linkedVisitId: "rec-4",
      itemType: "service",
      title: "Nursing Visit",
      price: "150.00 SAR"
    },
    {
      orderId: "ord-2003",
      orderNo: "BR03-OR-000023",
      patientCode: "PT-00002",
      status: "pending",
      createdAt: "2026-02-08T12:00:00Z",
      linkedVisitId: "",
      itemType: "product",
      title: "Home Medications",
      price: "130.00 SAR"
    },
    {
      orderId: "ord-2004",
      orderNo: "BR03-OR-000024",
      patientCode: "PT-00002",
      status: "canceled",
      createdAt: "2026-02-06T11:30:00Z",
      linkedVisitId: "",
      itemType: "service",
      title: "Skin Treatment Session",
      price: "145.00 SAR"
    },

    {
      orderId: "ord-3001",
      orderNo: "BR03-OR-000031",
      patientCode: "PT-00003",
      status: "canceled",
      createdAt: "2026-02-10T09:35:00Z",
      linkedVisitId: "",
      itemType: "service",
      title: "Remote Consultation",
      price: "90.00 SAR"
    },
    {
      orderId: "ord-3002",
      orderNo: "BR03-OR-000032",
      patientCode: "PT-00003",
      status: "completed",
      createdAt: "2026-02-05T10:45:00Z",
      linkedVisitId: "rec-5",
      itemType: "service",
      title: "General Checkup",
      price: "140.00 SAR"
    },

    {
      orderId: "ord-4001",
      orderNo: "BR03-OR-000041",
      patientCode: "PT-00004",
      status: "ongoing",
      createdAt: "2026-02-12T08:55:00Z",
      linkedVisitId: "rec-6",
      itemType: "service",
      title: "Post-Surgery Follow-up",
      price: "230.00 SAR"
    },
    {
      orderId: "ord-4002",
      orderNo: "BR03-OR-000042",
      patientCode: "PT-00004",
      status: "completed",
      createdAt: "2026-02-10T14:10:00Z",
      linkedVisitId: "rec-6s",
      itemType: "product",
      title: "Wound Care Kit",
      price: "110.00 SAR"
    },

    {
      orderId: "ord-5001",
      orderNo: "BR03-OR-000051",
      patientCode: "PT-00005",
      status: "pending",
      createdAt: "2026-02-07T07:30:00Z",
      linkedVisitId: "",
      itemType: "product",
      title: "Monthly Medication",
      price: "100.00 SAR"
    }
  ];

  var visits = [
    {
      recordId: "rec-1",
      patientCode: "PT-00001",
      visitDate: "2026-02-12T10:20:00Z",
      providerName: "Dr. Sror Rashad",
      hospitalName: "Bassam Medical Center",
      notes: "Visit completed. Patient reported stable blood pressure and improved breathing.",
      orderId: "ord-1001",
      recordType: "visit"
    },
    {
      recordId: "rec-1s",
      patientCode: "PT-00001",
      visitDate: "2026-02-11T16:40:00Z",
      providerName: "Nurse Hala Omar",
      hospitalName: "Bassam Medical Center",
      notes: "Session focused on medication adherence and hydration follow-up.",
      orderId: "ord-1001",
      recordType: "session"
    },
    {
      recordId: "rec-2",
      patientCode: "PT-00001",
      visitDate: "2026-02-10T11:10:00Z",
      providerName: "Dr. Ahmed Ali",
      hospitalName: "Sulayman Alhabib Center",
      notes: "Laboratory results reviewed and treatment plan updated.",
      orderId: "ord-1002",
      recordType: "visit"
    },
    {
      recordId: "rec-2s",
      patientCode: "PT-00001",
      visitDate: "2026-02-09T12:30:00Z",
      providerName: "Therapist Rana Khaled",
      hospitalName: "Sulayman Alhabib Center",
      notes: "Respiratory therapy session completed without complications.",
      orderId: "ord-1004",
      recordType: "session"
    },

    {
      recordId: "rec-3",
      patientCode: "PT-00002",
      visitDate: "2026-02-11T15:45:00Z",
      providerName: "Dr. Hadi Salem",
      hospitalName: "Jeddah Care Hospital",
      notes: "Physiotherapy reassessment with measurable mobility improvement.",
      orderId: "ord-2001",
      recordType: "visit"
    },
    {
      recordId: "rec-3s",
      patientCode: "PT-00002",
      visitDate: "2026-02-10T09:40:00Z",
      providerName: "Therapist Mona Hassan",
      hospitalName: "Jeddah Care Hospital",
      notes: "Session for lower-back strengthening exercises.",
      orderId: "ord-2001",
      recordType: "session"
    },
    {
      recordId: "rec-4",
      patientCode: "PT-00002",
      visitDate: "2026-02-09T13:20:00Z",
      providerName: "Nurse Amal Farouk",
      hospitalName: "Jeddah Care Hospital",
      notes: "Nursing visit done, vitals stable and wound dressing updated.",
      orderId: "ord-2002",
      recordType: "visit"
    },
    {
      recordId: "rec-4s",
      patientCode: "PT-00002",
      visitDate: "2026-02-08T17:30:00Z",
      providerName: "Nurse Amal Farouk",
      hospitalName: "Jeddah Care Hospital",
      notes: "Session focused on home-care instructions for family members.",
      orderId: "ord-2002",
      recordType: "session"
    },

    {
      recordId: "rec-5",
      patientCode: "PT-00003",
      visitDate: "2026-02-05T10:45:00Z",
      providerName: "Dr. Ali Mansour",
      hospitalName: "Riyadh Medical Group",
      notes: "General checkup completed and routine labs requested.",
      orderId: "ord-3002",
      recordType: "visit"
    },
    {
      recordId: "rec-5s",
      patientCode: "PT-00003",
      visitDate: "2026-02-04T09:15:00Z",
      providerName: "Nurse Dina Adel",
      hospitalName: "Riyadh Medical Group",
      notes: "Session included health education and follow-up planning.",
      orderId: "ord-3002",
      recordType: "session"
    },

    {
      recordId: "rec-6",
      patientCode: "PT-00004",
      visitDate: "2026-02-12T08:55:00Z",
      providerName: "Dr. Waleed Nasser",
      hospitalName: "Dammam Specialist Center",
      notes: "Visit for post-surgery review. Recovery is progressing normally.",
      orderId: "ord-4001",
      recordType: "visit"
    },
    {
      recordId: "rec-6s",
      patientCode: "PT-00004",
      visitDate: "2026-02-11T13:15:00Z",
      providerName: "Nurse Laila Hassan",
      hospitalName: "Dammam Specialist Center",
      notes: "Session for wound cleaning and medication schedule review.",
      orderId: "ord-4002",
      recordType: "session"
    },

    {
      recordId: "rec-7",
      patientCode: "PT-00006",
      visitDate: "2026-02-03T09:00:00Z",
      providerName: "Nurse Mona Saleh",
      hospitalName: "Riyadh Home Care",
      notes: "Initial home visit assessment before cancellation request.",
      orderId: "ord-6001",
      recordType: "visit"
    },
    {
      recordId: "rec-7s",
      patientCode: "PT-00006",
      visitDate: "2026-02-02T16:30:00Z",
      providerName: "Nurse Mona Saleh",
      hospitalName: "Riyadh Home Care",
      notes: "Pre-visit nursing session and care plan briefing.",
      orderId: "ord-6001",
      recordType: "session"
    }
  ];

  var medications = [
    {
      medId: "med-1",
      patientCode: "PT-00001",
      orderId: "ord-1001",
      recordId: "rec-1",
      name: "Amoxicillin 500mg",
      qty: 14,
      pharmacyName: "Al Nahdi Pharmacy",
      date: "2026-02-12T11:00:00Z",
      type: "dispensed"
    },
    {
      medId: "med-2",
      patientCode: "PT-00001",
      orderId: "ord-1002",
      recordId: "rec-2",
      name: "Vitamin D 5000 IU",
      qty: 30,
      pharmacyName: "Al Dawaa Pharmacy",
      date: "2026-02-10T12:00:00Z",
      type: "prescribed"
    },
    {
      medId: "med-3",
      patientCode: "PT-00001",
      orderId: "ord-1004",
      recordId: "rec-2s",
      name: "Bronchodilator Inhaler",
      qty: 2,
      pharmacyName: "HealthPlus Pharmacy",
      date: "2026-02-09T13:10:00Z",
      type: "dispensed"
    },

    {
      medId: "med-4",
      patientCode: "PT-00002",
      orderId: "ord-2003",
      recordId: "",
      name: "Pain Relief Gel",
      qty: 2,
      pharmacyName: "Jeddah Pharma",
      date: "2026-02-08T12:30:00Z",
      type: "dispensed"
    },
    {
      medId: "med-5",
      patientCode: "PT-00002",
      orderId: "ord-2002",
      recordId: "rec-4",
      name: "Wound Care Ointment",
      qty: 4,
      pharmacyName: "Jeddah Pharma",
      date: "2026-02-09T14:05:00Z",
      type: "prescribed"
    },
    {
      medId: "med-6",
      patientCode: "PT-00002",
      orderId: "ord-2001",
      recordId: "rec-3s",
      name: "Muscle Relaxant",
      qty: 10,
      pharmacyName: "Al Nahdi Pharmacy",
      date: "2026-02-10T10:35:00Z",
      type: "dispensed"
    },

    {
      medId: "med-7",
      patientCode: "PT-00003",
      orderId: "ord-3002",
      recordId: "rec-5",
      name: "Ibuprofen 400mg",
      qty: 10,
      pharmacyName: "Riyadh Central Pharmacy",
      date: "2026-02-05T11:10:00Z",
      type: "prescribed"
    },

    {
      medId: "med-8",
      patientCode: "PT-00004",
      orderId: "ord-4001",
      recordId: "rec-6",
      name: "Antibiotic Tablets",
      qty: 21,
      pharmacyName: "Dammam Care Pharmacy",
      date: "2026-02-12T09:20:00Z",
      type: "prescribed"
    },
    {
      medId: "med-9",
      patientCode: "PT-00004",
      orderId: "ord-4002",
      recordId: "rec-6s",
      name: "Sterile Gauze Pack",
      qty: 12,
      pharmacyName: "Dammam Care Pharmacy",
      date: "2026-02-11T14:00:00Z",
      type: "dispensed"
    },

    {
      medId: "med-10",
      patientCode: "PT-00005",
      orderId: "ord-5001",
      recordId: "",
      name: "Monthly Diabetes Kit",
      qty: 1,
      pharmacyName: "Makkah Health Pharmacy",
      date: "2026-02-07T07:45:00Z",
      type: "prescribed"
    }
  ];

  var services = [
    {
      serviceId: "srv-1",
      patientCode: "PT-00001",
      orderId: "ord-1001",
      recordId: "rec-1",
      name: "Doctor Home Visit",
      qty: 1,
      date: "2026-02-12T10:20:00Z",
      type: "visit"
    },
    {
      serviceId: "srv-2",
      patientCode: "PT-00001",
      orderId: "ord-1002",
      recordId: "rec-2",
      name: "Lab Package",
      qty: 1,
      date: "2026-02-10T11:20:00Z",
      type: "service"
    },
    {
      serviceId: "srv-3",
      patientCode: "PT-00001",
      orderId: "ord-1004",
      recordId: "rec-2s",
      name: "Respiratory Session",
      qty: 2,
      date: "2026-02-09T12:30:00Z",
      type: "session"
    },

    {
      serviceId: "srv-4",
      patientCode: "PT-00002",
      orderId: "ord-2001",
      recordId: "rec-3",
      name: "Physiotherapy Session",
      qty: 3,
      date: "2026-02-11T15:45:00Z",
      type: "session"
    },
    {
      serviceId: "srv-5",
      patientCode: "PT-00002",
      orderId: "ord-2002",
      recordId: "rec-4",
      name: "Nursing Visit",
      qty: 1,
      date: "2026-02-09T13:30:00Z",
      type: "visit"
    },
    {
      serviceId: "srv-6",
      patientCode: "PT-00002",
      orderId: "ord-2004",
      recordId: "",
      name: "Skin Treatment Session",
      qty: 2,
      date: "2026-02-06T12:40:00Z",
      type: "session"
    },

    {
      serviceId: "srv-7",
      patientCode: "PT-00003",
      orderId: "ord-3002",
      recordId: "rec-5",
      name: "General Checkup",
      qty: 1,
      date: "2026-02-05T10:45:00Z",
      type: "service"
    },

    {
      serviceId: "srv-8",
      patientCode: "PT-00004",
      orderId: "ord-4001",
      recordId: "rec-6",
      name: "Post-Surgery Follow-up",
      qty: 1,
      date: "2026-02-12T08:55:00Z",
      type: "visit"
    },
    {
      serviceId: "srv-9",
      patientCode: "PT-00004",
      orderId: "ord-4002",
      recordId: "rec-6s",
      name: "Wound Dressing Session",
      qty: 2,
      date: "2026-02-11T13:15:00Z",
      type: "session"
    }
  ];

  function byPatientCode(arr, patientCode) {
    return arr.filter(function (item) {
      return item.patientCode === patientCode;
    });
  }

  function sumQty(arr) {
    return arr.reduce(function (total, item) {
      return total + (Number(item.qty) || 0);
    }, 0);
  }

  function getStatusCounts(patientOrders) {
    return patientOrders.reduce(
      function (acc, order) {
        if (order.status === "pending") acc.pending += 1;
        if (order.status === "ongoing") acc.ongoing += 1;
        if (order.status === "completed") acc.completed += 1;
        if (order.status === "canceled") acc.canceled += 1;
        return acc;
      },
      { pending: 0, ongoing: 0, completed: 0, canceled: 0 }
    );
  }

  function getPatientByCode(patientCode) {
    return (
      patients.find(function (patient) {
        return patient.patientCode === patientCode;
      }) || null
    );
  }

  function getPatientOrders(patientCode) {
    return byPatientCode(orders, patientCode);
  }

  function getPatientVisits(patientCode) {
    return byPatientCode(visits, patientCode);
  }

  function getPatientMeds(patientCode) {
    return byPatientCode(medications, patientCode);
  }

  function getPatientServices(patientCode) {
    return byPatientCode(services, patientCode);
  }

  function formatMedicationOrderCode(orderNo) {
    var value = (orderNo || "").toString().trim();
    if (!value) return "-";

    var defaultMiddleCode = "12";

    var alreadyThreeParts = value.match(/^(\d{2})-(\d{2})-(\d{6})$/);
    if (alreadyThreeParts) return value;

    var directMatch = value.match(/(\d{2})-OR-(\d{6})$/i);
    if (directMatch) {
      return directMatch[1] + "-" + defaultMiddleCode + "-" + directMatch[2];
    }

    var fallbackMatch = value.match(/(\d{2})\D+(\d{6})$/);
    if (fallbackMatch) {
      return fallbackMatch[1] + "-" + defaultMiddleCode + "-" + fallbackMatch[2];
    }

    var groups = value.match(/\d+/g) || [];
    if (!groups.length) return value;

    var firstGroup = groups[0] || "";
    var lastGroup = groups[groups.length - 1] || "";
    var firstTwo = firstGroup.slice(-2).padStart(2, "0");
    var lastSix = lastGroup.slice(-6).padStart(6, "0");

    return firstTwo + "-" + defaultMiddleCode + "-" + lastSix;
  }

  function getRecordRoute(recordType) {
    return recordType === "session" ? "Session-record.html" : "visit-record.html";
  }

  function getSortedPatientRecords(patientCode) {
    var rank = { visit: 0, session: 1 };

    return getPatientVisits(patientCode)
      .slice()
      .sort(function (a, b) {
        var typeA = rank[a.recordType] != null ? rank[a.recordType] : 99;
        var typeB = rank[b.recordType] != null ? rank[b.recordType] : 99;

        if (typeA !== typeB) return typeA - typeB;

        return new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime();
      });
  }

  function getLastOrderStatus(patientCode) {
    var patientOrders = getPatientOrders(patientCode).slice();
    if (!patientOrders.length) return "pending";

    patientOrders.sort(function (a, b) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return patientOrders[0].status;
  }

  function computeOrderUsage(orderId) {
    var medsQty = medications
      .filter(function (item) {
        return item.orderId === orderId;
      })
      .reduce(function (total, item) {
        return total + (Number(item.qty) || 0);
      }, 0);

    var servicesQty = services
      .filter(function (item) {
        return item.orderId === orderId;
      })
      .reduce(function (total, item) {
        return total + (Number(item.qty) || 0);
      }, 0);

    return { medsQty: medsQty, servicesQty: servicesQty };
  }

  function getPatientLastActivity(patientCode) {
    var timestamps = [];

    getPatientOrders(patientCode).forEach(function (item) {
      timestamps.push(item.createdAt);
    });
    getPatientVisits(patientCode).forEach(function (item) {
      timestamps.push(item.visitDate);
    });
    getPatientMeds(patientCode).forEach(function (item) {
      timestamps.push(item.date);
    });
    getPatientServices(patientCode).forEach(function (item) {
      timestamps.push(item.date);
    });

    if (!timestamps.length) {
      var patient = getPatientByCode(patientCode);
      return patient ? patient.lastActivityAt : "";
    }

    return timestamps
      .map(function (value) {
        return new Date(value).getTime();
      })
      .sort(function (a, b) {
        return b - a;
      })
      .map(function (stamp) {
        return new Date(stamp).toISOString();
      })[0];
  }

  function computePatientKpis(patientCode) {
    var patientOrders = getPatientOrders(patientCode);
    var patientVisits = getPatientVisits(patientCode);
    var patientMeds = getPatientMeds(patientCode);
    var patientServices = getPatientServices(patientCode);

    var counts = getStatusCounts(patientOrders);

    return {
      totalOrders: patientOrders.length,
      pending: counts.pending,
      ongoing: counts.ongoing,
      completed: counts.completed,
      canceled: counts.canceled,
      totalVisits: patientVisits.length,
      totalServices: sumQty(patientServices),
      totalMeds: sumQty(patientMeds),
      lastActivityAt: getPatientLastActivity(patientCode)
    };
  }

  window.NKPatientsData = {
    patients: patients,
    orders: orders,
    visits: visits,
    medications: medications,
    services: services,
    getPatientByCode: getPatientByCode,
    getPatientOrders: getPatientOrders,
    getPatientVisits: getPatientVisits,
    getPatientMeds: getPatientMeds,
    getPatientServices: getPatientServices,
    getSortedPatientRecords: getSortedPatientRecords,
    formatMedicationOrderCode: formatMedicationOrderCode,
    getRecordRoute: getRecordRoute,
    getLastOrderStatus: getLastOrderStatus,
    computeOrderUsage: computeOrderUsage,
    computePatientKpis: computePatientKpis
  };
})();
