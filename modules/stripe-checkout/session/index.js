module.exports = {
    extend: '@apostrophecms/piece-type',
    options: {
        alias: 'stripeCheckoutSession',
        label: 'Checkout Session',
        pluralLabel: 'Checkout Sessions',
        quickCreate: false,
        searchable: false,
        autopublish: true,
        showCreate: false,
        editRole: 'editor',
        publishRole: 'editor',
        showPermissions: true,
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
    /* utilityOperations: {
        add: {
            button: {
                label: 'apostrophe:moreOperations',
                iconOnly: true,
                icon: 'dots-vertical-icon',
                type: 'outline'
            },
        }
    }, */
    columns: {
        add: {
            slug: {
                label: 'Slug',
                component: 'AposCellBasic'
            },
            status: {
                label: 'Status',
                component: 'AposCellBasic'
            },
            lastPublishedAt: {
                label: 'Published',
                component: 'AposCellDate'
            }
        },
        remove: ['title'],
        order: ['slug', 'status', 'lastPublishedAt']
    },
    fields: {
        add: {
            slug: {
                type: 'readOnly',
                label: 'Slug',
                required: true,
                readOnly: true,
                copyToClipboard: true,
                openInNewTab: true,
                openInNewTabPrepend: 'https://dashboard.stripe.com/test/payments/' // remove
            },
            checkoutSession: {
                label: 'Checkout Session',
                type: 'object',
                fields: {
                    add: {
                        payment_intent: {
                            type: 'readOnly',
                            label: 'Payment Intent',
                            required: true,
                            readOnly: true,
                            copyToClipboard: true,
                            openInNewTab: true,
                            openInNewTabPrepend: 'https://dashboard.stripe.com/test/payments/'
                        },
                        status: {
                            type: 'string',
                            label: 'Status',
                            readOnly: true
                        },


                        /* checkoutSessionData: {
                            type: 'string',
                            textarea: true,
                            label: 'Checkout Session data'
                        }, */
                    }
                }
            }
        },
        remove: ['title', 'visibility'],
        group: {
            data: {
                label: 'Data',
                fields: [
                    'slug',
                    'checkoutSession'
                ]
            }
        }
    },
    filters: {
        remove: ['visibility']
    },
    init(self) {
        self.addReadOnlyFieldType()
    },
    methods(self) {
        return {
            addReadOnlyFieldType() {
                self.apos.schema.addFieldType({
                    name: 'readOnly',
                    convert: self.convertInput,
                    vueComponent: 'InputReadOnly'
                })
            }
        }
    }
}
