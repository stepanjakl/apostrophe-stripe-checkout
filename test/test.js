const assert = require('assert');
const t = require('apostrophe/test-lib/test');

process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET = 'whsec_xyz';
process.env.STRIPE_MOCK_TEST_MODE = 'true';

describe('Apostrophe - Stripe Checkout Integration Tests', function () {
  let apos;

  this.timeout(t.timeout);

  after(async function () {
    await t.destroy(apos);
  });

  before(async function () {
    apos = await t.create({
      baseUrl: 'http://localhost:7770',
      modules: {
        '@apostrophecms/express': {
          options: {
            port: 7770,
            session: {
              secret: 'secret'
            },
            csrfExceptions: [ '/api/v1/stripe/checkout/sessions/create' ]
          }
        },
        'read-only-field': {},
        'stripe-checkout': {},
        'stripe-checkout/session': {}
      }
    });
  });

  it('should properly instantiate the read-only field module', function () {
    assert(apos.modules['read-only-field'], 'Read-only field module should be instantiated');
  });

  it('should properly instantiate the checkout and checkout session modules', function () {
    assert(apos.modules['stripe-checkout'], 'Stripe checkout module should be instantiated');
    assert(apos.modules['stripe-checkout/session'], 'Stripe checkout session module should be instantiated');
  });

  it('should connect to Stripe API', async function() {
    const Stripe = require('stripe');
    const stripe = new Stripe('sk_test_xyz', {
      host: '127.0.0.1',
      protocol: 'http',
      port: 12111,
      maxNetworkRetries: 3,
      timeout: 10 * 1000
    });

    try {
      const paymentMethods = await stripe.paymentMethods.list({ limit: 1 });
      assert.strictEqual(paymentMethods.data.length > 0, true, 'Should connect to Stripe API successfully');
    } catch (error) {
      console.error('Error connecting to Stripe API:', error);
      if (error.detail?.errors?.length > 0) {
        console.error('Error detail:', ...error.detail.errors);
      }
      throw error;
    }
  });

  it('should create a test checkout session and return a valid URL', async function () {
    let response;

    try {
      response = await apos.http.post('/api/v1/stripe/checkout/sessions/create', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          line_items: [
            {
              price: 'price_test_abc',
              quantity: 2
            },
            {
              price: 'price_test_xyz',
              quantity: 1
            }
          ],
          success_url: apos.baseUrl,
          cancel_url: apos.baseUrl
        })
      });
    } catch (error) {
      console.error('An error occurred:', error);
      throw error;
    }

    assert.strictEqual(typeof response, 'object', 'Response should be an object');
    assert(response.id, 'Response should contain an "id" parameter');
  });

  it('should send request to webhook endpoint and save the completed checkout session to the database', async function () {
    try {
      await apos.http.post('/api/v1/stripe/checkout/webhook', {
        headers: {
          'stripe-signature': 't=1711059559,v1=9dd216ac7ffc2d07d3edd4b4de4a67200705c52f435e92bc3b21a605f3af91af,v0=4251a0f2bbd73dd1622bb01aedb334cab148be2a84bb3b1daea4af931e0172e2'
        },
        body: JSON.stringify({
          id: 'evt_xyz',
          object: 'event'
        })
      });
    } catch (error) {
      console.error('An error occurred:', error);
      throw error;
    }

    const sessionDoc = await apos.modules['stripe-checkout/session'].find(apos.task.getReq(), {
      slug: 'cs_xyz',
      aposMode: 'published'
    }).toObject();

    assert(sessionDoc, 'The session document should be saved in the database');
    assert.strictEqual(sessionDoc.slug, 'cs_xyz', 'Session document should have the correct slug');
  });
});
