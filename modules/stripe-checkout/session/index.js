module.exports = {
    extend: '@apostrophecms/piece-type',
    options: {
        alias: 'stripeCheckoutSession',
        label: 'Checkout Session',
        pluralLabel: 'Checkout Sessions',
        quickCreate: false,
        searchable: false,
        // autopublish: true,
        showCreate: false,
        editRole: 'editor',
        publishRole: 'editor',
        showPermissions: true,
        sort: {
            created_timestamp: -1
        }
    },
    batchOperations: {
        remove: ['publish']
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
            'checkoutSession.payment_intent': {
                label: 'Payment ID',
                component: 'AposCellBasic'
            },
            'created_timestamp': {
                label: 'Date',
                component: 'AposCellDate'
            },
            'amount_total': {
                label: 'Amount',
                component: 'AposCellBasic'
            },
            'currency': {
                label: 'Currency',
                component: 'AposCellBasic'
            },
            'line_items_quantity_total': {
                label: 'Quantity',
                component: 'AposCellBasic'
            },
            'checkoutSession.status': {
                label: 'Status',
                component: 'AposCellBasic'
            },
            'checkoutSession.payment_status': {
                label: 'Payment status',
                component: 'AposCellBasic'
            }
        },
        remove: ['title', 'lastPublishedAt', 'updatedAt'],
        order: ['checkoutSession.payment_intent', 'created_timestamp', 'amount_total', 'currency', 'line_items_quantity_total', 'checkoutSession.status', 'checkoutSession.payment_status']
    },
    fields: {
        add: {
            slug: {
                type: 'readOnly',
                label: 'Checkout session ID',
                copyToClipboard: true
            },
            created_timestamp: {
                type: 'readOnly',
                label: 'Created timestamp',
                copyToClipboard: true
            },
            checkoutSession: {
                label: 'Checkout session data',
                type: 'object',
                fields: {
                    add: {
                        payment_intent: {
                            type: 'readOnly',
                            label: 'Payment intent ID',
                            copyToClipboard: true,
                            openInNewTab: true,
                            openInNewTabPrepend: `${process.env.STRIPE_DASHBOARD_BASE_URL}/test/payments/`
                        },
                        status: {
                            type: 'readOnly',
                            label: 'Status'
                        },
                        payment_status: {
                            type: 'readOnly',
                            label: 'Payment status'
                        },
                        line_items: {
                            label: 'Line items',
                            type: 'array',
                            inline: true,
                            style: 'table',
                            readOnly: true,
                            fields: {
                                add: {
                                    /* _id: {
                                        type: 'readOnly',
                                        label: 'ID'
                                    }, */
                                    description: {
                                        type: 'readOnly',
                                        label: 'Description'
                                    },
                                    product: {
                                        type: 'readOnly',
                                        label: 'Product ID',
                                        copyToClipboard: true,
                                        openInNewTab: true,
                                        openInNewTabPrepend: `${process.env.STRIPE_DASHBOARD_BASE_URL}/test/products/`
                                    },
                                    type: {
                                        type: 'readOnly',
                                        label: 'Type'
                                    },
                                    quantity: {
                                        type: 'readOnly',
                                        label: 'Quantity'
                                    },
                                    unit_amount: {
                                        type: 'readOnly',
                                        label: 'Unit amount'
                                    }
                                }
                            }
                        }
                    }
                }
            },


            amount_subtotal: {
                type: 'readOnly',
                label: 'Amount subtotal'
            },
            amount_total: {
                type: 'readOnly',
                label: 'Amount total'
            },
            currency: {
                type: 'readOnly',
                label: 'Currency'
            },
            line_items_quantity_total: {
                type: 'readOnly',
                label: 'Line items total quantity'
            },


            checkoutSessionData: {
                type: 'string',
                textarea: true,
                label: 'Checkout session data'
            },
        },
        remove: ['title', 'visibility'],
        group: {
            data: {
                label: 'Data',
                fields: [
                    'slug',
                    'created_timestamp',
                    'checkoutSession'
                ]
            },
            debug: {
                label: 'Debug',
                fields: [
                    'checkoutSessionData'
                ]
            },
            utility: {
                fields: [
                    'amount_subtotal',
                    'amount_total',
                    'currency',
                    'line_items_quantity_total'
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
