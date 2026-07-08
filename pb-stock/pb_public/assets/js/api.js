// api.js — Wrapper autour du SDK PocketBase (CRUD produits, catégories, commandes…)

(function () {
  var pb = new PocketBase(window.location.origin);

  // Gestion d'erreurs centralisée : 401 → redirect login, sinon on notifie l'UI
  function handleError(err) {
    if (err && err.status === 401) {
      localStorage.removeItem('stock_auth_token');
      window.location.href = '/login.html';
      return Promise.reject(err);
    }
    var message = (err && err.message) || 'Une erreur est survenue.';
    console.error('[StockAPI]', err);
    document.dispatchEvent(new CustomEvent('stockapi:error', {
      detail: { message: message, error: err }
    }));
    return Promise.reject(err);
  }

  // ---- Produits -------------------------------------------------------------

  function getProducts(filter) {
    var filterStr = 'actif=true';
    if (filter) {
      filterStr += ' && (' + filter + ')';
    }
    return pb.collection('produits').getFullList({
      filter: filterStr,
      expand: 'categorie',
      sort: '-quantite'
    }).catch(handleError);
  }

  function getProduct(id) {
    return pb.collection('produits').getOne(id, {
      expand: 'categorie'
    }).catch(handleError);
  }

  // Actifs + inactifs — utilisé par produits.html pour la gestion du catalogue
  function getAllProducts() {
    return pb.collection('produits').getFullList({
      expand: 'categorie',
      sort: 'nom'
    }).catch(handleError);
  }

  function createProduct(data) {
    return pb.collection('produits').create(data).catch(handleError);
  }

  function updateProduct(id, data) {
    return pb.collection('produits').update(id, data).catch(handleError);
  }

  // ---- Catégories -------------------------------------------------------------

  function getCategories() {
    return pb.collection('categories').getFullList({
      sort: 'ordre'
    }).catch(handleError);
  }

  // ---- Collaborateurs -------------------------------------------------------------

  function getCollaborateurs() {
    return pb.collection('collaborateurs').getFullList({
      filter: 'actif=true',
      sort: 'nom'
    }).catch(handleError);
  }

  // ---- Commandes -------------------------------------------------------------

  function getCommandes(page, perPage) {
    return pb.collection('commandes').getList(page || 1, perPage || 50, {
      expand: 'collaborateur,commande_items_via_commande',
      sort: '-date_commande'
    }).catch(handleError);
  }

  function getCommande(id) {
    return pb.collection('commandes').getOne(id, {
      expand: 'collaborateur,commande_items_via_commande.produit'
    }).catch(handleError);
  }

  function getCommandeItems(commandeId) {
    return pb.collection('commande_items').getFullList({
      filter: pb.filter('commande = {:id}', { id: commandeId }),
      expand: 'produit'
    }).catch(handleError);
  }

  function validerCommande(data) {
    return pb.send('/api/valider-commande', {
      method: 'POST',
      body: data
    }).catch(handleError);
  }

  function retournerItem(commandeItemId, quantite) {
    return pb.send('/api/retourner-item', {
      method: 'POST',
      body: { commande_item_id: commandeItemId, quantite: quantite }
    }).catch(handleError);
  }

  window.StockAPI = {
    pb: pb,
    getProducts: getProducts,
    getProduct: getProduct,
    getAllProducts: getAllProducts,
    createProduct: createProduct,
    updateProduct: updateProduct,
    getCategories: getCategories,
    getCollaborateurs: getCollaborateurs,
    getCommandes: getCommandes,
    getCommande: getCommande,
    getCommandeItems: getCommandeItems,
    validerCommande: validerCommande,
    retournerItem: retournerItem
  };
})();
