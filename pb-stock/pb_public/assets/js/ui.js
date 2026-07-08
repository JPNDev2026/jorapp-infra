// ui.js — Composants UI partagés (navigation, filtres, jauges de stock, modale, toasts…)

(function () {
  var NAV_ITEMS = [
    { key: 'home', label: 'Stocks', icon: 'home', href: '/index.html' },
    { key: 'retrait', label: 'Retrait', icon: 'package', href: '/retrait.html' },
    { key: 'panier', label: 'Panier', icon: 'shopping-cart', href: '/panier.html', cart: true },
    { key: 'commandes', label: 'Commandes', icon: 'clipboard-list', href: '/commandes.html' },
    { key: 'produits', label: 'Produits', icon: 'settings', href: '/produits.html' }
  ];

  var modalOverlay = null;

  // ---- Icônes (Lucide, SVG inline — pas de build step) -------------------------------------------------------------

  var ICONS = {
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>',
    'shopping-cart': '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    'clipboard-list': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    settings: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
    menu: '<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>',
    minus: '<path d="M5 12h14"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    'trash-2': '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'triangle-alert': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    'log-out': '<path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>'
  };

  function icon(name, size) {
    var inner = ICONS[name];
    if (!inner) {
      return '';
    }
    var s = size || 18;
    return '<svg class="icon" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      inner + '</svg>';
  }

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
      return '<a class="nav-item' + activeClass + '" href="' + item.href + '">' + icon(item.icon) + '<span>' + item.label + '</span>' + badgeHtml + '</a>';
    }).join('');

    container.innerHTML =
      '<nav class="nav">' +
        '<div class="nav-container">' +
          '<a class="nav-brand" href="/index.html">' +
            '<img src="/assets/img/Logo_feuille.png" alt="PNJ">' +
            '<span>Stock PNJ</span>' +
          '</a>' +
          '<button class="nav-toggle" id="nav-toggle" type="button" aria-label="Menu">' + icon('menu', 22) + '</button>' +
          '<div class="nav-links" id="nav-links">' +
            linksHtml +
            '<button class="nav-item" id="nav-logout" type="button">' + icon('log-out') + '<span>Déconnexion</span></button>' +
          '</div>' +
        '</div>' +
      '</nav>';

    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('open');
      });
    }

    var logoutBtn = document.getElementById('nav-logout');
    if (logoutBtn && window.StockAuth) {
      logoutBtn.addEventListener('click', function () {
        window.StockAuth.logout();
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
    escapeHtml: escapeHtml,
    icon: icon
  };
})();
