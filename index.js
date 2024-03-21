const fs = require('fs');
const path = require('path');

const Stripe = require('stripe'); // Importing the Stripe SDK
let stripe = null;

if (process.env.STRIPE_TEST_MODE === 'false') {
  // Using Stripe production mode settings with the API key
  stripe = Stripe(process.env.STRIPE_KEY);
} else {
  // Using Stripe test mode settings
  stripe = new Stripe('sk_test_xyz', {
    host: 'localhost',
    protocol: 'http',
    port: 12111
  });
}

const bodyParser = require('body-parser'); // Importing the body-parser middleware

const stripeWebhookEnpoint = '/api/v1/stripe/checkout/webhook'; // Defining the endpoint for the Stripe webhook

module.exports = {
  options: {
    alias: 'stripeCheckout',
    i18n: {
      ns: 'stripeCheckout',
      browser: true
    },
    csrfExceptions: [ stripeWebhookEnpoint ]
  },
  bundle: {
    directory: 'modules',
    modules: getBundleModuleNames()
  },
  init(self) {
    const groupName = 'stripe'; // Defining the group name for the admin bar
    const itemsToAdd = [ 'stripe-checkout/session' ]; // Defining items to add to the admin bar

    // Checking if 'stripe' already exists in admin bar groups
    const existingStripeGroup = self.apos.adminBar.groups.find(
      group => group.name === groupName
    );

    const newStripeGroup = {
      name: groupName,
      label: 'Stripe',
      items: itemsToAdd
    };

    // Adding items to the existing 'stripe' group or creating a new group
    if (existingStripeGroup) {
      existingStripeGroup.items = existingStripeGroup.items.concat(itemsToAdd);
    } else {
      self.apos.adminBar.groups.push(newStripeGroup);
    }

    // Using body-parser middleware for the webhook endpoint
    self.apos.app.use(stripeWebhookEnpoint, bodyParser.raw({ type: '*/*' }));
  },
  routes(self) {
    return {
      post: {
        // Handler for POST requests to the webhook endpoint
        [stripeWebhookEnpoint]: async function (req, res) {
          /* console.log('-- -- API -- Stripe Checkout - Webhook');
          console.log('-- -- API -- Stripe Checkout - Webhook - req.body:', Buffer.from(req.body, 'base64').toString('ascii'));
          console.log('-- -- API -- Stripe Checkout - Webhook - req.headers:', req.headers); */

          let event;

          if (process.env.STRIPE_TEST_MODE === 'false') {
            try {
              // Constructing the Stripe event from the request body and headers
              event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET);
            } catch (error) {
              throw self.apos.error('invalid', `Stripe Webhook Endpoint Error: ${error.message}`, error);
            }
          } else {
            // Event object must be defined manually in the test mode
            event = {
              type: 'checkout.session.completed',
              data: { object: { id: 'cs_xyz' } }
            };
          }

          if (event.type === 'checkout.session.completed') {
            // Retrieve the checkout session details from Stripe
            const checkoutSession = await stripe.checkout.sessions.retrieve(event.data.object.id);

            // Create a new instance of the checkout session model
            const checkoutSessionInstance = self.apos.stripeCheckoutSession.newInstance();

            // Setting properties of the checkout session instance
            checkoutSessionInstance.slug = checkoutSession.id;
            // Storing the entire checkout session object
            checkoutSessionInstance.stripeCheckoutSessionObject = checkoutSession;

            // Converting Unix timestamp to ISO string format for created_timestamp property
            checkoutSessionInstance.stripeCheckoutSessionObject.created_timestamp = new Date(checkoutSession.created * 1000).toISOString();

            // Converting amounts from cents to dollars and setting properties accordingly
            checkoutSessionInstance.stripeCheckoutSessionObject.amount_subtotal = (checkoutSession.amount_subtotal / 100).toFixed(2);
            checkoutSessionInstance.stripeCheckoutSessionObject.amount_total = (checkoutSession.amount_total / 100).toFixed(2);

            // Retrieving line items for the checkout session from Stripe
            const lineItems = await stripe.checkout.sessions.listLineItems(
              event.data.object.id,
              {
                limit: 99
              }
            );

            // Calculating the total quantity of line items and setting the property
            checkoutSessionInstance.stripeCheckoutSessionObject.line_items_quantity_total = lineItems.data.reduce((sum, item) => sum + item.quantity, 0);

            // Looping through each line item and formatting amount properties
            lineItems.data.forEach(item => {
              [ 'amount_total', 'amount_subtotal', 'amount_discount', 'amount_tax' ].forEach(field => {
                item[field] = (item[field] / 100).toFixed(2);
              });
              item.price.unit_amount = (item.price.unit_amount / 100).toFixed(2);
            });

            // Storing line items object in the checkout session instance
            checkoutSessionInstance.stripeCheckoutSessionLineItemsObject = lineItems;

            // Inserting the checkout session instance into the database
            await self.apos.stripeCheckoutSession.insert(req, checkoutSessionInstance, { permissions: false });
          }
          return res.status(200).end();
        }
      }
    };
  },
  apiRoutes(self) {
    return {
      post: {
        // Handler for POST requests to create Stripe checkout sessions
        '/api/v1/stripe/checkout/sessions/create': async function (req) {
          try {
            // Create a new checkout session with the provided parameters
            const checkoutSession = await stripe.checkout.sessions.create({
              line_items: req.body.line_items,
              locale: 'en',
              mode: 'payment',
              success_url: req.body.success_url,
              cancel_url: req.body.cancel_url
            });
            // Return the URL of the created checkout session
            return checkoutSession.url;
          } catch (error) {
            req.res.status(500).send(error);
          }
        }
      }
    };
  }
};

function getBundleModuleNames() {
  return fs.readdirSync(path.resolve(__dirname, 'modules')).reduce((result, dir) => {
    if (dir.includes('stripe') && !(/(^|\/)\.[^/.]/g).test(dir)) {
      const subdirectories = fs.readdirSync(path.resolve(__dirname, `modules/${dir}`));
      subdirectories.forEach((subdir) => {
        if (!(/(^|\/)\.[^/.]/g).test(subdir)) {
          result.push(`${dir}/${subdir}`);
        }
      });
    }
    return result;
  }, []);
}
