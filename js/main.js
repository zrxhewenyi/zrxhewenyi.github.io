/* ============================================================
   js/main.js · 全站交互
   1. 汉堡菜单（移动端展开/收起，点击链接自动收起）
   2. 导航当前区块高亮（IntersectionObserver）
   3. 区块滚动进入视口淡入上移（.reveal）
   4. 回到顶部按钮（滚动超过一屏后右下角淡入）
   5. 键盘 Esc 关闭菜单
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 1. 汉堡菜单 ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("nav-links");

  function closeMenu() {
    if (!toggle || !links) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "打开菜单");
    links.classList.remove("is-open");
  }

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
      // 焦点管理：展开时聚焦首个菜单项，收起时焦点还给按钮
      if (open) {
        var first = links.querySelector("a");
        if (first) first.focus();
      } else {
        toggle.focus();
      }
    });

    // 点击导航链接后自动收起（移动端）
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  /* ---------- 2. 导航当前区块高亮 ---------- */
  var navAnchors = Array.prototype.slice.call(
    document.querySelectorAll('.nav__links a[href^="#"]')
  );

  function sectionId(hash) {
    return hash.replace(/^#/, "");
  }

  if (navAnchors.length && "IntersectionObserver" in window) {
    var sections = navAnchors
      .map(function (a) { return document.getElementById(sectionId(a.getAttribute("href"))); })
      .filter(Boolean);

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          navAnchors.forEach(function (a) {
            a.classList.toggle("is-active", sectionId(a.getAttribute("href")) === id);
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 3. 滚动逐项渐显（stagger） ---------- */
  // 参与渐显的元素：区块标题、网格卡片、时间线/荣誉/联系列表项、关于我文本与统计卡
  // （.blog-loading 等占位提示不参与，避免被隐藏）
  var staggerSel = [
    ".section__title",
    ".grid > *:not(.blog-loading):not(.blog-error):not(.blog-empty)",
    ".block",
    ".news__item",
    ".edu",
    ".tech__group",
    ".honors__item",
    ".about__text",
    ".about__stat",
    ".contact__item",
    ".page-head"
  ].join(", ");

  var reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * 对一组元素启用 stagger 渐显（设置 --d 延迟 + 观察）。
   * 双向观察：元素离开视口时收回特效，再次进入时重新触发，
   * 保证从上往下、从下往上、反复滚动都有渐显效果。
   * 暴露为 window.__initReveal，供 blog.js 渲染完动态卡片后调用。
   */
  function setupReveal(elements) {
    if (!("IntersectionObserver" in window) || reducedMotion) return;

    elements.forEach(function (el) {
      var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty("--d", Math.min(idx * 70, 420) + "ms");
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
  }

  var revealObserver = "IntersectionObserver" in window && !reducedMotion
    ? new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            // 不 unobserve：每次进出视口都切换状态，动画可反复触发
            entry.target.classList.toggle("is-visible", entry.isIntersecting);
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      )
    : null;

  // 供 blog.js 渲染完动态列表后调用
  window.__initReveal = setupReveal;

  setupReveal(document.querySelectorAll(staggerSel));

  /* ---------- 4. 回到顶部 ---------- */
  var toTop = document.querySelector(".to-top");

  if (toTop) {
    var onScroll = function () {
      var show = window.scrollY > window.innerHeight;
      toTop.hidden = !show;
      toTop.classList.toggle("is-visible", show);
    };

    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // 用 passive listener 避免阻塞滚动
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
