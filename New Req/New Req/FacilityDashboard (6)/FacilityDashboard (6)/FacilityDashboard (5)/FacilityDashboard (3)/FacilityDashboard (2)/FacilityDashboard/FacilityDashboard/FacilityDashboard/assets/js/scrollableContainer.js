  const containers = document.querySelectorAll(".scrollable-container");

      containers.forEach((scrollContainer) => {
        let isDown = false;
        let startX;
        let scrollLeft;
        const speedMultiplier = 1.8;

        scrollContainer.addEventListener("mousedown", (e) => {
          isDown = true;
          scrollContainer.classList.add("active");
          startX = e.pageX - scrollContainer.offsetLeft;
          scrollLeft = scrollContainer.scrollLeft;
          scrollContainer.style.cursor = "grabbing";
        });

        scrollContainer.addEventListener("mouseleave", () => {
          isDown = false;
          scrollContainer.style.cursor = "grab";
        });

        scrollContainer.addEventListener("mouseup", () => {
          isDown = false;
          scrollContainer.style.cursor = "grab";
        });

        scrollContainer.addEventListener("mousemove", (e) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX - scrollContainer.offsetLeft;
          const walk = (x - startX) * speedMultiplier;
          scrollContainer.scrollLeft = scrollLeft - walk;
        });

        // -----
        let touchStartX = 0;
        let touchScrollLeft = 0;

        scrollContainer.addEventListener("touchstart", (e) => {
          touchStartX = e.touches[0].pageX;
          touchScrollLeft = scrollContainer.scrollLeft;
        });

        scrollContainer.addEventListener("touchmove", (e) => {
          const x = e.touches[0].pageX;
          const walk = (x - touchStartX) * speedMultiplier;
          scrollContainer.scrollLeft = touchScrollLeft - walk;
        });
      });