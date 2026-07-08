/// <reference path="../pb_data/types.d.ts" />
//
// pb-stock — Hook JSVM unique : routes API custom
// Cible PocketBase v0.39.x (JSVM v0.23+)

(function () {

  // POST /api/check-password — vérifie le mot de passe partagé
  routerAdd("POST", "/api/check-password", function (e) {
    var body = e.requestInfo().body || {};
    var password = body.password || "";

    var param;
    try {
      param = $app.findFirstRecordByFilter("parametres", "cle = {:cle}", { cle: "mot_de_passe" });
    } catch (err) {
      return e.json(401, { error: "Mot de passe incorrect" });
    }

    if (!password || password !== param.get("valeur")) {
      return e.json(401, { error: "Mot de passe incorrect" });
    }

    var token = Date.now().toString(36) + Math.random().toString(36);
    return e.json(200, { token: token });
  });

  // POST /api/valider-commande — validation atomique du panier
  routerAdd("POST", "/api/valider-commande", function (e) {
    var body = e.requestInfo().body || {};
    var description = body.description || "";
    var collaborateurId = body.collaborateur_id || "";
    var items = body.items || [];

    if (!collaborateurId) {
      return e.json(400, { error: "Collaborateur requis." });
    }

    var collaborateur;
    try {
      collaborateur = $app.findRecordById("collaborateurs", collaborateurId);
    } catch (err) {
      return e.json(400, { error: "Collaborateur introuvable." });
    }
    if (!collaborateur.get("actif")) {
      return e.json(400, { error: "Ce collaborateur n'est pas actif." });
    }

    if (!items.length) {
      return e.json(400, { error: "Le panier est vide." });
    }

    var commandeId = "";
    var numero = "";

    try {
      $app.runInTransaction(function (txApp) {
        var produitsById = {};

        // a. charge chaque produit et vérifie le stock disponible
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var produit;
          try {
            produit = txApp.findRecordById("produits", item.produit_id);
          } catch (errFind) {
            throw new BadRequestError("Produit introuvable.");
          }

          var quantiteDemandee = item.quantite || 0;
          if (quantiteDemandee <= 0) {
            throw new BadRequestError("Quantité invalide pour \"" + produit.get("nom") + "\".");
          }
          if (quantiteDemandee > produit.get("quantite")) {
            throw new BadRequestError("Stock insuffisant pour \"" + produit.get("nom") + "\".");
          }

          produitsById[item.produit_id] = produit;
        }

        // b. génère le numéro de commande STK-YYYYMMDD-NNN
        var now = new Date();
        var yyyy = now.getFullYear();
        var mm = ("0" + (now.getMonth() + 1)).slice(-2);
        var dd = ("0" + now.getDate()).slice(-2);
        var dateStr = "" + yyyy + mm + dd;
        var prefix = "STK-" + dateStr;

        var todayCommandes = txApp.findRecordsByFilter(
          "commandes",
          "numero ~ {:prefix}",
          "",
          1000,
          0,
          { prefix: prefix }
        );
        var seq = ("00" + (todayCommandes.length + 1)).slice(-3);
        numero = prefix + "-" + seq;

        // c. crée l'enregistrement commandes
        var commandesCol = txApp.findCollectionByNameOrId("commandes");
        var commandeRec = new Record(commandesCol);
        commandeRec.set("description", description);
        commandeRec.set("collaborateur", collaborateurId);
        commandeRec.set("date_commande", now);
        commandeRec.set("numero", numero);
        txApp.save(commandeRec);
        commandeId = commandeRec.id;

        // d. crée les commande_items et décrémente le stock
        var itemsCol = txApp.findCollectionByNameOrId("commande_items");
        for (var j = 0; j < items.length; j++) {
          var it = items[j];
          var prod = produitsById[it.produit_id];

          var itemRec = new Record(itemsCol);
          itemRec.set("commande", commandeId);
          itemRec.set("produit", it.produit_id);
          itemRec.set("quantite", it.quantite);
          itemRec.set("prix_unitaire", prod.get("prix"));
          txApp.save(itemRec);

          prod.set("quantite", prod.get("quantite") - it.quantite);
          txApp.save(prod);
        }
      });
    } catch (err) {
      var message = (err && err.message) ? err.message : "Erreur lors de la validation de la commande.";
      return e.json(400, { error: message });
    }

    return e.json(200, { commande_id: commandeId, numero: numero });
  });

  // POST /api/retourner-item — retour (partiel ou total) d'une ligne de commande vers le stock
  routerAdd("POST", "/api/retourner-item", function (e) {
    var body = e.requestInfo().body || {};
    var itemId = body.commande_item_id || "";
    var quantite = body.quantite || 0;

    if (!itemId) {
      return e.json(400, { error: "Article de commande requis." });
    }
    if (quantite <= 0) {
      return e.json(400, { error: "La quantité à retourner doit être positive." });
    }

    var result = {};

    try {
      $app.runInTransaction(function (txApp) {
        var item;
        try {
          item = txApp.findRecordById("commande_items", itemId);
        } catch (errFind) {
          throw new BadRequestError("Article de commande introuvable.");
        }

        var dejaRetourne = item.get("quantite_retournee") || 0;
        var quantiteCommandee = item.get("quantite") || 0;
        var restant = quantiteCommandee - dejaRetourne;

        if (quantite > restant) {
          throw new BadRequestError("Impossible de retourner plus que la quantité restante (" + restant + ").");
        }

        var produit;
        try {
          produit = txApp.findRecordById("produits", item.get("produit"));
        } catch (errProduit) {
          throw new BadRequestError("Produit introuvable.");
        }

        item.set("quantite_retournee", dejaRetourne + quantite);
        txApp.save(item);

        produit.set("quantite", (produit.get("quantite") || 0) + quantite);
        txApp.save(produit);

        result.quantite_retournee = dejaRetourne + quantite;
        result.produit_quantite = produit.get("quantite");
      });
    } catch (err) {
      var message = (err && err.message) ? err.message : "Erreur lors de l'enregistrement du retour.";
      return e.json(400, { error: message });
    }

    return e.json(200, result);
  });

  // GET /api/stock-summary — résumé des stocks par catégorie (page home)
  routerAdd("GET", "/api/stock-summary", function (e) {
    var produits = $app.findRecordsByFilter("produits", "actif = true", "", 5000, 0);
    var categories = $app.findRecordsByFilter("categories", "id != ''", "", 5000, 0);

    var categorieById = {};
    for (var c = 0; c < categories.length; c++) {
      categorieById[categories[c].id] = categories[c];
    }

    var totalProduits = produits.length;
    var enAlerte = 0;
    var perimes = 0;
    var now = new Date();
    var parCategorieMap = {};

    for (var p = 0; p < produits.length; p++) {
      var produit = produits[p];
      var quantite = produit.get("quantite") || 0;

      if (quantite < 5) {
        enAlerte++;
      }

      var dateLimite = produit.get("date_limite");
      if (dateLimite && new Date(dateLimite) < now) {
        perimes++;
      }

      var catId = produit.get("categorie");
      var catNom = "Sans catégorie";
      if (catId && categorieById[catId]) {
        catNom = categorieById[catId].get("nom");
      }

      var key = catId || "none";
      if (!parCategorieMap[key]) {
        parCategorieMap[key] = {
          categorie_id: catId || "",
          categorie_nom: catNom,
          total_items: 0,
          total_quantite: 0
        };
      }
      parCategorieMap[key].total_items += 1;
      parCategorieMap[key].total_quantite += quantite;
    }

    var parCategorie = [];
    for (var key2 in parCategorieMap) {
      if (parCategorieMap.hasOwnProperty(key2)) {
        parCategorie.push(parCategorieMap[key2]);
      }
    }

    return e.json(200, {
      total_produits: totalProduits,
      en_alerte: enAlerte,
      perimes: perimes,
      par_categorie: parCategorie
    });
  });

})();
