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
    remove: [ 'publish' ]
  },
  columns: {
    add: {
      'stripeCheckoutSessionObject.payment_intent': {
        label: 'Payment ID',
        component: 'AposCellBasic'
      },
      'stripeCheckoutSessionObject.created_timestamp': {
        label: 'Date',
        component: 'AposCellDate'
      },
      'stripeCheckoutSessionObject.amount_total': {
        label: 'Amount',
        component: 'AposCellBasic'
      },
      'stripeCheckoutSessionObject.currency': {
        label: 'Currency',
        component: 'AposCellBasic'
      },
      'stripeCheckoutSessionObject.line_items_quantity_total': {
        label: 'Quantity',
        component: 'AposCellBasic'
      },
      'stripeCheckoutSessionObject.status': {
        label: 'Status',
        component: 'AposCellBasic'
      },
      'stripeCheckoutSessionObject.payment_status': {
        label: 'Payment status',
        component: 'AposCellBasic'
      }
    },
    remove: [ 'title', 'lastPublishedAt', 'updatedAt' ],
    order: [ 'checkoutSession.payment_intent', 'stripeCheckoutSessionObject.created_timestamp', 'stripeCheckoutSessionObject.amount_total', 'stripeCheckoutSessionObject.currency', 'stripeCheckoutSessionObject.line_items_quantity_total', 'stripeCheckoutSessionObject.status', 'stripeCheckoutSessionObject.payment_status' ]
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
              openInNewTabPrepend: `${process.env.STRIPE_DASHBOARD_BASE_URL}${process.env.STRIPE_TEST_MODE === 'false' ? '' : '/test'}/payments/`
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
                  /* _id: {
                      type: 'readOnly',
                      label: 'ID'
                  }, */
                  id: {
                    type: 'readOnly',
                    label: 'Product ID',
                    copyToClipboard: true,
                    openInNewTab: true,
                    openInNewTabPrepend: `${process.env.STRIPE_DASHBOARD_BASE_URL}${process.env.STRIPE_TEST_MODE === 'false' ? '' : '/test'}/products/`
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
    },
    remove: [ 'title', 'slug', 'visibility' ],
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
      }
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
    remove: [ 'visibility' ]
  }
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
};
