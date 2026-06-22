$(document).ready(function () {
  $(".textEditor").summernote({
    placeholder: "Enter...",
    height: 300,
    direction: "ltr",
    toolbar: [
      ["style", ["style"]], // لعناوين H1, H2, H3 ...
      ["font", ["bold", "italic", "underline", "clear"]],
      ["fontname", ["fontname"]], // اختيار الخط
      ["para", ["ul", "ol", "paragraph"]],
      ["insert", ["link", "picture", "video"]],
      ["view", ["fullscreennn", "codeview", "help"]],
    ],
    styleTags: ["p", "h1", "h2", "h3", "h4", "h5", "h6"], // عناوين قابلة للاختيار

    fontNames: [
      "Poppins",
      "Arial",
      "Arial Black",
      "Comic Sans MS",
      "Courier New",
      "Tahoma",
      "Times New Roman",
      "Verdana",
    ],
  });
});
