 const platforms = [
        "facebook",
        "twitter",
        "instagram",
        "tiktok",
        "snapchat",
      ];

      platforms.forEach((platform) => {
        const checkbox = document.getElementById(`${platform}Check`);
        const urlContainer = document.getElementById(`${platform}UrlContainer`);

        checkbox.addEventListener("change", () => {
          urlContainer.style.display = checkbox.checked ? "block" : "none";
        });

        // Show URL input if checkbox is already checked on page load
        if (checkbox.checked) {
          urlContainer.style.display = "block";
        }
      });