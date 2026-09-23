// ==========================================
// SUPABASE CONFIG
// ==========================================



const SUPABASE_URL = "https://tcndrqpzbbliqaggcugp.supabase.co";

const SUPABASE_KEY = "sb_publishable_KKSnuY0Eeui0OCyR-FW1rw_Dv8Rh9DY";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



// ==========================================
// VARIABLES
// ==========================================

let selectedCategory = "thought";
let selectedFilter = "all";


// ==========================================
// DOM ELEMENTS
// ==========================================

const createSection = document.getElementById("createSection");
const postContent = document.getElementById("postContent");
const submitBtn = document.getElementById("submitBtn");
const postsContainer = document.getElementById("postsContainer");
const characterCount = document.getElementById("characterCount");
const formMessage = document.getElementById("formMessage");


// ==========================================
// OPEN CREATE FORM
// ==========================================

document.getElementById("writeBtn").addEventListener("click", openForm);

document.getElementById("heroWriteBtn").addEventListener("click", openForm);


function openForm() {

    createSection.classList.remove("hidden");

    postContent.focus();

    createSection.scrollIntoView({
        behavior: "smooth"
    });
}


// ==========================================
// CLOSE FORM
// ==========================================

document.getElementById("closeBtn").addEventListener("click", () => {

    createSection.classList.add("hidden");

});


// ==========================================
// CHARACTER COUNTER
// ==========================================

postContent.addEventListener("input", () => {

    const length = postContent.value.length;

    characterCount.textContent = `${length} / 1000`;

});


// ==========================================
// CATEGORY SELECTION
// ==========================================

document.querySelectorAll(".category").forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelectorAll(".category")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        selectedCategory = button.dataset.category;

    });

});


// ==========================================
// CREATE POST
// ==========================================

submitBtn.addEventListener("click", createPost);


async function createPost() {

    const content = postContent.value.trim();

    if (!content) {

        showMessage(
            "Write something first.",
            true
        );

        return;
    }

    if (content.length > 1000) {

        showMessage(
            "Your post is too long.",
            true
        );

        return;
    }


    submitBtn.disabled = true;
    submitBtn.textContent = "Posting...";


    const { error } = await supabaseClient
        .from("posts")
        .insert({
            content: content,
            category: selectedCategory
        });


    if (error) {

        console.error(error);

        showMessage(
            "Something went wrong. Try again.",
            true
        );

        submitBtn.disabled = false;
        submitBtn.textContent = "Post anonymously";

        return;
    }


    // Reset form

    postContent.value = "";

    characterCount.textContent = "0 / 1000";

    showMessage(
        "Posted anonymously.",
        false
    );


    submitBtn.disabled = false;
    submitBtn.textContent = "Post anonymously";


    // Reload feed

    await loadPosts();


    // Hide form after posting

    setTimeout(() => {

        createSection.classList.add("hidden");

        formMessage.textContent = "";

    }, 1000);
}


// ==========================================
// LOAD POSTS
// ==========================================

async function loadPosts() {

    postsContainer.innerHTML = `
        <div class="loading">
            Loading thoughts...
        </div>
    `;


    let query = supabaseClient
        .from("posts")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    // Apply filter

    if (selectedFilter !== "all") {

        query = query.eq(
            "category",
            selectedFilter
        );

    }


    const { data, error } = await query;


    if (error) {

        console.error(error);

        postsContainer.innerHTML = `
            <div class="empty">
                Could not load posts.
            </div>
        `;

        return;
    }


    if (!data || data.length === 0) {

        postsContainer.innerHTML = `
            <div class="empty">
                No posts yet.
            </div>
        `;

        return;
    }


    renderPosts(data);
}


// ==========================================
// RENDER POSTS
// ==========================================

function renderPosts(posts) {

    postsContainer.innerHTML = "";


    posts.forEach(post => {

        const card = document.createElement("article");

        card.className = "post-card";


        const date = new Date(
            post.created_at
        ).toLocaleString();


        card.innerHTML = `
            <div class="post-top">

                <span class="post-category">
                    ${escapeHTML(post.category)}
                </span>

                <span class="post-date">
                    ${date}
                </span>

            </div>


            <div class="post-content">
                ${escapeHTML(post.content)}
            </div>


            <div class="post-bottom">

                <button
                    class="like-button"
                    data-id="${post.id}">
                    ♡ ${post.likes_count}
                </button>

            </div>
        `;


        postsContainer.appendChild(card);

    });


    // Like buttons

    document
        .querySelectorAll(".like-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => likePost(button.dataset.id)
            );

        });
}


// ==========================================
// LIKE POST
// ==========================================

async function likePost(postId) {

    const { data, error } = await supabaseClient
        .from("posts")
        .select("likes_count")
        .eq("id", postId)
        .single();


    if (error) {

        console.error(error);

        return;
    }


    const newCount =
        (data.likes_count || 0) + 1;


    const { error: updateError } =
        await supabaseClient
            .from("posts")
            .update({
                likes_count: newCount
            })
            .eq("id", postId);


    if (updateError) {

        console.error(updateError);

        return;
    }


    loadPosts();
}


// ==========================================
// FILTERS
// ==========================================

document.querySelectorAll(".filter").forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelectorAll(".filter")
            .forEach(btn =>
                btn.classList.remove("active")
            );


        button.classList.add("active");


        selectedFilter =
            button.dataset.filter;


        loadPosts();

    });

});


// ==========================================
// MESSAGE
// ==========================================

function showMessage(message, error) {

    formMessage.textContent = message;

    formMessage.style.color =
        error ? "#d33" : "#198754";

}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// ==========================================
// INITIAL LOAD
// ==========================================

loadPosts();