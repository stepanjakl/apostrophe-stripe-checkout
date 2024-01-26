const fs = require('fs')
const path = require('path')

const Stripe = require('stripe')
const stripe = Stripe(process.env.STRIPE_KEY)

// Use body-parser to retrieve the raw body as a buffer
const bodyParser = require('body-parser')

module.exports = {
    options: {
        alias: 'stripeCheckout',
        /* i18n: {
            ns: 'aposStripeCheckout',
            browser: true
        } */
        csrfExceptions: ['/api/v1/stripe/checkout/webhook']
    },
    bundle: {
        directory: 'modules',
        modules: getBundleModuleNames()
    },
    init(self) {
        console.log('-- -- stripeCheckout init')
        // self.apos.adminBar.add()
        console.log('-- --- stripeCheckout - adminBar:', self.apos.adminBar.groups)
        const groupName = 'stripe'
        const itemsToAdd = [
            'stripe-checkout/session',
            'stripe/payment-intent'
        ]

        // Check if 'stripe' already exists in self.apos.adminBar.groups
        const existingStripeGroup = self.apos.adminBar.groups.find(group => group.name === groupName)

        const newStripeGroup = {
            name: groupName,
            label: 'Stripe',
            items: itemsToAdd
        }

        // If 'stripe' exists, add items to the existing one; otherwise, create a new group
        if (existingStripeGroup) {
            existingStripeGroup.items = existingStripeGroup.items.concat(itemsToAdd)
        } else {
            self.apos.adminBar.groups.push(newStripeGroup)
        }

        console.log('-- --- stripeCheckout - adminBar:', self.apos.adminBar.groups)

        self.apos.app.use('/api/v1/stripe/checkout/webhook', bodyParser.raw({ type: '*/*' }))
        // self.apos.app.use(bodyParser.json({ type: 'application/json' }))
    },
    /* middleware(self, options) {
        return {
            bodyParserRaw(req, res, next) {
                console.log('-- -- Middleware -- Stripe Checkout - bodyParserRaw')
                // Returns middleware that parses all bodies as a Buffer and only looks at requests where the Content-Type header matches the type option.

                return next()
            }
        }
    }, */
    routes(self) {
        return {
            post: {
                // POST /api/v1/stripe/checkout/webhook
                '/api/v1/stripe/checkout/webhook': async function (req, res, options) {

                    // self.apos.app.use(bodyParser.raw({ type: 'application/json' }))

                    // self.apos.express.raw({ type: 'application/json' })

                    console.log('-- -- API -- Stripe Checkout - Webhook')
                    console.log('-- -- API -- Stripe Checkout - Webhook - options:', options)
                    console.log('-- -- API -- Stripe Checkout - Webhook - req.body:', req.body)
                    console.log('-- -- API -- Stripe Checkout - Webhook - req.headers:', req.headers)
                    console.log('-- -- API -- Stripe Checkout - Webhook - req.get(stripe-signature):', req.get('stripe-signature'))

                    let event

                    try {
                        event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET)
                    } catch (error) {
                        throw self.apos.error('invalid', `Stripe Webhook Endpoint Error: ${error.message}`, error)
                    }

                    if (event.type === 'checkout.session.completed') {

                        console.log('-- -- API -- Stripe Checkout - Webhook - event.type === checkout.session.completed:', event)

                        const checkoutSessionWithLineItems = await stripe.checkout.sessions.retrieve(
                            event.data.object.id,
                            {
                                expand: ['line_items'],
                            }
                        )

                        // const lineItems = checkoutSessionWithLineItems.line_items


                        let checkoutSessionInstance = self.apos.stripeCheckoutSession.newInstance()
                        // checkoutSessionInstance._id = checkoutSessionWithLineItems.id
                        checkoutSessionInstance.title = checkoutSessionWithLineItems.id
                        checkoutSessionInstance.slug = checkoutSessionWithLineItems.id
                        checkoutSessionInstance.status = checkoutSessionWithLineItems.status
                        checkoutSessionInstance.checkoutSessionData = JSON.stringify(checkoutSessionWithLineItems)

                        console.log('-- -- API -- Stripe Checkout - Webhook - checkoutSessionInstance:', checkoutSessionInstance)

                        // console.log('-- -- API -- Stripe Checkout - Webhook - self.apos.task.getAdminReq:', self.apos.task.getAdminReq())

                        await self.apos.stripeCheckoutSession.insert(self.apos.task.getAdminReq(), checkoutSessionInstance)


                    }

                    return res.status(200).end()
                }
            }
        }
    },
    apiRoutes(self) {
        return {
            get: {
                // GET /api/v1/stripe-checkout/test
                async test(req) {
                    return 'test'
                }
            },
            post: {
                // POST /api/v1/stripe/checkout/sessions
                '/api/v1/stripe/checkout/sessions': async function (req, options) {
                    console.log('-- -- API -- Stripe Checkout - Create Session')
                    console.log('-- -- API -- Stripe Checkout - Create Session - options:', options)
                    console.log('-- -- API -- Stripe Checkout - Create Session - req.body:', req.body)
                    console.log('-- -- API -- Stripe Checkout - Create Session - STRIPE_KEY:', process.env.STRIPE_KEY)

                    const checkoutSession = await stripe.checkout.sessions.create({
                        line_items: [
                            {
                                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                                price: 'price_1ObRtCE1ozL6C4r7ChMax4uI',
                                quantity: 1,
                            },
                        ],
                        mode: 'payment',
                        success_url: `https://stepanjakl.com`,
                        cancel_url: `https://stepanjakl.com`,
                    })

                    console.log('-- -- API -- Stripe Checkout - Create Session - session.url:', checkoutSession.url)



                    return req.res.redirect(303, checkoutSession.url)

                    // return 'Stripe Checkout - Create Session'
                }
            }
        }
    }
}

/* function getBundleModuleNames() {
    const source = path.join(__dirname, './modules/stripe-checkout')
    console.log('-- -- source:', source)
    return fs
        .readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => `stripe-checkout/${dirent.name}`)
} */

function getBundleModuleNames() {
    return fs.readdirSync(path.resolve(__dirname, 'modules')).reduce((result, dir) => {
        if (dir.includes('stripe') && !(/(^|\/)\.[^/.]/g).test(dir)) {
            const subdirectories = fs.readdirSync(path.resolve(__dirname, `modules/${dir}`))
            subdirectories.forEach((subdir) => {
                if (!(/(^|\/)\.[^/.]/g).test(subdir)) {
                    result.push(`${dir}/${subdir}`)
                }
            })
        }
        return result
    }, [])
}

console.log('-- -- getBundleModuleNames:', getBundleModuleNames())
