console.log("🔥 LEGENDARY GALLERY RUNNING");

/* ================= ELEMENTS ================= */

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

/* ================= VARIABLES ================= */

let images = [];
let activeImages = [];
let currentIndex = 0;
let multiSelectMode = false;
let selectedImages = [];
let page = 1;
let loading = false;

/* ================= FETCH IMAGES ================= */

async function fetchImages() {
  if (loading) return;
  loading = true;

  const res = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=20`);
  const data = await res.json();

  const newImages = data.map(item => ({
    id: Number(item.id) + page * 1000,
    url: `https://picsum.photos/id/${item.id}/1000/800`,
    title: item.author,
    category: Number(item.id) % 2 === 0 ? "nature" : "cars",
    date: "2026"
  }));

  images = [...images, ...newImages];
  renderImages(images);
  page++;
  loading = false;
}

fetchImages();

/* ================= RENDER ================= */

function renderImages(data) {
  gallery.innerHTML = "";
  activeImages = data;

  data.forEach(image => {
    const card = document.createElement("div");
    card.classList.add("card");

    const img = document.createElement("img");
    img.src = image.url;
    img.loading = "lazy";

    img.addEventListener("click", () => {
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

  updateSelectionCounter();
}

/* ================= INFINITE SCROLL ================= */

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    fetchImages();
  }
});

/* ================= MULTI SELECT ================= */

function toggleSelect(id, card) {
  if (selectedImages.includes(id)) {
    selectedImages = selectedImages.filter(i => i !== id);
    card.classList.remove("selected");
  } else {
    selectedImages.push(id);
    card.classList.add("selected");
  }
  updateSelectionCounter();
}

gallery.addEventListener("contextmenu", e => {
  e.preventDefault();
  multiSelectMode = !multiSelectMode;
  document.body.classList.toggle("multi-mode");
});

/* ================= SELECTION COUNTER ================= */

function updateSelectionCounter() {
  let counter = document.getElementById("selectCount");

  if (!counter) {
    counter = document.createElement("div");
    counter.id = "selectCount";
    document.body.appendChild(counter);
  }

  if (selectedImages.length > 0) {
    counter.innerText = `Selected: ${selectedImages.length}`;
    counter.style.display = "block";
  } else {
    counter.style.display = "none";
  }
}

/* ================= BULK DOWNLOAD ================= */

async function bulkDownload() {
  if (selectedImages.length === 0) return alert("No images selected");

  const zip = new JSZip();
  const folder = zip.folder("Gallery");

  for (let id of selectedImages) {
    const img = images.find(i => i.id === id);
    const res = await fetch(img.url);
    const blob = await res.blob();
    folder.file(`image-${id}.jpg`, blob);
  }

  zip.generateAsync({ type: "blob" }).then(content => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "gallery-images.zip";
    a.click();
  });
}

document.addEventListener("keydown", e => {
  if (e.key === "d" && multiSelectMode) {
    bulkDownload();
  }
});

/* ================= MODAL ================= */

function openModal() {
  modal.style.display = "flex";
  updateModal();
}

function updateModal() {
  const img = activeImages[currentIndex];
  modalImage.src = img.url;
  modalTitle.textContent = img.title;

  imageDetails.innerHTML = `
    <p>Category: ${img.category}</p>
    <p>Date: ${img.date}</p>
  `;
}

closeModal.addEventListener("click", () => modal.style.display = "none");

nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % activeImages.length;
  updateModal();
});

prevBtn.addEventListener("click", () => {
  currentIndex =
    (currentIndex - 1 + activeImages.length) % activeImages.length;
  updateModal();
});

/* ================= ZOOM ================= */

let scale = 1;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX, startY;

function updateTransform() {
  modalImage.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

modalImage.addEventListener("dblclick", () => {
  scale = scale === 1 ? 2 : 1;
  updateTransform();
});

modalImage.addEventListener("wheel", e => {
  e.preventDefault();
  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(1, scale), 4);
  updateTransform();
});

modalImage.addEventListener("mousedown", e => {
  if (scale === 1) return;
  isDragging = true;
  startX = e.clientX - posX;
  startY = e.clientY - posY;
});

document.addEventListener("mousemove", e => {
  if (!isDragging) return;
  posX = e.clientX - startX;
  posY = e.clientY - startY;
  updateTransform();
});

document.addEventListener("mouseup", () => {
  isDragging = false;
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