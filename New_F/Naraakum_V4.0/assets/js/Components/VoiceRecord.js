document
  .getElementById("startRecording")
  .addEventListener("click", initFunction);

function initFunction() {
  // Display recording
  async function getUserMedia(constraints) {
    if (window.navigator.mediaDevices) {
      return window.navigator.mediaDevices.getUserMedia(constraints);
    }

    let legacyApi =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    if (legacyApi) {
      return new Promise(function (resolve, reject) {
        legacyApi.bind(window.navigator)(constraints, resolve, reject);
      });
    } else {
      alert("user api not supported");
    }
  }

  //------------------------------

  this.style.display = "none";
  document.getElementById("stopRecording").style.display = "block";
  document.getElementById("isRecording").style.display = "block";

  //------------------------------

  let audioChunks = [];
  let rec;

  function handlerFunction(stream) {
    rec = new MediaRecorder(stream);
    rec.start();
    rec.ondataavailable = (e) => {
      audioChunks.push(e.data);
      if (rec.state == "inactive") {
        let blob = new Blob(audioChunks, { type: "audio/mp3" });
        console.log(blob);
        document.getElementById("audioElement").src = URL.createObjectURL(blob);
      }
    };
  }

  function startusingBrowserMicrophone(boolean) {
    getUserMedia({ audio: boolean }).then((stream) => {
      handlerFunction(stream);
    });
  }

  startusingBrowserMicrophone(true);

  // Stoping handler
  document.getElementById("stopRecording").addEventListener("click", (e) => {
    rec.stop();

    document.getElementById("audioElement").style.opacity = "1";
    document.getElementById("stopRecording").style.display = "none";
    document.getElementById("startRecording").style.display = "none";
    document.getElementById("removeRecording").style.display = "block";
    document.getElementById("playRecording").style.display = "block";
    document.getElementById("isRecording").style.display = "none";
  });

  // remove handler
  document.getElementById("removeRecording").addEventListener("click", (e) => {
    document.getElementById("audioElement").src = "";
    document.getElementById("removeRecording").style.display = "none";
    document.getElementById("startRecording").style.display = "block";
    document.getElementById("audioElement").style.opacity = "0.5";
    document.getElementById("playRecording").style.display = "none";
  });
  // play handler
  document.getElementById("playRecording").addEventListener("click", (e) => {
    document.getElementById("audioElement").play();
  });
}
