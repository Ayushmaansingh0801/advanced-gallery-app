console.log("script running");
const gallery = document.getElementById("gallery");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const imageDetails = document.getElementById("imageDetails");
const downloadBtn = document.getElementById("downloadBtn");

let currentIndex = 0;

const images = [
  {
    id: 1,
    url: "https://picsum.photos/id/1015/600/400",
    title: "Forest",
    category: "nature",
    date: "2026-02-22"
  },
  {
    id: 2,
    url: "https://picsum.photos/id/1011/600/400",
    title: "Car",
    category: "cars",
    date: "2026-02-22"
  },
  {
    id: 3,
    url: "https://picsum.photos/id/1025/600/400",
    title: "Dog",
    category: "animals",
    date: "2026-02-22"
  },
  {
    id: 4,
    url: "https://picsum.photos/id/1003/600/400",
    title: "Mountain",
    category: "nature",
    date: "2026-02-22"
  }
];
let activeImages = images;

function renderImages(data) {
  gallery.innerHTML = "";
  activeImages = data;


data.forEach((image, index) => {
  const card = document.createElement("div");

  const img = document.createElement("img");
  img.src = image.url;
  img.alt = image.title;
 img.dataset.id = image.id;

  const likeBtn = document.createElement("button");
  likeBtn.textContent = "❤️";
  likeBtn.classList.add("like-btn");

  likeBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    likeBtn.classList.toggle("liked");
  });

  card.appendChild(img);
  card.appendChild(likeBtn);
  gallery.appendChild(card);
 
});
}

renderImages(images);
const modal = document.getElementById("modal");
const modalImage = document.getElementById("modalImage");
const closeModal = document.getElementById("closeModal");

gallery.addEventListener("click", function (e) {
  if (e.target.tagName === "IMG") {
const imageId = Number(e.target.dataset.id);
currentIndex = activeImages.findIndex(img => img.id === imageId);
    modal.style.display = "flex";
    modalImage.src = activeImages[currentIndex].url;
imageDetails.innerHTML = `
  <h3>${activeImages[currentIndex].title}</h3>
  <p>Category: ${activeImages[currentIndex].category}</p>
  <p>Date: ${activeImages[currentIndex].date}</p>
`;
  }
});

closeModal.addEventListener("click", function () {
  modal.style.display = "none";
});
nextBtn.addEventListener("click", function () {

  currentIndex++;

  if (currentIndex >= activeImages.length) {
    currentIndex = 0;
  }

  modalImage.src = activeImages[currentIndex].url;

  imageDetails.innerHTML = `
    <h3>${activeImages[currentIndex].title}</h3>
    <p>Category: ${activeImages[currentIndex].category}</p>
    <p>Date: ${activeImages[currentIndex].date}</p>
  `;
});


prevBtn.addEventListener("click", function () {

  currentIndex--;

  if (currentIndex < 0) {
    currentIndex = activeImages.length - 1;
  }

  modalImage.src = activeImages[currentIndex].url;

  imageDetails.innerHTML = `
    <h3>${activeImages[currentIndex].title}</h3>
    <p>Category: ${activeImages[currentIndex].category}</p>
    <p>Date: ${activeImages[currentIndex].date}</p>
  `;
});
const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(button => {
  button.addEventListener("click", function () {
    const category = this.dataset.category;

    if (category === "all") {
      renderImages(images);
    } else {
      const filtered = images.filter(img => img.category === category);
      renderImages(filtered);
    }
  });
});
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {
  const searchText = this.value.toLowerCase();

  const filtered = images.filter(img =>
    img.title.toLowerCase().includes(searchText)
  );

  renderImages(filtered);
});
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "☀";
  } else {
    themeToggle.textContent = "🌙";
  }
});
downloadBtn.addEventListener("click", async function () {
  try {

    // Direct modal me jo image dikh rahi hai wahi download hogi
    const imageUrl = modalImage.getAttribute("src");

    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "gallery-image.jpg";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

  } catch (error) {
    alert("Download failed!");
  }
});
document.addEventListener("keydown", function (e) {

  if (modal.style.display === "flex") {

    if (e.key === "ArrowRight") {
      nextBtn.click();
    }

    if (e.key === "ArrowLeft") {
      prevBtn.click();
    }

    if (e.key === "Escape") {
      modal.style.display = "none";
    }

  }

});
