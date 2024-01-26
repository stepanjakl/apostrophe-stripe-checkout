module.exports = {
    extend: '@apostrophecms/piece-type',
    options: {
        alias: 'stripeCheckoutSession',
        label: 'Checkout Session',
        pluralLabel: 'Checkout Sessions',
        /* publicApiProjection: {
            title: 1,
            slug: 1,
            type: 1,
            _url: 1,
            visiblity: 1,
            archived: 1,
            checkoutSessionData: 1
        } */
    },
    columns: {
        add: {
            lastPublishedAt: {
                label: 'Published',
                component: 'AposCellDate'
            },
            status: {
                label: 'Status',
                component: 'AposCellDate'
            }
        }
    },
    fields: {
        add: {
            checkoutSessionData: {
                type: 'string',
                textarea: true,
                label: 'Checkout Session data'
            },
            status: {
                type: 'string',
                label: 'Status',
                readOnly: true
            }
        }
    }
}
