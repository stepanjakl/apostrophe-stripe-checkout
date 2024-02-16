module.exports = {
    extend: '@apostrophecms/piece-type',
    options: {
        alias: 'stripeCheckoutSession',
        label: 'Checkout Session',
        pluralLabel: 'Checkout Sessions',
        quickCreate: false,
        searchable: false,
        showCreate: false,
        autopublish: false,
        sort: {
            'stripeCheckoutSessionObject.created_timestamp': -1
        }
    },
    batchOperations: {
        remove: ['publish']
    },
    columns: {
        add: {
            'stripeCheckoutSessionObject.payment_intent': {
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
            'stripeCheckoutSessionObject.status': {
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
            /* slug: {
                type: 'readOnly',
                label: 'Checkout session ID',
                copyToClipboard: true
            }, */
            stripeCheckoutSessionObject: {
                label: 'Stripe checkout session object',
                type: 'object',
                fields: {
                    add: {
                        id: {
                            type: 'readOnly',
                            label: 'Checkout session ID',
                            copyToClipboard: true
                        },
                        payment_intent: {
                            type: 'readOnly',
                            label: 'Payment intent ID',
                            copyToClipboard: true,
                            openInNewTab: true,
                            openInNewTabPrepend: `${process.env.STRIPE_DASHBOARD_BASE_URL}${process.env.STRIPE_TEST_MODE ? '/test' : ''}/payments/`
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
                        }
                    }
                }
            },

            stripeCheckoutSessionLineItemsObject: {
                label: 'Stripe checkout session line items object',
                type: 'object',
                fields: {
                    add: {
                        data: {
                            label: 'Line items',
                            type: 'array',
                            inline: true,
                            // style: 'table',
                            readOnly: true,
                            fields: {
                                add: {
                                    // _id: {
                                    //     type: 'readOnly',
                                    //     label: 'ID'
                                    // },
                                    id: {
                                        type: 'readOnly',
                                        label: 'Product ID',
                                        copyToClipboard: true,
                                        openInNewTab: true,
                                        openInNewTabPrepend: `${process.env.STRIPE_DASHBOARD_BASE_URL}${process.env.STRIPE_TEST_MODE ? '/test' : ''}/products/`
                                    },
                                    description: {
                                        type: 'readOnly',
                                        label: 'Name'
                                    },
                                    object: {
                                        type: 'readOnly',
                                        label: 'Type'
                                    },
                                    quantity: {
                                        type: 'readOnly',
                                        label: 'Quantity'
                                    },
                                    price: {
                                        label: 'Price',
                                        type: 'object',
                                        fields: {
                                            add: {
                                                unit_amount: {
                                                    type: 'readOnly',
                                                    label: 'Unit amount'
                                                },
                                                currency: {
                                                    type: 'readOnly',
                                                    label: 'Currency'
                                                }
                                            }
                                        }
                                    },
                                    amount_total: {
                                        type: 'readOnly',
                                        label: 'Amount total'
                                    }
                                }
                            }
                        }
                    }
                }
            }




            /* created_timestamp: {
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
                            openInNewTabPrepend: `${process.env.STRIPE_DASHBOARD_BASE_URL}${process.env.STRIPE_TEST_MODE ? '/test' : ''}/payments/`
                        },
                        status: {
                            type: 'readOnly',
                            label: 'Status'
                        },
                        payment_status: {
                            type: 'readOnly',
                            label: 'Payment status'
                        },
                        'line_items.data': {
                            label: 'Line items',
                            type: 'array',
                            inline: true,
                            style: 'table',
                            readOnly: true,
                            fields: {
                                add: {
                                    // _id: {
                                    //     type: 'readOnly',
                                    //     label: 'ID'
                                    // },
                                    description: {
                                        type: 'readOnly',
                                        label: 'Description'
                                    },
                                    product: {
                                        type: 'readOnly',
                                        label: 'Product ID',
                                        copyToClipboard: true,
                                        openInNewTab: true,
                                        openInNewTabPrepend: `${process.env.STRIPE_DASHBOARD_BASE_URL}${process.env.STRIPE_TEST_MODE ? '/test' : ''}/products/`
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
            }, */




        },
        remove: ['title', 'slug', 'visibility'],
        group: {
            session: {
                label: 'Session',
                fields: [
                    'slug',
                    'stripeCheckoutSessionObject'
                ]
            },
            lineItems: {
                label: 'Line items',
                fields: [
                    'stripeCheckoutSessionLineItemsObject'
                ]
            },
            /* utility: {
                fields: [
                    'amount_subtotal',
                    'amount_total',
                    'currency',
                    'line_items_quantity_total'
                ]
            } */
        }
    },
    filters: {
        remove: ['visibility']
    },
    /* init(self) {
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
    } */
}
