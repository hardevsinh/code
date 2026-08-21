"use strict";

// Requires marked.js to be loaded before this script (see index.html changes)

const blogListEl = document.querySelector(".blog-posts-list");
const blogArticleEl = document.querySelector('article[data-page="blog"]');
let postDetailEl;
let allPosts = [];

async function loadPosts() {
  if (!blogListEl) return;
  try {
    const res = await fetch("./posts/posts.json");
    allPosts = await res.json();
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderList(allPosts);
  } catch (err) {
    console.error("Could not load posts.json", err);
  }
}

function renderList(posts) {
  blogListEl.innerHTML = posts
    .map(
      (post) => `
    <li class="blog-post-item">
      <a href="#" data-slug="${post.slug}">
        <figure class="blog-banner-box">
          <img src="${post.image}" alt="${post.title}" loading="lazy">
        </figure>
        <div class="blog-content">
          <div class="blog-meta">
            <p class="blog-category">${post.category}</p>
            <span class="dot"></span>
            <time datetime="${post.date}">${formatDate(post.date)}</time>
          </div>
          <h3 class="h3 blog-item-title">${post.title}</h3>
          <p class="blog-text">${post.excerpt}</p>
        </div>
      </a>
    </li>`
    )
    .join("");

  blogListEl.querySelectorAll("a[data-slug]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      openPost(link.dataset.slug);
    });
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function openPost(slug) {
  const meta = allPosts.find((p) => p.slug === slug);
  if (!meta) return;
  try {
    const res = await fetch(`./posts/${slug}.md`);
    const md = await res.text();
    const html = marked.parse(md);

    ensurePostDetail();
    postDetailEl.innerHTML = `
      <header>
        <button class="modal-close-btn" id="close-post" style="position:static; margin-bottom: 20px;">
          <ion-icon name="arrow-back-outline"></ion-icon>
        </button>
        <h2 class="h2 article-title">${meta.title}</h2>
        <div class="blog-meta">
          <p class="blog-category">${meta.category}</p>
          <span class="dot"></span>
          <time datetime="${meta.date}">${formatDate(meta.date)}</time>
        </div>
      </header>
      <div class="post-body">${html}</div>
    `;

    document.querySelectorAll("article[data-page]").forEach((a) => a.classList.remove("active"));
    postDetailEl.classList.add("active");
    document.getElementById("close-post").addEventListener("click", closePost);
    window.scrollTo(0, 0);
  } catch (err) {
    console.error("Could not load post file for slug:", slug, err);
  }
}

function ensurePostDetail() {
  if (postDetailEl) return;
  postDetailEl = document.createElement("article");
  postDetailEl.className = "post-detail";
  postDetailEl.setAttribute("data-page", "post-detail");
  document.querySelector(".main-content").appendChild(postDetailEl);
}

function closePost() {
  postDetailEl.classList.remove("active");
  blogArticleEl.classList.add("active");
}

loadPosts();
