const fs = require('fs');
const path = require('path');

const Stripe = require('stripe');
let stripe = null;

if (process.env.STRIPE_MOCK_TEST_MODE === 'true') {

  stripe = new Stripe('sk_test_xyz', {
    host: '127.0.0.1',
    protocol: 'http',
    port: 12111
  });
} else {

  stripe = Stripe(process.env.STRIPE_KEY);
}

const bodyParser = require('body-parser');

const stripeWebhookEndpoint = '/api/v1/stripe-checkout/webhook';

module.exports = {
  options: {
    alias: 'stripeCheckout',
    i18n: {
      ns: 'stripeCheckout',
      browser: true
    },
    csrfExceptions: [ stripeWebhookEndpoint ]
  },
  bundle: {
    directory: 'modules',
    modules: getBundleModuleNames()
  },
  init(self) {
    const groupName = 'stripe';
    const itemsToAdd = [ 'stripe-checkout/session' ];

    const existingStripeGroup = self.apos.adminBar.groups.find(
      group => group.name === groupName
    );

    const newStripeGroup = {
      name: groupName,
      label: 'Stripe',
      items: itemsToAdd
    };

    if (existingStripeGroup) {
      existingStripeGroup.items = existingStripeGroup.items.concat(itemsToAdd);
    } else {
      self.apos.adminBar.groups.push(newStripeGroup);
    }

    self.apos.app.use(stripeWebhookEndpoint, bodyParser.raw({ type: '*/*' }));
  },
  routes(self) {
    return {
      post: {
        [stripeWebhookEndpoint]: async function (req, res, next) {
          async function handleCheckoutSession(req, res) {
            try {
              if (!req.headers['stripe-signature']) {
                throw new Error('Stripe signature was not provided in the header.');
              }
              const event = await constructStripeEvent(req);
              if (event.type === 'checkout.session.completed') {
                const checkoutSession = await stripe.checkout.sessions.retrieve(event.data.object.id);
                const checkoutSessionInstance = createCheckoutSessionInstance(checkoutSession);
                await insertCheckoutSessionInstance(checkoutSessionInstance);
              }
              return res.status(200).end();
            } catch (error) {
              console.error('Error handling checkout session:', error);
              return res.status(500).send(error.message);
            }
          }

          async function constructStripeEvent(req) {
            if (process.env.STRIPE_MOCK_TEST_MODE === 'true') {
              return {
                type: 'checkout.session.completed',
                data: { object: { id: 'cs_xyz' } }
              };
            } else {
              return stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET);
            }
          }

          function createCheckoutSessionInstance(checkoutSession) {
            const checkoutSessionInstance = self.apos.stripeCheckoutSession.newInstance();
            checkoutSessionInstance.slug = checkoutSession.id;
            checkoutSessionInstance.stripeCheckoutSessionObject = checkoutSession;
            checkoutSessionInstance.stripeCheckoutSessionObject.created_timestamp = new Date(checkoutSession.created * 1000).toISOString();
            checkoutSessionInstance.stripeCheckoutSessionObject.amount_subtotal = (checkoutSession.amount_subtotal / 100).toFixed(2);
            checkoutSessionInstance.stripeCheckoutSessionObject.amount_total = (checkoutSession.amount_total / 100).toFixed(2);
            return checkoutSessionInstance;
          }

          async function insertCheckoutSessionInstance(checkoutSessionInstance) {
            const lineItems = await stripe.checkout.sessions.listLineItems(checkoutSessionInstance.slug, { limit: 99 });
            checkoutSessionInstance.stripeCheckoutSessionObject.line_items_quantity_total = lineItems.data.reduce((sum, item) => sum + item.quantity, 0);
            lineItems.data.forEach(item => {
              [ 'amount_total', 'amount_subtotal', 'amount_discount', 'amount_tax' ].forEach(field => {
                item[field] = (item[field] / 100).toFixed(2);
              });
              item.price.unit_amount = (item.price.unit_amount / 100).toFixed(2);
            });
            checkoutSessionInstance.stripeCheckoutSessionLineItemsObject = lineItems;
            await self.apos.stripeCheckoutSession.insert(req, checkoutSessionInstance, { permissions: false });
          }

          await handleCheckoutSession(req, res);
        }
      }
    };
  },
  apiRoutes(self) {
    return {
      post: {
        '/api/v1/stripe-checkout/sessions/create': async function (req) {
          try {
            return await stripe.checkout.sessions.create(req.body);
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
