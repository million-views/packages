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

  describe("Deep DOM Navigation", () => {
    beforeEach(() => {
      // Reset document for each test.
      document.body.innerHTML = `
        <div id="grandparent">
          <div id="parent">
            <div id="child">
              <span id="target">Hello</span>
            </div>
            <div id="sibling">Sibling</div>
          </div>
        </div>
      `;
    });

    it("closest() returns the nearest matching ancestor", () => {
      const $target = dom("#target");
      // Look for the closest element with id "parent"
      const $closestParent = $target.closest("#parent");
      expect($closestParent.els.length).toBe(1);
      expect($closestParent.els[0].id).toBe("parent");

      // Look for the closest element with id "grandparent"
      const $closestGrandparent = $target.closest("#grandparent");
      expect($closestGrandparent.els.length).toBe(1);
      expect($closestGrandparent.els[0].id).toBe("grandparent");
    });

    it("parent() returns the immediate parent", () => {
      const $target = dom("#target");
      // The immediate parent of <span id="target"> is the <div id="child">
      const $parent = $target.parent();
      expect($parent.els.length).toBe(1);
      expect($parent.els[0].id).toBe("child");
    });

    it("next() returns the next sibling element", () => {
      // Create a simple sibling structure
      document.body.innerHTML = `
        <div id="container">
          <p id="first">First</p>
          <p id="second">Second</p>
          <p id="third">Third</p>
        </div>
      `;
      const $first = dom("#first");
      const $next = $first.next();
      expect($next.els.length).toBe(1);
      expect($next.els[0].id).toBe("second");
    });

    it("combines navigation methods for deep traversal", () => {
      // Starting from the target, navigate up then find a sibling.
      const $target = dom("#target");
      // $target.parent() returns the immediate parent (child)
      // Calling parent() again on that returns its parent (parent)
      const $childParent = $target.parent();
      const $parent = $childParent.parent();
      // Now, find the sibling element of the #child inside #parent.
      const $sibling = $parent.find("#sibling");
      expect($sibling.els.length).toBe(1);
      expect($sibling.els[0].id).toBe("sibling");
    });
  });
});
