/* ============================================================
   NASI GORENG AMBYAR — script.js
   Project Portfolio TJKT 2026
   ============================================================ */

/* ============================================================
   1. DARK / LIGHT MODE
   ============================================================ */

function toggleTheme() {
  const html      = document.documentElement;
  const icon      = document.getElementById('theme-icon');
  const isDark    = html.getAttribute('data-theme') === 'dark';

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
  if (btn) {
    btn.addEventListener('click', toggleTheme);
  }
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
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}


/* ============================================================
   3. CARDS
   ============================================================ */

function initCards() {
  const cards = document.querySelectorAll('.card');

  cards.forEach(function (card) {
    if (card.getAttribute('data-bestseller') === 'true') {
      const ribbon = document.createElement('span');
      ribbon.className = 'card-ribbon';
      ribbon.textContent = '⭐ Best Seller';
      card.appendChild(ribbon);
    }

    // Handle card-level image vs placeholder visibility
    const cardImg         = card.querySelector('.card-img-wrap img');
    const cardPlaceholder = card.querySelector('.card-img-placeholder');

    if (cardImg && cardPlaceholder) {
      // If image already loaded from cache (complete + no error)
      if (cardImg.complete && cardImg.naturalWidth > 0) {
        cardImg.style.display = '';
        cardPlaceholder.style.display = 'none';
      } else {
        cardImg.addEventListener('load', function () {
          cardImg.style.display = '';
          cardPlaceholder.style.display = 'none';
        });
        cardImg.addEventListener('error', function () {
          cardImg.style.display = 'none';
          cardPlaceholder.style.display = 'flex';
        });
      }
    }

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
   4. MODAL
   ============================================================ */

function openModal(card) {
  const overlay         = document.getElementById('modal-overlay');
  const img             = document.getElementById('modal-img');
  const imgPlaceholder  = document.getElementById('modal-img-placeholder');
  const bsBadge         = document.getElementById('modal-bs-badge');
  const name            = document.getElementById('modal-name');
  const price           = document.getElementById('modal-price');
  const desc            = document.getElementById('modal-desc');

  const dataName        = card.getAttribute('data-name');
  const dataPrice       = card.getAttribute('data-price');
  const dataImg         = card.getAttribute('data-img');
  const dataBestseller  = card.getAttribute('data-bestseller');
  const dataDesc        = card.getAttribute('data-desc');

  // Grab the placeholder emoji from the card (first .card-img-placeholder found)
  const cardPlaceholder = card.querySelector('.card-img-placeholder');
  const placeholderEmoji = cardPlaceholder ? cardPlaceholder.textContent : '';

  // Set modal image — show placeholder emoji if image fails
  img.style.display = '';
  img.src           = dataImg || '';
  img.alt           = dataName || '';

  img.onerror = function () {
    img.style.display = 'none';
    if (imgPlaceholder) {
      imgPlaceholder.textContent = placeholderEmoji;
      imgPlaceholder.style.display = 'flex';
    }
  };

  img.onload = function () {
    img.style.display = '';
    if (imgPlaceholder) imgPlaceholder.style.display = 'none';
  };

  // If src is empty from the start, show placeholder immediately
  if (!dataImg) {
    img.style.display = 'none';
    if (imgPlaceholder) {
      imgPlaceholder.textContent = placeholderEmoji;
      imgPlaceholder.style.display = 'flex';
    }
  } else {
    if (imgPlaceholder) imgPlaceholder.style.display = 'none';
  }

  name.textContent  = dataName || '-';
  price.textContent = dataPrice || '-';
  desc.textContent  = dataDesc || '';

  if (dataBestseller === 'true') {
    bsBadge.removeAttribute('hidden');
  } else {
    bsBadge.setAttribute('hidden', '');
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function initModal() {
  const overlay   = document.getElementById('modal-overlay');
  const closeBtn  = document.getElementById('modal-close');
  const modalBox  = document.querySelector('.modal-box');

  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', function (e) {
    if (!modalBox.contains(e.target)) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}


/* ============================================================
   5. LIKE BUTTONS
   ============================================================ */

function initLikeButtons() {
  const grid = document.querySelector('.menu-grid');
  if (!grid) return;

  grid.addEventListener('click', function (e) {
    const btn = e.target.closest('.like-btn');
    if (!btn) return;

    e.stopPropagation();

    if (btn.textContent.trim() === '🤍') {
      btn.textContent = '❤️';
      showToast('Ditambahkan ke favorit! ❤️');
    } else {
      btn.textContent = '🤍';
      showToast('Dihapus dari favorit 🤍');
    }

    btn.classList.remove('liked');
    void btn.offsetWidth;
    btn.classList.add('liked');
  });
}


/* ============================================================
   6. TOAST
   ============================================================ */

let toastTimer = null;

function showToast(pesan) {
  const existing = document.getElementById('toast');
  if (existing) {
    existing.remove();
    clearTimeout(toastTimer);
  }

  const toast = document.createElement('div');
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
   7. CATEGORY FILTER
   ============================================================
   - Reads data-category attribute on each .card
   - Toggles .card-hidden class for non-matching cards
   - Updates active state on filter buttons
   - Shows/hides empty-state message
   - Re-applies stagger animation delay so hidden→visible
     cards animate in cleanly
   ============================================================ */

function initCategoryFilter() {
  const filterContainer = document.getElementById('category-filter');
  if (!filterContainer) return;

  const filterBtns  = filterContainer.querySelectorAll('.filter-btn');
  const cards       = document.querySelectorAll('.menu-grid .card');
  const emptyMsg    = document.getElementById('menu-empty');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const filter = btn.getAttribute('data-filter');

      // Update active button
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      // Filter cards
      let visibleIndex = 0;
      let anyVisible = false;

      cards.forEach(function (card) {
        const category = card.getAttribute('data-category') || 'all';
        const show     = filter === 'all' || category === filter;

        if (show) {
          card.classList.remove('card-hidden');
          // Re-stagger the animation for newly shown cards
          card.style.animationDelay = (visibleIndex * 0.07) + 's';
          card.style.animation = 'none';
          void card.offsetWidth; // reflow
          card.style.animation = '';
          visibleIndex++;
          anyVisible = true;
        } else {
          card.classList.add('card-hidden');
        }
      });

      // Empty state
      if (emptyMsg) {
        emptyMsg.hidden = anyVisible;
      }
    });
  });
}


/* ============================================================
   8. INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  applySavedTheme();
  initThemeToggle();
  initSmoothScroll();
  initCards();
  initModal();
  initLikeButtons();
  initCategoryFilter();
});