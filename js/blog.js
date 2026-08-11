/* ============================================================
   js/blog.js · 博客列表与文章渲染
   - 列表页（body[data-page=blog]）：渲染 posts/index.json 全部文章
   - 主页（#blog-cards 容器）：渲染前 3 篇
   - 文章页（body[data-page=post]）：?p=slug → fetch posts/slug.md
     → 解析 front matter → marked 渲染 → DOMPurify 消毒 → 注入
   ============================================================ */
(function () {
  "use strict";

  var page = document.body.dataset.page || "";

  /* ---------- 通用：文章卡片 HTML ---------- */
  function cardHtml(post) {
    var tags = (post.tags || []).map(function (t) {
      return '<li>' + escapeHtml(t) + '</li>';
    }).join("");
    return (
      '<article class="blog-card">' +
        '<h3 class="blog-card__title"><a href="post.html?p=' + encodeURIComponent(post.slug) + '">' +
          escapeHtml(post.title) +
        '</a></h3>' +
        '<p class="blog-card__date">' + escapeHtml(post.date) + '</p>' +
        '<p class="blog-card__summary">' + escapeHtml(post.summary || "") + '</p>' +
        '<ul class="blog-card__tags">' + tags + '</ul>' +
      '</article>'
    );
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ---------- 列表渲染 ---------- */
  function renderList(container, limit) {
    fetch("posts/index.json")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (posts) {
        if (!Array.isArray(posts) || posts.length === 0) {
          container.innerHTML = '<p class="blog-empty">还没有文章，敬请期待。</p>';
          return;
        }
        // 按日期倒序（新 → 旧）
        var sorted = posts.slice().sort(function (a, b) {
          return String(b.date).localeCompare(String(a.date));
        });
        var items = limit ? sorted.slice(0, limit) : sorted;
        container.innerHTML = items.map(cardHtml).join("");
        // 动态渲染的卡片接入滚动渐显（main.js 暴露的钩子）
        if (window.__initReveal) {
          window.__initReveal(container.querySelectorAll(".blog-card"));
        }
      })
      .catch(function () {
        container.innerHTML =
          '<p class="blog-error">文章加载失败，请通过本地 HTTP 服务器访问（file:// 下无法读取数据）。</p>';
      });
  }

  /* ---------- front matter 解析 ---------- */
  function parseFrontMatter(text) {
    var m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
    if (!m) return { data: {}, content: text };
    var yaml = m[1];
    var content = m[2];
    var data = {};

    function pick(key) {
      var re = new RegExp("^" + key + ":\\s*(.+)$", "m");
      var r = re.exec(yaml);
      return r ? r[1].trim() : "";
    }

    data.title = pick("title");
    data.date = pick("date");
    data.summary = pick("summary");

    var tagsRe = /^tags:\s*\[([^\]]*)\]/m.exec(yaml);
    if (tagsRe) {
      data.tags = tagsRe[1].split(",").map(function (t) { return t.trim(); }).filter(Boolean);
    } else {
      data.tags = [];
    }
    return { data: data, content: content };
  }

  /* ---------- 文章渲染 ---------- */
  function renderPost(container) {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get("p") || "";

    // slug 白名单校验：仅小写字母/数字/连字符，防路径穿越
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
      container.innerHTML =
        '<div class="post-not-found"><p>文章不存在。</p>' +
        '<p><a href="blog.html">← 返回文章列表</a></p></div>';
      return;
    }

    if (typeof marked === "undefined" || typeof DOMPurify === "undefined") {
      container.innerHTML =
        '<div class="post-not-found"><p>渲染库加载失败，请检查 js/vendor/ 下的 marked.min.js 与 purify.min.js。</p></div>';
      return;
    }

    fetch("posts/" + encodeURIComponent(slug) + ".md")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (text) {
        // 兼容带 UTF-8 BOM 的 .md 文件（Windows 编辑器常见）
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.slice(1);
        }
        var fm = parseFrontMatter(text);
        var title = fm.data.title || slug;
        var date = fm.data.date || "";
        var tags = (fm.data.tags || []).map(function (t) {
          return '<span class="tag-inline">' + escapeHtml(t) + '</span>';
        }).join(" ");

        var html = marked.parse(fm.content);
        html = DOMPurify.sanitize(html);

        container.innerHTML =
          '<h1 class="post__title">' + escapeHtml(title) + '</h1>' +
          '<p class="post__meta">' + escapeHtml(date) + ' · ' + tags + '</p>' +
          '<div class="post__body">' + html + '</div>';

        document.title = title + " · 赵瑞翔";
      })
      .catch(function () {
        container.innerHTML =
          '<div class="post-not-found"><p>文章不存在。</p>' +
          '<p><a href="blog.html">← 返回文章列表</a></p></div>';
      });
  }

  /* ---------- 入口 ---------- */
  if (page === "post") {
    renderPost(document.getElementById("post-container"));
  } else {
    var homeList = document.getElementById("blog-cards");
    if (homeList) {
      renderList(homeList, 3); // 主页：最新 3 篇
    }
    var blogList = document.getElementById("blog-list");
    if (blogList) {
      renderList(blogList); // 列表页：全部
    }
  }
})();
