const info = {
  authoption: {
    walkIn: "Walk-in(s)",
    appointments: "Rendez-vous"
  },
  locationsetup: {
    intro: {
      welcome: "Bienvenue à\n",
      message: "Nous amènerons les clients les plus proches à votre porte\nTRÈS VITE",
      letsGo: "Complétons les informations de votre entreprise"
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
      addressHeader: {
        "hair salon": "Entrer l'adresse du salon de coiffure",
        "nail salon": "Entrez l'adresse du salon de manucure",
        restaurant: "Entrez l'adresse du restaurant",
        store: "Entrez l'adresse du magasin"
      },
      address: {
        addressOne: "Entrez l'adresse #1:",
        addressTwo: "Entrez l'adresse #2 (facultatif):",
        city: "Entrez la ville:",
        province: "Entrez la province:",
        postalCode: "Entrez le code postal:"
      }
    },
    phonenumber: {
      "hair salon": "Entrez le numéro de téléphone du salon de coiffure:",
      "nail salon": "Entrez le numéro de téléphone du salon de manucure:",
      restaurant: "Entrez le numéro de téléphone du restaurant:",
      store: "Entrez le numéro de téléphone du magasin:"
    },
    photo: {
      "hair salon": "Prenez une photo de votre salon de coiffure",
      "nail salon": "Prenez une photo de votre salon de manucure",
      restaurant: "Prenez une photo de votre restaurant",
      store: "Prenez une photo de votre magasin"
    },
    openDays: {
      header: "Quels jours êtes-vous ouvert ?",
      time: "Définir les heures d'ouverture et de fermeture pour le {day}"
    }
  },
  register: {
    header: "pour que les clients voient",
    name: "Entrez votre nom:",
    photo: "Prenez une photo de votre visage (facultatif)",
    workingDays: {
      header: "Quels jours travaillez-vous ?",
      hour: "Fixez votre temps de travail le {day}"
    },
    nameErrormsg: "Veuillez entrer un nom que vous aimez",
    workingDaysErrormsg: "Veuillez choisir les jours où vous travaillez"
  },
  main: {
    navs: {
      myAppointments: "Mes\nrendez-vous",
      allAppointments: "Tous\nles rendez-vous",
      cartOrderers: "Commandeurs de panier"
    },
    list: {
      header: "Vous verrez vos rendez-vous ici",
      clientName: "Nom du client",
      staff: "Nom du personnel",
      changeTime: "Changer d'heure avec le client"
    },
    chart: {
      stillBusy: "toujours occupé",
      booked: "réservé"
    },
    cartOrderers: {
      header: "Vous verrez toutes les commandes ici",
      customerName: "Cliente:",
      orderNumber: "Ordre #:",
      seeOrders: "Voir les commandes"
    },
    bottomNavs: {
      changeInfo: "Modifier les\ninformations",
      hours: "Heures"
    },
    hidden: {
      scheduleOption: {
        change: {
          header: "Veuillez appuyer à tout\nautre moment pour réserver à nouveau"
        },
        remove: {
          header: "Pourquoi annuler ? (Optionnel)",
          reason: "Écrivez votre raison"
        }
      },
      showInfo: {
        businessHeader: "Heures d'ouverture",
        staffHeader: "Tous les états-majors",
        staffName: "Nom du personnel:"
      },
      showMoreoptions: {
        changeMenu: "Changer de menu",
        changeStaffinfo: "Modifier les informations du personnel",
        changeBusinessinfo: "Modifier les informations sur l'entreprise",
        changeBusinesshours: "Changer les heures d'ouverture",
        moreBusinesses: "Vos entreprises",
        walkIn: "Client sans rendez-vous",
        changeLanguage: "Changer de langue",
        getAppointmentsby: {
          header: "Obtenez des rendez-vous par",
          staff: "Bâtons",
          owner: "Propriétaires"
        },
        useVoice: {
          header: "Utiliser la voix",
          yes: "Oui",
          no: "Non"
        }
      },
      alert: {
        header: "Il y a un conflit d'horaire"
      },
      languages: {
        english: "Anglais",
        french: "Français",
        vietnamese: "Vietnamien",
        chinese: "Chinois"
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
    editingAddress: {
      name: "Nom de l'entreprise",
      phoneNumber: "Numéro de téléphone professionnel",
      addressOne: "Address #1",
      addressTwo: "Adresse #2 (Facultatif)",
      city: "Ville",
      Province: "Province",
      postalCode: "Code postal"
    },
    editingHours: {
      header: "Modifier les heures d'ouverture",
      openHeader: "Ouvert le {day}",
      changeToNotOpen: "Changer pour ne pas ouvrir",
      changeToOpen: "Changer pour ouvrir",
      notOpen: "Pas ouvert le {day}"
    },
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
        client: "Cliente:",
        service: "Service:",
        change: "Changer l'heure pour",
        appointmentChanged: "Rendez-vous modifié",
        leaveNote: "Laissez une note si vous voulez"
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
      create: "Ajouter un par un",
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
    options: {
      addamount: "Option d'ajout de % ou de montant",
      addoption: "Ajouter une option spécifique"
    },
    price: {
      size: "Ajouter une taille",
      sizes: "Entrez un prix",
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

  days: {
    Sunday: "Dimanche",
    Monday: "Lundi",
    Tuesday: "Mardi",
    Wednesday: "Mercredi",
    Thursday: "Jeudi",
    Friday: "Vendredi",
    Saturday: "Samedi"
  },
  months: {
    January: "Janvier",
    February: "Février",
    March: "Mars",
    April: "Avril",
    May: "Peut",
    June: "Juin",
    July: "Juillet",
    August: "Août",
    September: "Septembre",
    October: "Octobre",
    November: "Novembre",
    December: "Décembre"
  },

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
    letsGo: "Allons-y",
    takePhoto: "Prends\ncette photo",
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
    random: "Choisissez au hasard"
  }
}

export const french = info
