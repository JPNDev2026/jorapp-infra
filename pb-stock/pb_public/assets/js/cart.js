// cart.js — État du panier (localStorage, ajout/retrait/vidage)

(function () {
  var CART_KEY = 'stock_cart';

  function getItems() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function countItems(items) {
    return items.reduce(function (sum, item) { return sum + item.quantite; }, 0);
  }

  function totalItems(items) {
    return items.reduce(function (sum, item) {
      return sum + (item.prix || 0) * item.quantite;
    }, 0);
  }

  // Sauvegarde le panier et notifie la nav (badge) via l'événement cart-updated
  function persist(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cart-updated', {
      detail: {
        items: items,
        count: countItems(items),
        total: totalItems(items)
      }
    }));
    return items;
  }

  function addItem(produit, quantite) {
    var items = getItems();
    var stockMax = produit.quantite;
    var existing = items.find(function (item) { return item.produit_id === produit.id; });

    if (existing) {
      existing.quantite = Math.min(existing.quantite + quantite, stockMax);
      existing.stock_max = stockMax;
    } else {
      items.push({
        produit_id: produit.id,
        nom: produit.nom,
        quantite: Math.min(quantite, stockMax),
        prix: produit.prix || 0,
        stock_max: stockMax
      });
    }

    return persist(items);
  }

  function updateQuantity(produit_id, quantite) {
    if (quantite <= 0) {
      return removeItem(produit_id);
    }

    var items = getItems();
    var item = items.find(function (i) { return i.produit_id === produit_id; });
    if (!item) {
      return items;
    }

    item.quantite = Math.min(quantite, item.stock_max);
    return persist(items);
  }

  function removeItem(produit_id) {
    var items = getItems().filter(function (item) { return item.produit_id !== produit_id; });
    return persist(items);
  }

  function clear() {
    return persist([]);
  }

  function getCount() {
    return countItems(getItems());
  }

  function getTotal() {
    return totalItems(getItems());
  }

  window.StockCart = {
    getItems: getItems,
    addItem: addItem,
    updateQuantity: updateQuantity,
    removeItem: removeItem,
    clear: clear,
    getCount: getCount,
    getTotal: getTotal
  };
})();
