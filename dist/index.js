(() => {
  // src/cms/populate-external-data/index.ts
  var params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop)
  });
  var partnerId = params.pid;
  if (partnerId) {
    console.log("found partner id");
    const loader = document.getElementById("preloader-submit2");
    loader.style = "display: flex; opacity: 1";
    const state = { "pip": partnerId };
    const url = "https://www.lanzapartners.com/partner";
    history.pushState(state, "", url);
    window.fsAttributes = window.fsAttributes || [];
    window.fsAttributes.push([
      "cmsfilter",
      async (filtersInstances) => {
        const [filtersInstance] = filtersInstances;
        const { listInstance } = filtersInstance;
        const [firstItem] = listInstance.items;
        const itemTemplateElement = firstItem.element;
        const products = await fetchProducts();
        if (products.length === 0) {
          let noDealsSection = document.getElementById("nodeals");
          noDealsSection.className += " nodeals--show";
          const partnerInput = document.getElementById("partner_id");
          partnerInput.value = partnerId;
        } else {
          let pageSubtitle = document.getElementById("subtitle");
          const partnerName = products[0].name;
          const partnerEmail = products[0].email;
          pageSubtitle.innerHTML = `<b>Hey ${partnerName}!</b> Here are your deals. You can also <a href="https://www.lanzapartners.com/submit?email=${partnerEmail}">submit a new deal</a>.`;
          listInstance.clearItems();
          const newItems = products.map((product) => createItem(product, itemTemplateElement));
          await listInstance.addItems(newItems);
          const filterTemplateElement = filtersInstance.form.querySelector('[data-element="filter"]');
          if (!filterTemplateElement)
            return;
          const filtersWrapper = filterTemplateElement.parentElement;
          if (!filtersWrapper)
            return;
          filterTemplateElement.remove();
          const categories = collectCategories(products);
          for (const category of categories) {
            const newFilter = createFilter(category, filterTemplateElement);
            if (!newFilter)
              continue;
            filtersWrapper.append(newFilter);
          }
          filtersInstance.storeFiltersData();
          let affiliateSection = document.getElementById("affilliatePartner");
          affiliateSection.className += " affilliatepartner--show";
          const isAffiliate = products[0].affiliate;
          if (isAffiliate === "Y") {
            let affiliateLink = document.getElementById("affiliate-subtitle");
            affiliateLink.innerHTML = `${partnerName}, here is your affiliate link:<br> <u>https://www.lanzapartners.com?v=3${partnerId}</u>`;
            affiliateLink.className += " affiliatelink--show";
            let affiliateApply = document.getElementById("apply-affiliate");
            affiliateApply.className += " applyaffiliate--hide";
          }
          const dealCards = document.getElementById("deal-cards");
          dealCards.className += " dealcards--show";
        }
        loader.style = "display: none; opacity: 0";
      }
    ]);
  }
  var fetchProducts = async () => {
    try {
      const response = await fetch("https://4q9vih2n66.execute-api.us-east-1.amazonaws.com/default/LP_GetPartnerDeals-Website", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ partner_id: partnerId })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return [];
    }
  };
  var createItem = (product, templateElement) => {
    const newItem = templateElement.cloneNode(true);
    const address = newItem.querySelector('[data-element="address"]');
    const dateSubmitted = newItem.querySelector('[data-element="date-submitted"]');
    const dealType = newItem.querySelector('[data-element="deal-type"]');
    const dealStatus = newItem.querySelector('[data-element="deal-status"]');
    const lastActivity = newItem.querySelector('[data-element="last-activity"]');
    const sourceType = newItem.querySelector('[data-element="source-type"]');
    const clarificationLink = newItem.querySelector('[data-element="clar-url"]');
    const deal_notes = newItem.querySelector('[data-element="deal-notes"]');
    const color_line = newItem.querySelector('[data-element="color_line"]');
    if (address)
      address.textContent = product.address;
    if (dateSubmitted)
      dateSubmitted.textContent = product.date_submitted;
    if (dealType)
      dealType.textContent = product.deal_type;
    if (dealStatus)
      dealStatus.textContent = product.deal_status;
    if (lastActivity)
      lastActivity.textContent = product.last_activity_date;
    if (sourceType)
      sourceType.textContent = product.source_type;
    if (clarificationLink)
      clarificationLink.href = product.clarification_url;
    if (deal_notes)
      deal_notes.textContent = product.notes;
    if (sourceType)
      sourceType.setAttribute("style", `background:${product.color};`);
    if (color_line)
      color_line.setAttribute("style", `background:${product.color};`);
    return newItem;
  };
  var collectCategories = (products) => {
    const categories = /* @__PURE__ */ new Set();
    for (const { deal_type } of products) {
      categories.add(deal_type);
    }
    return [...categories];
  };
  var createFilter = (category, templateElement) => {
    const newFilter = templateElement.cloneNode(true);
    const label = newFilter.querySelector("span");
    const radio = newFilter.querySelector("input");
    if (!label || !radio)
      return;
    label.textContent = category;
    radio.value = category;
    return newFilter;
  };
})();
