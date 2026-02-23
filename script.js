console.log("Ultimate Mobile Gallery Running");

const gallery = document.getElementById("gallery");
const modal = document.getElementById("modal");
const modalImage = document.getElementById("modalImage");
const closeModal = document.getElementById("closeModal");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const downloadBtn = document.getElementById("downloadBtn");
const imageDetails = document.getElementById("imageDetails");
const modalTitle = document.getElementById("modalTitle");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const themeToggle = document.getElementById("themeToggle");

let images = [];
let activeImages = [];
let currentIndex = 0;
let multiSelectMode = false;
let selectedImages = [];
let lastTap = 0;

/* ================= FETCH ================= */

async function fetchImages() {
  const res = await fetch("https://picsum.photos/v2/list?page=1&limit=20");
  const data = await res.json();

  images = data.map(item => ({
    id: Number(item.id),
    url: `https://picsum.photos/id/${item.id}/900/700`,
    title: item.author,
    category: Number(item.id) % 2 === 0 ? "nature" : "cars",
    date: "2026"
  }));

  renderImages(images);
}
fetchImages();

/* ================= RENDER ================= */

function renderImages(data) {
  gallery.innerHTML = "";
  activeImages = data;

  if (data.length === 0) {
    gallery.innerHTML = "<h2>No Images Found</h2>";
    return;
  }

  data.forEach(image => {
    const card = document.createElement("div");
    card.classList.add("card");

    const img = document.createElement("img");
    img.src = image.url;
    img.dataset.id = image.id;

    img.addEventListener("click", e => {
      if (multiSelectMode) {
        toggleSelect(image.id, card);
      } else {
        currentIndex = activeImages.findIndex(i => i.id === image.id);
        openModal();
      }
    });

    card.appendChild(img);
    gallery.appendChild(card);
  });
}

/* ================= MULTI SELECT ================= */

function toggleSelect(id, card) {
  if (selectedImages.includes(id)) {
    selectedImages = selectedImages.filter(i => i !== id);
    card.classList.remove("selected");
  } else {
    selectedImages.push(id);
    card.classList.add("selected");
  }
}

/* ================= MODAL ================= */

function openModal() {
  modal.style.display = "flex";
  updateModal();
}

function updateModal() {
  const img = activeImages[currentIndex];
  modalImage.classList.remove("slide");
  void modalImage.offsetWidth;
  modalImage.classList.add("slide");

  modalImage.src = img.url;
  modalTitle.textContent = img.title;

  imageDetails.innerHTML = `
    <p>${img.category}</p>
    <p>${img.date}</p>
  `;
}

closeModal.addEventListener("click", () => modal.style.display = "none");

/* ================= NEXT / PREV ================= */

function nextImage() {
  currentIndex++;
  if (currentIndex >= activeImages.length) currentIndex = 0;
  updateModal();
}

function prevImage() {
  currentIndex--;
  if (currentIndex < 0) currentIndex = activeImages.length - 1;
  updateModal();
}

nextBtn.addEventListener("click", nextImage);
prevBtn.addEventListener("click", prevImage);

/* ================= SWIPE ================= */

let startX = 0;

modalImage.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

modalImage.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].clientX;
  if (startX - endX > 50) nextImage();
  if (endX - startX > 50) prevImage();
});

/* ================= DOUBLE TAP ZOOM ================= */

modalImage.addEventListener("click", () => {
  const now = new Date().getTime();
  if (now - lastTap < 300) {
    modalImage.classList.toggle("zoomed");
  }
  lastTap = now;
});

/* ================= SEARCH ================= */

searchInput.addEventListener("input", function () {
  const text = this.value.toLowerCase();
  const filtered = images.filter(img =>
    img.title.toLowerCase().includes(text)
  );
  renderImages(filtered);
});

/* ================= FILTER ================= */

filterButtons.forEach(btn => {
  btn.addEventListener("click", function () {
    const category = this.dataset.category;
    if (category === "all") renderImages(images);
    else renderImages(images.filter(img => img.category === category));
  });
});

/* ================= DARK MODE ================= */

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

/* ================= DOWNLOAD ================= */

downloadBtn.addEventListener("click", async () => {
  const res = await fetch(activeImages[currentIndex].url);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "image.jpg";
  a.click();
});

/* ================= LONG PRESS FOR MULTI SELECT ================= */

gallery.addEventListener("contextmenu", e => {
  e.preventDefault();
  multiSelectMode = !multiSelectMode;
});