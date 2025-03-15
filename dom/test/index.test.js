import { beforeEach, describe, expect, it } from "vitest";
import dom from "../src/index.js";

describe("@m5nv/dom API", () => {
  let container;
  beforeEach(() => {
    document.body.innerHTML = `<div id="container">
      <div class="item">Item 1</div>
      <div class="item">Item 2</div>
    </div>`;
    container = document.getElementById("container");
  });

  it("selects an element by id", () => {
    const $container = dom("#container");
    expect($container.els.length).toBe(1);
    expect($container.els[0]).toBe(container);
  });

  it("adds and removes classes", () => {
    const $items = dom(".item");
    $items.addClass("active");
    $items.els.forEach((el) => {
      expect(el.classList.contains("active")).toBe(true);
    });
    $items.removeClass("active");
    $items.els.forEach((el) => {
      expect(el.classList.contains("active")).toBe(false);
    });
  });

  it("toggles classes", () => {
    const $item = dom(".item").els[0];
    const $wrapped = dom($item);
    // Initially, no 'highlight' class.
    expect($wrapped.hasClass("highlight")).toBe(false);
    // Toggle on
    $wrapped.toggleClass("highlight");
    expect($wrapped.hasClass("highlight")).toBe(true);
    // Toggle off
    $wrapped.toggleClass("highlight");
    expect($wrapped.hasClass("highlight")).toBe(false);
  });

  it("gets and sets attributes", () => {
    const $item = dom(".item").els[0];
    const $wrapped = dom($item);
    $wrapped.attr("data-test", "value");
    expect($item.getAttribute("data-test")).toBe("value");
    expect($wrapped.attr("data-test")).toBe("value");
  });

  it("binds events", () => {
    const $item = dom(".item").els[0];
    let clicked = false;
    const handler = () => {
      clicked = true;
    };
    dom($item).on("click", handler);
    $item.click();
    expect(clicked).toBe(true);
  });

  it("traverses DOM using find, parent, next, and closest", () => {
    document.body.innerHTML = `<div id="wrapper">
      <ul>
        <li class="menu-item">One</li>
        <li class="menu-item">Two</li>
      </ul>
    </div>`;
    const $wrapper = dom("#wrapper");
    const $menuItems = $wrapper.find(".menu-item");
    expect($menuItems.els.length).toBe(2);
    const firstItem = $menuItems.els[0];

    // Test parent method
    const parent = dom(firstItem).parent().els[0];
    expect(parent.tagName).toBe("UL");

    // Test next method
    const nextItem = dom(firstItem).next().els[0];
    expect(nextItem.textContent).toBe("Two");

    // Test closest method
    const $closest = dom(firstItem).closest("#wrapper");
    expect($closest.els[0].id).toBe("wrapper");
  });
});
