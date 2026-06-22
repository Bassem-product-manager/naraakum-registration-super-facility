


function moveFocus(event, index) {
  const inputs = document.querySelectorAll(".digit-input");
  const currentInput = inputs[index];

  // عند إدخال رقم
  if (currentInput.value.length === 1) {
    if (index + 1 < inputs.length) {
      inputs[index + 1].disabled = false;
      inputs[index + 1].focus();
    }
  }

  // عند الحذف
  if (currentInput.value.length === 0) {
    if (index > 0) {
      inputs[index].disabled = true;
      inputs[index - 1].focus();
    }
  }
}


/*/*/


 const resendBtn = document.getElementById("resendOtpBtn");
  let timeLeft = 30;

  const countdown = setInterval(() => {
    timeLeft--;
    resendBtn.textContent = `يمكنك إعادة إرسال رمز جديد بعد ${timeLeft} ثانية`;

    if (timeLeft <= 0) {
      clearInterval(countdown);
      resendBtn.disabled = false;
      resendBtn.textContent = "إعادة إرسال الرمز";
    }
  }, 1000);

  resendBtn.addEventListener("click", () => {
    // هنا تضع كود إرسال الرمز (API مثلاً)
 

    // إعادة تشغيل العدّاد
    resendBtn.disabled = true;
    timeLeft = 30;
    resendBtn.textContent = `يمكنك إعادة إرسال رمز جديد بعد ${timeLeft} ثانية`;

    const newCountdown = setInterval(() => {
      timeLeft--;
      resendBtn.textContent = `يمكنك إعادة إرسال رمز جديد بعد ${timeLeft} ثانية`;

      if (timeLeft <= 0) {
        clearInterval(newCountdown);
        resendBtn.disabled = false;
        resendBtn.textContent = "إعادة إرسال الرمز";
      }
    }, 1000);
  });

 