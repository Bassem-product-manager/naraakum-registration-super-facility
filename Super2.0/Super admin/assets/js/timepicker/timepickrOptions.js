function getCurrentTimeFormatted() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const ampm = hours >= 12 ? "مساءً" : "صباحًا";

  hours = hours % 12;
  hours = hours ? hours : 12;  

  const formattedTime =
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0") +
    " " +
    ampm;

  return formattedTime;
}

 
document.querySelectorAll(".timeInput").forEach(function (input) {
  
  input.value = getCurrentTimeFormatted();

  flatpickr(input, {
    enableTime: true,
    noCalendar: true,
    dateFormat: "h:i:S K", // h = ساعة 12، i = دقيقة، S = ثانية، K = AM/PM
    time_24hr: false,
    enableSeconds: true,
    defaultDate: new Date(),  
    onChange: function (selectedDates, dateStr, instance) {
      const amPm = dateStr.includes("AM") ? "صباحًا" : "مساءً";
      const timeOnly = dateStr.replace("AM", "").replace("PM", "").trim();
      instance.input.value = timeOnly + " " + amPm;
    },
  });
});
