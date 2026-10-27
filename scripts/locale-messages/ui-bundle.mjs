import { siteConfig } from "../../lib/site-config.ts";

/** Structured UI messages (non-catalog) for en / es / eu */
const sharedValidation = {
  en: {
    chooseArrivalDate: "Choose an arrival date.",
    datePast: "Choose a date that has not already passed.",
    closedWeekdays:
      "The cider house is open Thursday to Sunday. Monday to Wednesday are closed.",
    chooseArrivalTime: "Choose an arrival time.",
    adultsRange: "Adults must be between {min} and {max}.",
    childrenRange: "Children must be between {min} and {max}.",
    nameRequired: "Enter the name of the person making the request.",
    emailInvalid: "Enter a valid email address.",
    phoneInvalid: "Enter a telephone number with 8 to 15 digits.",
    notesMax: "Keep notes to 800 characters.",
    consentLive: "Confirm that you agree to submit this reservation request.",
    consentPreview:
      "Confirm that you understand this form does not send a reservation.",
    lookupReference:
      "Enter your booking reference exactly as shown (ITU- followed by 10 letters or numbers).",
    lookupContact:
      "Enter the email address or telephone number used when booking.",
    cancelReason: "Choose a reason for cancellation.",
    cancelMessageMax: "Keep the message to 800 characters.",
    formGeneric: "Check the form and try again.",
  },
  es: {
    chooseArrivalDate: "Elija una fecha de llegada.",
    datePast: "Elija una fecha que no haya pasado ya.",
    closedWeekdays:
      "La sidrería abre de jueves a domingo. De lunes a miércoles permanece cerrada.",
    chooseArrivalTime: "Elija una hora de llegada.",
    adultsRange: "Los adultos deben ser entre {min} y {max}.",
    childrenRange: "Los niños deben ser entre {min} y {max}.",
    nameRequired: "Indique el nombre de la persona que realiza la solicitud.",
    emailInvalid: "Introduzca una dirección de correo válida.",
    phoneInvalid: "Introduzca un teléfono con entre 8 y 15 dígitos.",
    notesMax: "Limite las notas a 800 caracteres.",
    consentLive: "Confirme que acepta enviar esta solicitud de reserva.",
    consentPreview:
      "Confirme que entiende que este formulario no envía una reserva.",
    lookupReference:
      "Introduzca su referencia tal como aparece (ITU- seguido de 10 letras o números).",
    lookupContact:
      "Introduzca el correo o teléfono usados al reservar.",
    cancelReason: "Elija un motivo de cancelación.",
    cancelMessageMax: "Limite el mensaje a 800 caracteres.",
    formGeneric: "Revise el formulario e inténtelo de nuevo.",
  },
  eu: {
    chooseArrivalDate: "Aukeratu iristeko data.",
    datePast: "Aukeratu oraindik iragazi ez den data bat.",
    closedWeekdays:
      "Sagardotegia ostegunetik igandera irekita dago. Astelehenetik asteazkenera itxita.",
    chooseArrivalTime: "Aukeratu iristeko ordua.",
    adultsRange: "Helduak {min} eta {max} artean egon behar dira.",
    childrenRange: "Haurrak {min} eta {max} artean egon behar dira.",
    nameRequired: "Idatzi eskaera egiten duen pertsonaren izena.",
    emailInvalid: "Idatzi baliozko helbide elektroniko bat.",
    phoneInvalid: "Idatzi 8 eta 15 zifra arteko telefono zenbaki bat.",
    notesMax: "Oharrak 800 karaktere artean mantendu.",
    consentLive: "Berretsi erreserba eskaera bidaltzea onartzen duzula.",
    consentPreview:
      "Berretsi formulario honek ez duela erreserbarik bidaltzen.",
    lookupReference:
      "Idatzi zure erreferentzia agertzen den bezala (ITU- eta 10 hizki edo zenbaki).",
    lookupContact: "Idatzi erreserban erabilitako posta edo telefonoa.",
    cancelReason: "Aukeratu ezeztatzeko arrazoia.",
    cancelMessageMax: "Mezua 800 karaktere artean mantendu.",
    formGeneric: "Egiaztatu formularioa eta saiatu berriro.",
  },
};

function bundle(locale) {
  const v = sharedValidation[locale];
  const isEn = locale === "en";
  const isEs = locale === "es";

  return {
    meta: {
      title: isEn
        ? "Iturrieta Sagardotegia | Basque Cider House"
        : isEs
          ? "Iturrieta Sagardotegia | Sagardotegi vasco"
          : "Iturrieta Sagardotegia | Euskal sagardotegia",
      description: isEn
        ? siteConfig.description
        : isEs
          ? "Descubra Iturrieta, sidrería familiar en el campo vasco. Granja, sidra natural, txotx e información de visita."
          : "Ezagutu Iturrieta, baserriko sagardotegia. Baserria, sagardo naturala, txotx eta bisita-informazioa.",
    },
    layout: {
      skipToContent: isEn
        ? "Skip to main content"
        : isEs
          ? "Saltar al contenido principal"
          : "Joan edukira",
      header: {
        primaryNavAria: isEn ? "Primary" : isEs ? "Principal" : "Nagusia",
        bookCta: isEn ? "Book a Visit" : isEs ? "Reservar visita" : "Bisita erreserbatu",
      },
      footer: {
        estateLine: "Caserío Goikola · Est. 1894 · Araba",
        blurb: isEn
          ? "Ancestral natural cider, biodynamic orchards, and rustic open-fire dining set deep in the mist-crowned valley of Aramaio."
          : isEs
            ? "Sidra natural ancestral, huertos biodinámicos y cocina rústica a la brasa en el valle de Aramaio."
            : "Sagardo natural arbasokoa, baserri biodinamikoak eta su-kosteko otelaritza Aramaio bailaran.",
        badgeDop: "Euskal Sagardoa DOP",
        badgeOrganic: isEn
          ? "Ekolur Organic Certified"
          : isEs
            ? "Certificación ecológica Ekolur"
            : "Ekolur ziurtagiri ekologikoa",
        estateNavTitle: isEn
          ? "Sanctuary & Estate"
          : isEs
            ? "Santuario y finca"
            : "Baserria",
        reachingTitle: isEn
          ? "Reaching The Valley"
          : isEs
            ? "Cómo llegar al valle"
            : "Bailararako bidea",
        reachingBody: isEn
          ? "Nestled at the foot of Mount Anboto. Accessible via the A-2620 scenic pass. 35 minutes from Vitoria-Gasteiz and 50 minutes from Bilbao and Donostia-San Sebastián."
          : isEs
            ? "Anboto mendiko oinean. A-2620 bide eskénikoaren bidez. 35 min Gasteiztik eta 50 min Bilbotik eta Donostiatik."
            : "Anboto mendiko magalean. A-2620 bidearen bidez. 35 min Gasteiztik, 50 min Bilbo eta Donostiatik.",
        gpsLabel: isEn
          ? "Orchard GPS & Arrival"
          : isEs
            ? "GPS del huerto y llegada"
            : "Baratze GPS eta iristea",
        directionsCta: isEn
          ? "View Directions & Shuttle Service"
          : isEs
            ? "Ver indicaciones y lanzadera"
            : "Ikusi norabideak eta shuttlea",
        copyright: isEn
          ? "© 2026 {legalName}. All rights reserved. Slow living in Euskal Herria."
          : isEs
            ? "© 2026 {legalName}. Todos los derechos reservados. Vida pausada en Euskal Herria."
            : "© 2026 {legalName}. Eskubide guztiak erreserbatuta. Bizimodura lasaia Euskal Herrian.",
        privacyLink: isEn
          ? "Privacy Policy"
          : isEs
            ? "Política de privacidad"
            : "Pribatutasun-politika",
        termsLink: isEn
          ? "Terms of Hospitality"
          : isEs
            ? "Condiciones de hospitalidad"
            : "Ostatu-baldintzak",
        pressLink: isEn ? "Press & Trade" : isEs ? "Prensa y profesionales" : "Prentsa eta profesionalak",
      },
      mobile: {
        openMenu: isEn ? "Open menu" : isEs ? "Abrir menú" : "Ireki menua",
        closeMenu: isEn ? "Close menu" : isEs ? "Cerrar menú" : "Itxi menua",
        mobileNavAria: isEn ? "Mobile" : isEs ? "Móvil" : "Mugikorra",
      },
    },
    languages: {
      en: "English",
      es: "Español",
      eu: "Euskara",
      switchLabel: isEn ? "Language" : isEs ? "Idioma" : "Hizkuntza",
      switchAria: isEn
        ? "Choose site language"
        : isEs
          ? "Elegir idioma del sitio"
          : "Aukeratu webgunearen hizkuntza",
    },
    notFound: {
      eyebrow: isEn ? "Page not found" : isEs ? "Página no encontrada" : "Orria ez da aurkitu",
      title: isEn
        ? "This path does not lead to the orchard."
        : isEs
          ? "Este camino no lleva al huerto."
          : "Bide honek ez du baratzeraino eramaten.",
      body: isEn
        ? "The page you requested is not part of this site yet. Return to the homepage to continue exploring the farm, cellar, and table."
        : isEs
          ? "La página solicitada aún no forma parte de este sitio. Vuelva al inicio para seguir explorando la finca, la bodega y la mesa."
          : "Eskatutako orria ez dago oraindik gune honetan. Itzuli hasierara baserria, upeltegia eta mahaia ezagutzen jarraitzeko.",
      homeCta: isEn ? "Back to homepage" : isEs ? "Volver al inicio" : "Itzuli hasierara",
    },
    validation: v,
    customerCopy: {
      homeBookingCtaLive: isEn
        ? "Online table requests are open when the form shows live submission on the review step."
        : isEs
          ? "Las solicitudes en línea están abiertas cuando el formulario muestra envío en vivo en la revisión."
          : "Lineako eskaerak irekita daude formularioak bidalketa zuzena erakusten duenean.",
      homeBookingCtaPreview: isEn
        ? "The booking form is preview-only until the farm enables the reservation database."
        : isEs
          ? "El formulario es solo vista previa hasta que la finca active la base de datos de reservas."
          : "Erreserba-formularioa aurrebista soilik da baserriak datubasea gaitu arte.",
      faqBookLink: isEn ? "Book a Visit" : isEs ? "Reservar visita" : "Bisita erreserbatu",
    },
    home: {
      hero: {
        titleLine1: isEn
          ? "From our apple trees"
          : isEs
            ? "De nuestros manzanos"
            : "Gure sagarrondotik",
        titleLine2: isEn ? "to your table." : isEs ? "a su mesa." : "zure mahaira.",
        bookCta: isEn ? "Book a Visit" : isEs ? "Reservar visita" : "Bisita erreserbatu",
        storyCta: isEn
          ? "Discover Our Story"
          : isEs
            ? "Descubra nuestra historia"
            : "Ezagutu gure istorioa",
      },
    },
  };
}

export const uiByLocale = {
  en: bundle("en"),
  es: bundle("es"),
  eu: bundle("eu"),
};
