import { register } from "@shopify/web-pixels-extension";

register(({ analytics, browser, settings, init }) => {
  // See https://shopify.dev/api/pixels/pixel-extension#app-web-pixels
  // See https://shopify.dev/apps/marketing/pixels/getting-started

  //console.log(`Web Pixel register: analytics ${JSON.stringify(analytics, null, 4)}`);
  //console.log(`Web Pixel register: browser ${JSON.stringify(browser, null, 4)}`);
  console.log(`Web Pixel register: settings ${JSON.stringify(settings, null, 4)}`);
  console.log(`Web Pixel register: init ${JSON.stringify(init, null, 4)}`);

  // See https://shopify.dev/api/pixels/customer-events
  analytics.subscribe('all_events', (event) => {
    console.log(`Web Pixel event received: ${JSON.stringify(event, null, 4)}`);

    const name = event.name;

    const ga4Id = `${settings.ga4Id}`;
    const ga4Sec = `${settings.ga4Sec}`;

    switch (name) {
      case 'checkout_started':
        // See https://shopify.dev/api/pixels/customer-events#checkout_started
        // THIS EVENT CANNOT BE PASSED BY GA TAG IN THEME APP EXTENSION, ONLY BY WEB PIXEL DURING CHECKOUT PROCESS.

        // Send event data to GA4 (begin_checkout)
        // See https://developers.google.com/tag-manager/ecommerce-ga4
        // See https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?hl=ja&client_type=gtag

        const measurement_id = ga4Id;
        const api_secret = ga4Sec;

        const items = event_data.data.checkout.lineItems.map((item, i) => {
          return {
            "item_name": `${item.title}`,
            "item_id": `${item.id}`,
            "price": item.variant.price.amount,
            "item_brand": `${item.variant.product.vendor}`,
            //"item_category": "Apparel",
            //"item_category2": "Mens",
            //"item_category3": "Shirts",
            //"item_category4": "Tshirts",
            "item_variant": `${item.variant.product.title}`,
            "item_list_name": `${event_data.context.document.location.href}`,
            "item_list_id": `${event_data.context.document.location.pathname}`,
            "index": i,
            "quantity": item.quantity
          }
        });

        const body = {
          client_id: `${event_data.clientId}`,
          events: [{
            name: 'begin_checkout',
            params: {
              ecommerce: {
                items: []
              }
            },
          }]
        };

        body.params.ecommerce.items = items;

        consolr.log(`Web Pixel sending 'begin_checkout' of GA4... ${JSON.stringify(body, null, 4)}`);

        fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurement_id}&api_secret=${api_secret}`, {
          method: "POST",
          body: JSON.stringify(body)
        });

        return;
      default:
        // Other events
        return;
    }

  });

});
