const assert = require('assert');
const t = require('apostrophe/test-lib/test');

process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET = 'whsec_xyz';

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
    assert(apos.readOnlyField);
  });

  it('should properly instantiate the checkout and checkout session modules', function () {
    assert(apos.stripeCheckout);
    assert(apos.stripeCheckoutSession);
  });

  it('should create a test checkout session and return a valid URL', async function () {
    let response;

    try {
      response = await apos.http.post('/api/v1/stripe/checkout/sessions/create', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: {
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
        }
      });
    } catch (error) {
      console.error('An error occurred:', error);
      throw error;
    }

    function isURL(string) {
      const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
      return urlRegex.test(string);
    }

    assert.strictEqual(isURL(response), true);
  });

  it('should send request to webhook endpoint and save the completed checkout session to database', async function () {
    let response;

    try {
      await apos.http.post('/api/v1/stripe/checkout/webhook', {
        headers: {
          'stripe-signature': 't=1711059559,v1=9dd216ac7ffc2d07d3edd4b4de4a67200705c52f435e92bc3b21a605f3af91af,v0=4251a0f2bbd73dd1622bb01aedb334cab148be2a84bb3b1daea4af931e0172e2'
        },
        body: {
          id: 'evt_xyz',
          object: 'event'
        }
      });
    } catch (error) {
      console.error('An error occurred:', error);
      throw error;
    }

    const sessionDoc = await apos.stripeCheckoutSession.find(apos.task.getReq(), {
      slug: 'cs_xyz',
      aposMode: 'published'
    }).toObject();

    assert(sessionDoc);
  });
});
