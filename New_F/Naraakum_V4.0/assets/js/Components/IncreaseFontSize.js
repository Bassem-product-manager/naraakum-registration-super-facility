 // القيم الافتراضية (ستتأثر أيضًا بـ @media)
      let baseFontSize = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--base-font-size"
        )
      );
      let baseOtherSize = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--base-value"
        )
      );

      // دالة لتحديث المتغيرات
      function updateVariables() {
        document.documentElement.style.setProperty(
          "--base-font-size",
          baseFontSize + "px"
        );
        document.documentElement.style.setProperty(
          "--base-value",
          baseOtherSize + "px"
        );
      }

      // تكبير/تصغير الخطوط
      document.getElementById("fontIncrease").onclick = () => {
        baseFontSize += 2;
        updateVariables();
      };

      document.getElementById("fontDecrease").onclick = () => {
        baseFontSize = Math.max(10, baseFontSize - 2);
        updateVariables();
      };

      // تكبير/تصغير الأبعاد
      document.getElementById("sizeIncrease").onclick = () => {
        baseOtherSize += 2;
        updateVariables();
      };

      document.getElementById("sizeDecrease").onclick = () => {
        baseOtherSize = Math.max(4, baseOtherSize - 2);
        updateVariables();
        
      };

      updateVariables();