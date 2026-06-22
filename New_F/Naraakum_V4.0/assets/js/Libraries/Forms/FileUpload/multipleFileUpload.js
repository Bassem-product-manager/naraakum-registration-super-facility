$(document).ready(function () {
  $(".edit-img").hide();
  /*upload multiple images function*/
  function readURLl(upload_input_file) {
    if (upload_input_file.files && upload_input_file.files[0]) {
      $(upload_input_file.files).each(function () {
        var reader = new FileReader();
        reader.readAsDataURL(this);

        reader.onload = function (e) {
          var span = document.createElement("span");

          span.innerHTML = [
            '<img class="thumb" src="',
            e.target.result,
            '"/><span class="remove_img_preview"></span>',
          ].join("");

          $(upload_input_file)
            .parents(".master-parent")
            .find(".uploaded-container")
            .append(span);
        };
      });
    }

    $(".single-image").slideToggle();
  }

  $(".upload-button input").show(function () {
    $(this).change(function () {
      readURLl(this);
    });
  });

  $(".uploaded-container").on("click", ".remove_img_preview", function () {
    $(this).parent("span").remove();
    $(".single-image").slideToggle();
    var i = array.indexOf($(this));
    if (i !== -1) {
      array.splice(i, 1);
    }
  });
});
