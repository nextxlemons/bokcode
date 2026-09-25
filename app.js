"use strict";


const SUPABASE_URL = "https://tcndrqpzbbliqaggcugp.supabase.co";
const SUPABASE_KEY = "sb_publishable_KKSnuY0Eeui0OCyR-FW1rw_Dv8Rh9DY";

const TABLE = "posts";


const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const feedEl = document.getElementById("feed");
const formEl = document.getElementById("postForm");
const submitBtn = document.getElementById("submitBtn");
const toastEl = document.getElementById("toast");

// =====================================================
// UTILITIES
// =====================================================
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function setFeedMessage(message) {
  feedEl.innerHTML = `<p class="hint" style="text-align:center;">${message}</p>`;
}

// =====================================================
// RENDER
// =====================================================
function renderPosts(posts) {
  if (!posts || posts.length === 0) {
    setFeedMessage("No posts yet. Be the first backchod 👀");
    return;
  }

  feedEl.innerHTML = "";

  posts.forEach((post, index) => {
    const el = document.createElement("div");
    el.className = "post";
    el.innerHTML = `
      ${index === 0 ? '<span class="post-tag">NEW</span>' : ""}
      <div class="post-top">
        <span class="post-name">${escapeHTML(post.name)}</span>
        <span class="post-user">${escapeHTML(post.username)}</span>
      </div>
      <p class="post-idea">${escapeHTML(post.idea)}</p>
    `;
    feedEl.appendChild(el);
  });
}

// =====================================================
// DATA
// =====================================================
async function loadPosts() {
  setFeedMessage("Loading the chaos...");

  try {
    const { data, error } = await db
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Supabase load error:", error);
      setFeedMessage("Couldn't load posts. Check your Supabase settings.");
      return;
    }

    renderPosts(data);
  } catch (err) {
    console.error(err);
    setFeedMessage("Something went wrong.");
  }
}

async function submitPost(username, name, idea) {
  const { error } = await db.from(TABLE).insert([{ username, name, idea }]);

  if (error) {
    console.error("Supabase insert error:", error);
    throw error;
  }
}

// =====================================================
// EVENTS
// =====================================================
formEl.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const name = document.getElementById("name").value.trim();
  const idea = document.getElementById("idea").value.trim();

  if (!username || !name || !idea) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Posting...";

  try {
    await submitPost(username, name, idea);
    formEl.reset();
    showToast("Posted! Sab ko pata chal gaya 👀");
    await loadPosts();
    feedEl.scrollTop = 0;
  } catch (err) {
    showToast("Oops, couldn't post. Try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Post It 🚀";
  }
});

// Live updates: when anyone inserts a new post, refresh the feed
// for everyone currently viewing the page.
db.channel("public:posts")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: TABLE },
    () => loadPosts()
  )
  .subscribe();

// Initial load
loadPosts();