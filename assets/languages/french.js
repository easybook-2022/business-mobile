const info = {
  authoption: {
    walkIn: "pour les clients",
    appointments: "Rendez-vous"
  },
  locationsetup: {
    intro: {
      welcome: "Bienvenue à\n",
      message: "Nous amènerons les clients les plus proches à votre porte\nTRÈS VITE",
      begin: "Complétons les informations de votre entreprise"
    },
    type: {
      question: "Quelle entreprise êtes-vous ?",
      buttonHeaders: {
        tapChoose: "Appuyez\npour choisir"
      }
    },
    name: {
      "hair salon": "Entrez le nom du salon de coiffure:",
      "nail salon": "Entrez le nom du salon de manucure:",
      restaurant: "Entrez le nom du restaurant:",
      store: "Entrez le nom du magasin:"
    },
    location: {
      if: {
        "hair salon": "si vous êtes au salon de coiffure en ce moment,",
        "nail salon": "si vous êtes au salon de manucure en ce moment,",
        restaurant: "si vous êtes au restaurant en ce moment,",
        store: "si vous êtes au magasin en ce moment,"
      },
      addressHeader: "Entrez l'adresse de l'entreprise",
      address: {
        addressOne: "Entrez l'adresse #1:",
        addressTwo: "Entrez l'adresse #2 (facultatif):",
        city: "Entrez la ville:",
        province: "Entrez la province:",
        postalCode: "Entrez le code postal:"
      },
      sameOpen: {
        some: "Votre entreprise est-elle ouverte à la même heure le",
        all: "Votre entreprise est-elle ouverte à la même heure tous les jours"
      }
    },
    phonenumber: "Saisissez votre numéro de téléphone professionnel",
    photo: {
      "hair salon": "Prenez une photo de votre salon de coiffure",
      "nail salon": "Prenez une photo de votre salon de manucure",
      restaurant: "Prenez une photo de votre restaurant",
      store: "Prenez une photo de votre magasin"
    },
    openDays: {
      header: "Quels jours êtes-vous ouvert ?",
      time: "Définir l'heure d'ouverture et de fermeture pour {day}",
      sameTime: {
        all: "Réglez l'heure d'ouverture et de fermeture pour tous les jours",
        some: "Réglez l'heure d'ouverture et de fermeture pour"
      }
    }
  },
  register: {
    header: "pour que les clients voient",
    name: "Entrez votre nom:",
    photo: "Prenez une photo de votre visage (facultatif)",
    workingDays: {
      header: "Quels jours travaillez-vous ?",
      hour: "Fixez votre temps de travail le {day}",
      sameHours: {
        header: "Travaillez-vous les mêmes heures sur",
        some: "Définissez votre temps de travail pour",
        all: "Définissez votre temps de travail pour tous les jours"
      }
    },
    nameErrormsg: "Veuillez entrer un nom que vous aimez",
    workingDaysErrormsg: "Veuillez choisir les jours où vous travaillez"
  },
  main: {
    navs: {
      myAppointments: "Mes\nrendez-vous",
      allAppointments: "Tous\nles rendez-vous",
      cartOrderers: "Commandeurs de panier",
      tableBills: "Factures de table",
      tableOrders: "Commande(s) de table"
    },
    list: {
      header: "Vous verrez vos rendez-vous ici",
      clientName: "Nom du client",
      staff: "Nom du personnel",
      changeTime: "Changer d'heure avec le client"
    },
    chart: {
      stillBusy: "toujours occupé",
      booked: "Réservé",
      walkIn: "Entrer",
      editTime: "Appuyez sur l'heure pour réserver à nouveau",
      reschedule: {
        all: "Tout reprogrammer",
        some: "Reprogrammer certains",
        finishSelect: "Terminer la sélection",
      },
      rebook: "Appuyez à tout autre\nmoment pour réserver à nouveau"
    },
    cartOrderers: {
      header: "Vous verrez toutes les commandes ici",
      customerName: "Cliente:",
      orderNumber: "Ordre #:",
      seeOrders: "Voir les commandes"
    },
    tableOrders: {
      header: "Il n'y a pas encore de commande(s) de table",
      tableHeader: "Table #",
      seeBill: "Voir facture",
      seeOrders: "Voir les commandes",
      showCode: "Afficher le code"
    },
    bottomNavs: {
      changeInfo: "Modifier les\ninformations",
      hours: "Heures"
    },
    hidden: {
      scheduleOption: {
        rebookHeader: "Appuyez à tout autre moment pour réserver à nouveau",
        selectHeader: "Appuyez sur les horaires que vous souhaitez modifier",
        remove: {
          header: "Pourquoi annuler ? (Optionnel)",
          reason: "Écrivez votre raison"
        },
        select: {
          pushTypeHeader: "Replanifier les rendez-vous en avant ou en arrière ?",
          pushByHeader: { forward: "Reporter les rendez-vous d'ici", backward: "Reprogrammer les rendez-vous en arrière de" },
          timeFactorHeader: "Entrez combien ",
          pushTypes: {
            backward: "Poussez vers l'arrière",
            forward: "Faire avancer"
          },
          pushBys: {
            days: "Journées",
            hours: "Heures",
            minutes: "Minutes"
          }
        },
        rescheduleNow: "Reprogrammer Maintenant",
        selectFactor: "Sélectionnez combien {factor}"
      },
      showInfo: {
        businessHeader: "Heures d'ouverture",
        staffHeader: "Tous les états-majors",
        staffName: "Nom du personnel:"
      },
      showMoreoptions: {
        changeMenu: "Changer de menu",
        changeStaffinfo: "Modifier les informations du personnel",
        changeBusinessinformation: "Changer de nom/numéro de téléphone",
        changeBusinesslocation: "Changement d'adresse",
        changeBusinesslogo: "Changer la photo",
        changeBusinesshours: "Changer les heures d'ouverture",
        moreBusinesses: "Vos entreprises",
        walkIn: "Client sans rendez-vous",
        changeLanguage: "Changer de langue",
        editTables: "Modifier les tableaux",
        getAppointmentsby: {
          header: "Obtenez des rendez-vous par",
          both: "Propriétaires et personnel",
          owner: "Propriétaires uniquement"
        },
        useVoice: {
          header: "Utiliser la voix",
          yes: "Oui",
          no: "Non"
        }
      },
      workingDays: {
        header: "Quels jours les nouveaux employés travaillent-ils ?",
        hour: "Définir le temps de travail du nouveau personnel",
        sameHour: "Définir le temps de travail du nouveau personnel pour"
      },
      alert: {
        schedulingConflict: "Il y a un conflit d'horaire",
        unfinishedOrders: "Il y a des commandes inachevées",
        noOrders: "Il n'y a pas de commandes"
      },
      tables: {
        table: "Tableau #",
        showBarcode: "Afficher le code barre",
        hidden: {
          add: {
            tableNumber: "Entrer le tableau #:",
          },
          remove: {
            header: "Supprimer le tableau #"
          },
          qr: {
            header: "Tableau #"
          }
        }
      }
    },
    editInfo: {
      staff: {
        header: "Modifier les portées",
        add: "Ajouter un nouveau personnel",
        change: {
          self: "Modifier vos informations",
          other: "Changer les heures"
        }
      }
    },
    editingInfo: {
      header: {
        edit: "Modification des informations du personnel",
        add: "Ajouter les informations du personnel"
      },
      changeCellnumber: "Changer le numéro de portable",
      changeName: "Changez votre nom",
      changeProfile: "Modifier votre profil",
      changePassword: "Changez votre mot de passe",
      changeWorking: "Modifier vos jours et heures de travail"
    },
    editingLanguage: {
      english: "Anglais",
      french: "Français",
      vietnamese: "Vietnamien",
      chinese: "Chinois"
    },
    editingInformation: {
      name: "Entrez le nom de l'entreprise",
      phonenumber: "Entrez le numéro de téléphone professionnel"
    },
    editingLocation: "Entrez l'adresse de l'entreprise",
    editingLogo: "Photo de l'entreprise",
    editingHours: {
      header: "Modifier les heures d'ouverture",
      openHeader: "Ouvert le {day}",
      changeToNotOpen: "Changer pour ne pas ouvrir",
      changeToOpen: "Changer pour ouvrir",
      notOpen: "Pas ouvert le {day}"
    },
    editingWorkingHours: "Modifier votre temps de travail",
    deleteStaff: {
      header: "Travail {numDays} jours",
      delete: "Supprimer le personnel"
    }
  },
  list: {
    add: "Ajouter une entreprise"
  },
  orders: {
    header: "Ordres",
    setWaittime: "Définir le temps d'attente",
    customerNote: "Remarque du client:",

    hidden: {
      noOrders: {
        header: "La commande a déjà été livrée"
      },
      noWaittime: {
        header: "Veuillez indiquer au client le temps d'attente pour cette commande",
      },
      waitTime: {
        header: "Combien de temps sera l'attente ?",
        min: "mins"
      }
    }
  },
  booktime: {
    header: "Demander une heure différente",
    pickStaff: "Choisissez un bâton (facultatif)",
    pickAnotherStaff: "Choisissez un autre personnel (facultatif)",
    pickToday: "Choisissez aujourd'hui",
    tapDifferentDate: "Appuyez sur une autre date ci-dessous",
    current: "Courante:",
    tapDifferentTime: "Appuyez sur une autre heure ci-dessous",

    hidden: {
      confirm: {
        client: "Cliente",
        service: "Service",
        change: "Changer l'heure pour",
        appointmentChanged: "Rendez-vous modifié",
        leaveNote: "Laissez une note si vous voulez"
      }
    }
  },
  tables: {
    addTable: "Ajouter un tableau",
    table: "Tableau #",
    showBarcode: "Afficher le code barre",
    hidden: {
      add: {
        tableNumber: "Entrer le tableau #:",
      },
      remove: {
        header: "Supprimer le tableau #"
      },
      qr: {
        header: "Tableau #"
      }
    }
  },

  // components
  menu: {
    header: {
      edit: "Modifier le menu",
      view: "Afficher le menu"
    },
    photos: {
      header: "Photo(s)",
      upload: "Prendre une photo de menu",
      easier: "Plus facile pour vous"
    },
    lists: {
      header: "Listes",
      easier: {
        salon: "Réservation plus facile pour les clients",
        restaurant: "Commande plus facile pour les clients"
      }
    },
    bottomNavs: {
      back: {
        salon: "Retour\naux rendez-vous",
        restaurant: "Retour\naux commandes"
      }
    },
    hidden: {
      uploadMenu: {
        takePhoto: "Prendre une photo"
      },
      menuPhotooption: {
        header: "Êtes-vous sûr de vouloir\nsupprimer ce menu ?"
      }
    }
  },
  addmenu: {
    header: {
      edit: "Modifier le menu",
      add: "Ajouter un menu"
    },
    name: "Quel est cet appel de menu ?",
    photo: "Prendre une photo du menu (facultatif)",
  },
  addservice: {
    header: {
      edit: "Modifier le service",
      add: "Ajouter un service"
    },
    name: "Quel est cet appel de service ?",
    photo: "Prendre une photo de ce service (facultatif)",
    price: "Entrez le prix de ce service"
  },
  addproduct: {
    header: {
      edit: "Modifier le produit",
      add: "Ajouter un nouveau produit"
    },
    name: "Saisissez un nom pour ce produit",
    photo: "Prendre une photo de ce produit (facultatif)",
    options: {
      addamount: "Option d'ajout de % ou de montant",
      addoption: "Ajouter une option spécifique"
    },
    price: {
      size: "Ajouter une taille",
      sizes: "Entrez un prix",
    }
  },
  addmeal: {
    header: {
      edit: "Modifier le repas",
      add: "Ajouter un nouveau repas"
    },
    name: "Saisissez un nom pour ce repas",
    photo: "Prendre une photo de ce repas (facultatif)",
    price: {
      size: "Ajouter une taille",
      sizes: "Entrez un prix",
      quantity: "Ajouter la quantité",
      percent: "Ajouter %"
    }
  },

  // global
  "Hair salon": "Salon de\ncoiffure",
  "Nail salon": "Salon de\nmanucure",
  Store: "Magasin",
  Restaurant: "Restaurant",

  "hair salon": "salon de\ncoiffure",
  "nail salon": "salon de\nmanucure",
  store: "magasin",
  restaurant: "restaurant",

  days: { Sunday: "Dimanche", Monday: "Lundi", Tuesday: "Mardi", Wednesday: "Mercredi", Thursday: "Jeudi", Friday: "Vendredi", Saturday: "Samedi" },
  months: { January: "Janvier", February: "Février", March: "Mars", April: "Avril", May: "Peut", June: "Juin", July: "Juillet", August: "Août", September: "Septembre", October: "Octobre", November: "Novembre", December: "Décembre" },

  headers: {
    locatedHeader: {
      "hair salon": "Votre salon de coiffure est à",
      "nail salon": "Votre onglerie est à",
      restaurant: "Votre restaurant est à",
      store: "Votre magasin est à"
    },
    todayAt: "Aujourd'hui à",
    tomorrowAt: "Demain à"
  },

  buttons: {
    back: "Retour",
    next: "Prochaine",
    cancel: "Annuler",
    skip: "Sauter",
    add: "Ajouter",
    edit: "Éditer",
    rebook: "Reebok",
    update: "Mise à jour",
    begin: "Commencer",
    takePhoto: "Prends\ncette photo",
    retakePhoto: "Reprendre\nla photo",
    choosePhoto: "Choisissez\nparmi le téléphone",
    markLocation: "Marquez votre emplacement",
    enterAddress: "Entrer l'adresse",
    editAddress: "Modifier l'adresse",
    done: "Fait",
    changeDays: "Changer les jours",
    yes: "Oui",
    no: "Non",
    close: "proche",
    addmenu: "Ajouter un menu",
    addmeal: "Ajouter un repas",
    additem: "Ajouter un item",
    addservice: "Ajouter un service",
    delete: "Effacer",
    change: "Changer",
    see: "Voir",
    random: "Choisissez au hasard",
    forward: "vers l'avant",
    backward: "en arrière"
  },

  disableHeader: "l y a une mise à jour de l'application.\nPatientez s'il-vous-plait\nou appuyez sur Fermer"
}

export const french = info
