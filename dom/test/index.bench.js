import { bench, describe } from "vitest";
import dom from "../src/index.js";
const imax = 100000;

describe("Benchmarking @m5nv/dom", () => {
  describe("0. Warmup", () => {
    document.body.innerHTML = `<div id="container"></div>`;

    bench("dom (#container) using @m5nv/dom", () => {
      for (let i = 0; i < imax; i++) {
        dom("#container");
      }
    });

    bench("native querySelector (#container)", () => {
      for (let i = 0; i < imax; i++) {
        document.querySelector("#container");
      }
    });
  });
  describe("Comprehensive", () => {
    document.body.innerHTML = `
      <div id="container">
        <div class="item">Item 1</div>
        <div class="item">Item 2</div>
        <div class="item">Item 3</div>
      </div>
    `;

    describe("1. Select by ID", () => {
      bench("using @m5nv/dom", () => {
        for (let i = 0; i < imax; i++) {
          dom("#container");
        }
      });

      bench("using native querySelector", () => {
        for (let i = 0; i < imax; i++) {
          document.querySelector("#container");
        }
      });
    });
    describe("2. Select by Class", () => {
      bench("using @m5nv/dom", () => {
        for (let i = 0; i < imax; i++) {
          dom(".item");
        }
      });

      bench("using native querySelectorAll", () => {
        for (let i = 0; i < imax; i++) {
          document.querySelectorAll(".item");
        }
      });
    });
    describe("3. Class Manipulation (addClass)", () => {
      const $items = dom(".item");
      bench("using @m5nv/dom", () => {
        $items.addClass("active");
      });

      bench("using native classList", () => {
        const items = document.querySelectorAll(".item");
        items.forEach((item) => item.classList.add("active"));
      });
    });
    describe("4. DOM Traversal (find)", () => {
      bench("children using @m5nv/dom", () => {
        const container = dom("#container");
        container.find(".item");
      });

      bench("children using native querySelectorAll", () => {
        const container = document.querySelector("#container");
        container.querySelectorAll(".item");
      });
    });
    describe("5. Event Binding", () => {
      bench("using @m5nv/dom", () => {
        const container = dom("#container");
        container.on("click", () => {});
      });

      bench("using native addEventListener", () => {
        const container = document.querySelector("#container");
        container.addEventListener("click", () => {});
      });
    });
    describe("6. Toggle Class", () => {
      const $item = dom(".item").els[0];
      bench("using @m5nv/dom (toggleClass)", () => {
        const $wrapped = dom($item);
        $wrapped.toggleClass("active");
      });
      bench("using native classList.toggle", () => {
        const item = document.querySelector(".item");
        item.classList.toggle("active");
      });
    });
    describe("7. Has Class", () => {
      const $item = dom(".item").els[0];
      bench("using @m5nv/dom (hasClass)", () => {
        const _ = dom($item).hasClass("item");
      });
      bench("using native classList.contains", () => {
        const item = document.querySelector(".item");
        const _ = item.classList.contains("item");
      });
    });
  });
});
