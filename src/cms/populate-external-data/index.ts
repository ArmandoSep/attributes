import type { CMSFilters } from '../../types/CMSFilters';
// import type { CMSList } from '../../types/CMSList';
import type { Product } from './types';


// const partnerId = "sK9snPs90"


// Get query params
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
const partnerId= params.pid;

if(partnerId ) {
  console.log('found partner id');

  // Show loader
  const loader  = document.getElementById('preloader-submit2') as HTMLDivElement;
  loader.style="display: flex; opacity: 1";

  // Clean url
  const state = {'pip': partnerId};
	const url = 'https://www.lanzapartners.com/partner';
	history.pushState(state, '', url);


  /**
   * Populate CMS Data from an external API.
   */
  window.fsAttributes = window.fsAttributes || [];
  window.fsAttributes.push([
    'cmsfilter', 
    async (filtersInstances: CMSFilters[]) => {

      // Get the filters instance
      const [filtersInstance] = filtersInstances;
      
      // Get the list instance
      const {listInstance} = filtersInstance;
      //const [listInstance] = listInstances;

      // Save a copy of the template
      const [firstItem] = listInstance.items;
      const itemTemplateElement = firstItem.element;

      // Fetch external data
      const products = await fetchProducts();

      if (products.length === 0 ){
        // Show no deals section
        let noDealsSection = document.getElementById('nodeals') as HTMLDivElement;
        noDealsSection.className += " nodeals--show";

        // Fill out partner id form
        const partnerInput = document.getElementById("partner_id") as HTMLInputElement;
        partnerInput.value = partnerId;
      } 
      else {

        // Change the subtitle
        let pageSubtitle = document.getElementById('subtitle') as HTMLDivElement;
        const partnerName = products[0].name
        const partnerEmail = products[0].email
        pageSubtitle.innerHTML = `<b>Hey ${ partnerName }!</b> Here are your deals. You can also <a href="https://www.lanzapartners.com/submit?email=${ partnerEmail }">submit a new deal</a>.`;

        // Remove existing items
        listInstance.clearItems();

        // Create the new items
        const newItems = products.map((product) => createItem(product, itemTemplateElement));

        // Populate the list
        await listInstance.addItems(newItems);

        // Get the template filter
        const filterTemplateElement = filtersInstance.form.querySelector<HTMLLabelElement>('[data-element="filter"]');
        if (!filterTemplateElement) return;

        // Get the parent wrapper
        const filtersWrapper = filterTemplateElement.parentElement;
        if (!filtersWrapper) return;

        // Remove the template from the DOM
        filterTemplateElement.remove();

        // Collect the categories
        const categories = collectCategories(products);

        // Create the new filters and append the to the parent wrapper
        for (const category of categories) {
          const newFilter = createFilter(category, filterTemplateElement);
          if (!newFilter) continue;

          filtersWrapper.append(newFilter);
        }

        // Sync the CMSFilters instance with the new created filters
        filtersInstance.storeFiltersData();

        
        // // Affiliate section
        // Show section
        let affiliateSection = document.getElementById('affilliatePartner') as HTMLDivElement;
        affiliateSection.className += " affilliatepartner--show";
        const isAffiliate = products[0].affiliate

        if (isAffiliate === "Y"){
          // If affiliate, show affiliate link
          let affiliateLink = document.getElementById('affiliate-subtitle') as HTMLDivElement;
          affiliateLink.innerHTML = `${ partnerName }, here is your affiliate link:<br> <u>https://www.lanzapartners.com?v=3${ partnerId }</u>`;
          affiliateLink.className += " affiliatelink--show";
          
          // Hide apply for affiliate
          let affiliateApply = document.getElementById('apply-affiliate') as HTMLDivElement;
          affiliateApply.className += " applyaffiliate--hide";
        }
        

        // Fill out partner id form
        //const partnerInput = document.getElementById("partner_id") as HTMLInputElement;
        //partnerInput.value = partnerId;

        // Show deal cards
        const dealCards = document.getElementById("deal-cards") as HTMLDivElement;
        dealCards.className += " dealcards--show";
      
      }

      // hide preloader
      loader.style="display: none; opacity: 0";

    },
  ]);
};


/**
 * Fetches fake products from Fake Store API.
 * @returns An array of {@link Product}.
 */
const fetchProducts = async () => {
  try {
    const response = await fetch('https://4q9vih2n66.execute-api.us-east-1.amazonaws.com/default/LP_GetPartnerDeals-Website', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({partner_id: partnerId})
    });
    const data: Product[] = await response.json();
    return data;
  } catch (error) {
    return [];
  }
};

/**
 * Creates an item from the template element.
 * @param product The product data to create the item from.
 * @param templateElement The template element.
 *
 * @returns A new Collection Item element.
 */
const createItem = (product: Product, templateElement: HTMLDivElement) => {
  // Clone the template element
  const newItem = templateElement.cloneNode(true) as HTMLDivElement;

  // Query inner elements
  const address = newItem.querySelector<HTMLDivElement>('[data-element="address"]');
  const dateSubmitted = newItem.querySelector<HTMLDivElement>('[data-element="date-submitted"]');
  const dealType = newItem.querySelector<HTMLDivElement>('[data-element="deal-type"]');
  const dealStatus = newItem.querySelector<HTMLDivElement>('[data-element="deal-status"]');
  const lastActivity = newItem.querySelector<HTMLDivElement>('[data-element="last-activity"]');
  const sourceType = newItem.querySelector<HTMLDivElement>('[data-element="source-type"]');
  const clarificationLink = newItem.querySelector<HTMLAnchorElement>('[data-element="clar-url"]');
  const deal_notes = newItem.querySelector<HTMLParagraphElement>('[data-element="deal-notes"]');
  const color_line = newItem.querySelector<HTMLDivElement>('[data-element="color_line"]');

  // Populate inner elements
  if (address) address.textContent = product.address;
  if (dateSubmitted) dateSubmitted.textContent = product.date_submitted;
  if (dealType) dealType.textContent = product.deal_type;
  if (dealStatus) dealStatus.textContent = product.deal_status;
  if (lastActivity) lastActivity.textContent = product.last_activity_date;
  if (sourceType) sourceType.textContent = product.source_type;
  if (clarificationLink) clarificationLink.href = product.clarification_url;
  if (deal_notes) deal_notes.textContent = product.notes;
  if (sourceType) sourceType.setAttribute("style", `background:${product.color};`);
  if (color_line) color_line.setAttribute("style", `background:${product.color};`);
  return newItem;
};

/**
 * Collects all the categories from the products' data.
 * @param products The products' data.
 *
 * @returns An array of {@link Product} categories.
 */
const collectCategories = (products: Product[]) => {
  const categories: Set<Product['deal_type']> = new Set();

  for (const { deal_type } of products) {
    categories.add(deal_type);
  }

  return [...categories];
};

/**
 * Creates a new radio filter from the template element.
 * @param category The filter value.
 * @param templateElement The template element.
 *
 * @returns A new category radio filter.
 */
const createFilter = (category: Product['deal_type'], templateElement: HTMLLabelElement) => {
  // Clone the template element
  const newFilter = templateElement.cloneNode(true) as HTMLLabelElement;

  // Query inner elements
  const label = newFilter.querySelector('span');
  const radio = newFilter.querySelector('input');

  if (!label || !radio) return;

  // Populate inner elements
  label.textContent = category;
  radio.value = category;

  return newFilter;
};
