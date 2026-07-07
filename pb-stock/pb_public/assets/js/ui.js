// ui.js — Composants UI partagés (navigation, filtres, jauges de stock, modale, toasts…)

(function () {
  var NAV_ITEMS = [
    { key: 'home', label: '🏠 Stocks', href: '/index.html' },
    { key: 'retrait', label: '📦 Retrait', href: '/retrait.html' },
    { key: 'panier', label: '🛒 Panier', href: '/panier.html', cart: true },
    { key: 'commandes', label: '📋 Commandes', href: '/commandes.html' },
    { key: 'produits', label: '⚙️ Produits', href: '/produits.html' }
  ];

  var modalOverlay = null;

  // ---- Navigation -------------------------------------------------------------

  function renderNav(activePage) {
    var container = document.getElementById('nav-container');
    if (!container) {
      return;
    }

    var count = window.StockCart ? window.StockCart.getCount() : 0;

    var linksHtml = NAV_ITEMS.map(function (item) {
      var activeClass = item.key === activePage ? ' active' : '';
      var badgeHtml = item.cart ? ' <span class="cart-badge" id="cart-badge">' + count + '</span>' : '';
      return '<a class="nav-item' + activeClass + '" href="' + item.href + '">' + item.label + badgeHtml + '</a>';
    }).join('');

    container.innerHTML =
      '<nav class="nav">' +
        '<div class="nav-container">' +
          '<a class="nav-brand" href="/index.html">' +
            '<img src="/assets/img/feuille_unique.png" alt="PNJ">' +
            '<span>Stock PNJ</span>' +
          '</a>' +
          '<button class="nav-toggle" id="nav-toggle" type="button" aria-label="Menu">&#9776;</button>' +
          '<div class="nav-links" id="nav-links">' + linksHtml + '</div>' +
        '</div>' +
      '</nav>';

    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('open');
      });
    }

    window.addEventListener('cart-updated', function (e) {
      var badge = document.getElementById('cart-badge');
      if (badge) {
        badge.textContent = e.detail ? e.detail.count : window.StockCart.getCount();
      }
    });
  }

  // ---- Filtres par catégorie -------------------------------------------------------------

  function renderCategoryFilters(categories, onFilter) {
    var container = document.getElementById('category-filters');
    if (!container) {
      return;
    }

    var pills = [{ id: null, nom: 'Tous', icone: '' }].concat(categories);

    container.innerHTML = pills.map(function (cat, index) {
      var activeClass = index === 0 ? ' active' : '';
      var icon = cat.icone ? escapeHtml(cat.icone) + ' ' : '';
      var id = cat.id || '';
      return '<button class="pill-filter' + activeClass + '" type="button" data-categorie-id="' + id + '">' + icon + escapeHtml(cat.nom) + '</button>';
    }).join('');

    var pillEls = container.querySelectorAll('.pill-filter');
    pillEls.forEach(function (el) {
      el.addEventListener('click', function () {
        pillEls.forEach(function (p) { p.classList.remove('active'); });
        el.classList.add('active');
        var id = el.getAttribute('data-categorie-id');
        onFilter(id || null);
      });
    });
  }

  // ---- Jauge de stock -------------------------------------------------------------

  function renderStockBar(quantite, seuils) {
    var s = Object.assign({ low: 5, high: 10, max: 20 }, seuils || {});
    var statusClass = 'stock-high';

    if (quantite === 0) {
      statusClass = 'stock-empty';
    } else if (quantite < s.low) {
      statusClass = 'stock-low';
    } else if (quantite <= s.high) {
      statusClass = 'stock-medium';
    }

    var percent = Math.max(0, Math.min(100, (quantite / s.max) * 100));
    return '<div class="stock-bar"><div class="stock-bar-fill ' + statusClass + '" style="width:' + percent + '%"></div></div>';
  }

  // ---- État vide -------------------------------------------------------------

  function renderEmptyState(message) {
    return '<div class="empty-state"><p>' + message + '</p></div>';
  }

  // ---- Modale -------------------------------------------------------------

  function showModal(title, bodyHtml, onConfirm) {
    hideModal();

    modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML =
      '<div class="modal">' +
        '<div class="modal-header"><h3>' + title + '</h3></div>' +
        '<div class="modal-body">' + bodyHtml + '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-outline" type="button" id="modal-cancel">Annuler</button>' +
          '<button class="btn btn-primary" type="button" id="modal-confirm">Confirmer</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modalOverlay);

    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    document.getElementById('modal-confirm').addEventListener('click', function () {
      hideModal();
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    });
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) {
        hideModal();
      }
    });
  }

  function hideModal() {
    if (modalOverlay && modalOverlay.parentNode) {
      modalOverlay.parentNode.removeChild(modalOverlay);
    }
    modalOverlay = null;
  }

  // ---- Toast -------------------------------------------------------------

  function showToast(message, type) {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = 'var(--space-lg)';
    toast.style.right = 'var(--space-lg)';
    toast.style.padding = 'var(--space-sm) var(--space-lg)';
    toast.style.borderRadius = 'var(--radius-md)';
    toast.style.boxShadow = 'var(--shadow-md)';
    toast.style.color = 'var(--blanc)';
    toast.style.background = type === 'error' ? 'var(--danger)' : 'var(--success)';
    toast.style.fontSize = 'var(--font-size-sm)';
    toast.style.fontWeight = '500';
    toast.style.zIndex = '2000';

    document.body.appendChild(toast);

    setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  // ---- Formatage -------------------------------------------------------------

  function formatDate(dateString) {
    if (!dateString) {
      return '';
    }
    var d = new Date(dateString);
    if (isNaN(d.getTime())) {
      return '';
    }
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var year = d.getFullYear();
    return day + '.' + month + '.' + year;
  }

  function formatCHF(amount) {
    var value = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return 'CHF ' + value.toFixed(2);
  }

  // ---- Échappement HTML -------------------------------------------------------------
  // À utiliser sur tout texte saisi par un utilisateur avant insertion via innerHTML.

  function escapeHtml(value) {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Relaie automatiquement les erreurs API (événement stockapi:error) vers un toast
  document.addEventListener('stockapi:error', function (e) {
    var message = (e.detail && e.detail.message) || 'Une erreur est survenue.';
    showToast(message, 'error');
  });

  window.StockUI = {
    renderNav: renderNav,
    renderCategoryFilters: renderCategoryFilters,
    renderStockBar: renderStockBar,
    renderEmptyState: renderEmptyState,
    showModal: showModal,
    hideModal: hideModal,
    showToast: showToast,
    formatDate: formatDate,
    formatCHF: formatCHF,
    escapeHtml: escapeHtml
  };
})();
