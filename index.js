const fs = require('fs')
const path = require('path')

const Stripe = require('stripe')
const stripe = Stripe(process.env.STRIPE_KEY)

// Use body-parser to retrieve the raw body as a buffer
const bodyParser = require('body-parser')

const stripeWebhookEnpoint = '/api/v1/stripe/checkout/webhook'

module.exports = {
    options: {
        alias: 'stripeCheckout',
        i18n: {
            ns: 'stripeCheckout',
            browser: true
        },
        csrfExceptions: [stripeWebhookEnpoint]
    },
    bundle: {
        directory: 'modules',
        modules: getBundleModuleNames()
    },
    init(self) {
        const groupName = 'stripe'
        const itemsToAdd = ['stripe-checkout/session']

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

        self.apos.app.use(stripeWebhookEnpoint, bodyParser.raw({ type: '*/*' }))
    },
    routes(self) {
        return {
            post: {
                // POST /api/v1/stripe/checkout/webhook
                [stripeWebhookEnpoint]: async function (req, res, options) {
                    console.log('-- -- API -- Stripe Checkout - Webhook')
                    console.log('-- -- API -- Stripe Checkout - Webhook - options:', options)
                    console.log('-- -- API -- Stripe Checkout - Webhook - req.body:', req.body)
                    console.log('-- -- API -- Stripe Checkout - Webhook - req.headers:', req.headers)

                    let event

                    try {
                        event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET)
                    } catch (error) {
                        throw self.apos.error('invalid', `Stripe Webhook Endpoint Error: ${error.message}`, error)
                    }

                    if (event.type === 'checkout.session.completed') {

                        const checkoutSession = await stripe.checkout.sessions.retrieve(
                            event.data.object.id,
                            /* {
                                expand: ['line_items'],
                            } */
                        )

                        let checkoutSessionInstance = self.apos.stripeCheckoutSession.newInstance()

                        checkoutSessionInstance.slug = checkoutSession.id

                        checkoutSessionInstance.stripeCheckoutSessionObject = checkoutSession
                        checkoutSessionInstance.stripeCheckoutSessionObject.created_timestamp = new Date(checkoutSession.created * 1000).toISOString()
                        checkoutSessionInstance.stripeCheckoutSessionObject.amount_subtotal = (checkoutSession.amount_subtotal / 100).toFixed(2)
                        checkoutSessionInstance.stripeCheckoutSessionObject.amount_total = (checkoutSession.amount_total / 100).toFixed(2)

                        const lineItems = await stripe.checkout.sessions.listLineItems(
                            event.data.object.id,
                            {
                                limit: 99,
                            }
                        )
                        checkoutSessionInstance.stripeCheckoutSessionObject.line_items_quantity_total = lineItems.data.reduce((sum, item) => sum + item.quantity, 0)

                        lineItems.data.forEach(item => {
                            ['amount_total', 'amount_subtotal', 'amount_discount', 'amount_tax'].forEach(field => {
                                item[field] = (item[field] / 100).toFixed(2)
                            })
                            item.price.unit_amount = (item.price.unit_amount / 100).toFixed(2)
                        })

                        checkoutSessionInstance.stripeCheckoutSessionLineItemsObject = lineItems

                        await self.apos.stripeCheckoutSession.insert(req, checkoutSessionInstance, { permissions: false })
                    }
                    return res.status(200).end()
                }
            }
        }
    },
    apiRoutes(self) {
        return {
            post: {
                // POST /api/v1/stripe/checkout/sessions
                '/api/v1/stripe/checkout/sessions': async function (req, options) {
                    console.log('-- -- API -- Stripe Checkout - Create Session')
                    console.log('-- -- API -- Stripe Checkout - Create Session - options:', options)
                    console.log('-- -- API -- Stripe Checkout - Create Session - req.body:', req.body)

                    const checkoutSession = await stripe.checkout.sessions.create({
                        line_items: [
                            {
                                price: 'price_1OeIu3E1ozL6C4r7Aiwn3adJ',
                                quantity: 1
                            },
                            {
                                price: 'price_1OeIm2E1ozL6C4r7o2wTmhDQ',
                                quantity: 1
                            }
                        ],
                        locale: 'en',
                        mode: 'payment',
                        success_url: `https://stepanjakl.com`,
                        cancel_url: `https://stepanjakl.com`,
                    })

                    console.log('-- -- API -- Stripe Checkout - Create Session - session.url:', checkoutSession.url)

                    return req.res.redirect(303, checkoutSession.url)
                }
            }
        }
    }
}

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
