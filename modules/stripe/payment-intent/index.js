module.exports = {
    extend: '@apostrophecms/piece-type',
    options: {
        label: 'Payment Intent',
        pluralLabel: 'Payment Intents'
    },
    fields: {
        add: {
            paymentIntentData: {
                type: 'string',
                textarea: true,
                label: 'Payment Intent data'
            }
        }
    }
}
