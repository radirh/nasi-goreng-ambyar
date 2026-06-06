/* ============================================================
   NASI GORENG AMBYAR — script.js
   Project Portfolio TJKT 2026
   ============================================================ */

/* ============================================================
   1. DARK / LIGHT MODE
   ============================================================ */

function toggleTheme() {
  const html   = document.documentElement;
  const icon   = document.getElementById('theme-icon');
  const isDark = html.getAttribute('data-theme') === 'dark';

  if (isDark) {
    html.setAttribute('data-theme', 'light');
    icon.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  } else {
    html.setAttribute('data-theme', 'dark');
    icon.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  }
}

function applySavedTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('theme-icon').textContent = '☀️';
  }
}

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.addEventListener('click', toggleTheme);
}


/* ============================================================
   2. SMOOTH SCROLL
   ============================================================ */

function initSmoothScroll() {
  const ctaBtn = document.getElementById('cta-btn');
  if (!ctaBtn) return;

  ctaBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.getElementById('menu');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}


/* ============================================================
   3. FAVORITES — localStorage
   ============================================================ */

const FAVORITES_KEY = 'nga_favorites';

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function isFavorited(name) {
  return getFavorites().includes(name);
}

function toggleFavorite(name) {
  let favs = getFavorites();
  if (favs.includes(name)) {
    favs = favs.filter(function (n) { return n !== name; });
  } else {
    favs.push(name);
  }
  saveFavorites(favs);
  return favs.includes(name);
}


/* ============================================================
   4. HANDLE KLIK LIKE — fungsi terpusat
   Dipanggil dari card asli maupun clone favorit
   ============================================================ */

function handleLikeClick(btn, card, isClone, originalCard) {
  var name = card ? card.getAttribute('data-name') : null;
  if (!name) return;

  var isNowFav = toggleFavorite(name);

  /* Update tombol yang diklik */
  btn.textContent = isNowFav ? '❤️' : '🤍';

  /* Animasi pop */
  btn.classList.remove('liked');
  void btn.offsetWidth; /* reflow untuk restart animasi */
  btn.classList.add('liked');

  /* Sinkron tombol di card ASLI (menu-grid) */
  var sourceCard = isClone ? originalCard : card;
  if (sourceCard) {
    var origBtn = sourceCard.querySelector('.like-btn');
    if (origBtn && origBtn !== btn) {
      origBtn.textContent = isNowFav ? '❤️' : '🤍';
    }
  }

  showToast(isNowFav ? 'Ditambahkan ke favorit! ❤️' : 'Dihapus dari favorit 🤍');

  /* Re-render section favorit */
  setTimeout(buildFavoritesSection, 350);
}


/* ============================================================
   5. FAVORIT SECTION — render ulang
   ============================================================ */

function buildFavoritesSection() {
  var favs     = getFavorites();
  var grid     = document.getElementById('fav-grid');
  var emptyMsg = document.getElementById('fav-empty');
  if (!grid || !emptyMsg) return;

  grid.innerHTML = '';

  if (favs.length === 0) {
    grid.style.display = 'none';
    emptyMsg.removeAttribute('hidden');
    return;
  }

  emptyMsg.setAttribute('hidden', '');
  grid.style.display = '';

  var allCards = document.querySelectorAll('.menu-grid .card');
  var found    = 0;

  allCards.forEach(function (originalCard) {
    var name = originalCard.getAttribute('data-name');
    if (!favs.includes(name)) return;

    var clone = originalCard.cloneNode(true);
    clone.classList.remove('card-hidden');

    /* Reset animasi clone */
    clone.style.animationDelay = (found * 0.08) + 's';

    /* Pastikan tombol hati clone tampil ❤️ */
    var cloneBtn = clone.querySelector('.like-btn');
    if (cloneBtn) {
      cloneBtn.textContent = '❤️';

      /* ✅ FIX: pasang listener langsung di elemen, bukan delegate */
      cloneBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        handleLikeClick(cloneBtn, clone, true, originalCard);
      });
    }

    /* Klik card clone → buka modal (pakai data originalCard) */
    clone.addEventListener('click', function (e) {
      if (e.target.closest('.like-btn')) return;
      openModal(originalCard);
    });

    clone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(originalCard);
      }
    });

    grid.appendChild(clone);
    found++;
  });

  if (found === 0) {
    grid.style.display = 'none';
    emptyMsg.removeAttribute('hidden');
  }
}


/* ============================================================
   6. CARDS — inisialisasi card di menu-grid
   ============================================================ */

function initCards() {
  var cards = document.querySelectorAll('.menu-grid .card');

  cards.forEach(function (card) {
    var name = card.getAttribute('data-name');

    /* Best seller ribbon */
    if (card.getAttribute('data-bestseller') === 'true') {
      var ribbon       = document.createElement('span');
      ribbon.className   = 'card-ribbon';
      ribbon.textContent = '⭐ Best Seller';
      card.appendChild(ribbon);
    }

    /* Pulihkan status favorit */
    var likeBtn = card.querySelector('.like-btn');
    if (likeBtn) {
      likeBtn.textContent = isFavorited(name) ? '❤️' : '🤍';

      /* ✅ FIX: listener langsung di tombol, bukan delegate */
      likeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        handleLikeClick(likeBtn, card, false, null);
      });
    }

    /* Image vs placeholder */
    var cardImg         = card.querySelector('.card-img-wrap img');
    var cardPlaceholder = card.querySelector('.card-img-placeholder');

    if (cardImg && cardPlaceholder) {
      if (cardImg.complete && cardImg.naturalWidth > 0) {
        cardImg.style.display         = '';
        cardPlaceholder.style.display = 'none';
      } else {
        cardImg.addEventListener('load', function () {
          cardImg.style.display         = '';
          cardPlaceholder.style.display = 'none';
        });
        cardImg.addEventListener('error', function () {
          cardImg.style.display         = 'none';
          cardPlaceholder.style.display = 'flex';
        });
      }
    }

    /* Klik card → modal */
    card.addEventListener('click', function (e) {
      if (e.target.closest('.like-btn')) return;
      openModal(card);
    });

    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
  });
}


/* ============================================================
   7. MODAL
   ============================================================ */

function openModal(card) {
  var overlay        = document.getElementById('modal-overlay');
  var img            = document.getElementById('modal-img');
  var imgPlaceholder = document.getElementById('modal-img-placeholder');
  var bsBadge        = document.getElementById('modal-bs-badge');
  var name           = document.getElementById('modal-name');
  var price          = document.getElementById('modal-price');
  var desc           = document.getElementById('modal-desc');

  var dataName       = card.getAttribute('data-name');
  var dataPrice      = card.getAttribute('data-price');
  var dataImg        = card.getAttribute('data-img');
  var dataBestseller = card.getAttribute('data-bestseller');
  var dataDesc       = card.getAttribute('data-desc');

  img.style.display = '';
  img.src           = dataImg || '';
  img.alt           = dataName || '';

  img.onerror = function () {
    img.style.display = 'none';
    if (imgPlaceholder) {
      imgPlaceholder.textContent   = '🍳';
      imgPlaceholder.style.display = 'flex';
    }
  };

  img.onload = function () {
    img.style.display = '';
    if (imgPlaceholder) imgPlaceholder.style.display = 'none';
  };

  if (!dataImg) {
    img.style.display = 'none';
    if (imgPlaceholder) {
      imgPlaceholder.textContent   = '🍳';
      imgPlaceholder.style.display = 'flex';
    }
  } else {
    if (imgPlaceholder) imgPlaceholder.style.display = 'none';
  }

  name.textContent  = dataName  || '-';
  price.textContent = dataPrice || '-';
  desc.textContent  = dataDesc  || '';

  if (dataBestseller === 'true') {
    bsBadge.removeAttribute('hidden');
  } else {
    bsBadge.setAttribute('hidden', '');
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  var overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function initModal() {
  var overlay  = document.getElementById('modal-overlay');
  var closeBtn = document.getElementById('modal-close');
  var modalBox = document.querySelector('.modal-box');

  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', function (e) {
    if (!modalBox.contains(e.target)) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
}


/* ============================================================
   8. TOAST
   ============================================================ */

var toastTimer = null;

function showToast(pesan) {
  var existing = document.getElementById('toast');
  if (existing) {
    existing.remove();
    clearTimeout(toastTimer);
  }

  var toast       = document.createElement('div');
  toast.id          = 'toast';
  toast.className   = 'toast';
  toast.textContent = pesan;
  document.body.appendChild(toast);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      toast.classList.add('show');
    });
  });

  toastTimer = setTimeout(function () {
    toast.classList.remove('show');
    setTimeout(function () {
      if (toast.parentNode) toast.remove();
    }, 400);
  }, 2500);
}


/* ============================================================
   9. CATEGORY FILTER
   ============================================================ */

function initCategoryFilter() {
  var filterContainer = document.getElementById('category-filter');
  if (!filterContainer) return;

  var filterBtns = filterContainer.querySelectorAll('.filter-btn');
  var cards      = document.querySelectorAll('.menu-grid .card');
  var emptyMsg   = document.getElementById('menu-empty');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter');

      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var visibleIndex = 0;
      var anyVisible   = false;

      cards.forEach(function (card) {
        var category = card.getAttribute('data-category') || 'all';
        var show     = filter === 'all' || category === filter;

        if (show) {
          card.classList.remove('card-hidden');
          card.style.animationDelay = (visibleIndex * 0.07) + 's';
          card.style.animation      = 'none';
          void card.offsetWidth;
          card.style.animation      = '';
          visibleIndex++;
          anyVisible = true;
        } else {
          card.classList.add('card-hidden');
        }
      });

      if (emptyMsg) emptyMsg.hidden = anyVisible;
    });
  });
}


/* ============================================================
   10. INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  applySavedTheme();
  initThemeToggle();
  initSmoothScroll();
  initCards();          /* ← sudah include listener like */
  initModal();
  /* initLikeButtons() DIHAPUS — sudah digabung ke initCards */
  initCategoryFilter();
  buildFavoritesSection();
});