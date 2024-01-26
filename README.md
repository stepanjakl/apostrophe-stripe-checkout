<div align="center">
    <h1>
        Stripe Checkout For Apostrophe 3
    </h1>
    <p>
        <a aria-label="Apostrophe logo" href="https://v3.docs.apostrophecms.org">
            <img src="https://img.shields.io/badge/MADE%20FOR%20Apostrophe%203-000000.svg?style=for-the-badge&logo=Apostrophe&labelColor=6516dd">
        </a>
        <a aria-label="Personal logo" href="https://stepanjakl.com">
            <img src="https://img.shields.io/badge/Open%20To%20New%20Opportunities-000000.svg?style=for-the-badge&labelColor=EED500&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTTAgMTV2NWgyMFY3LjVIMHY1aDE1LjA1VjE1SDBaTTIwIDBIMHY1aDIwVjBaIiAvPjwvc3ZnPg==">
        </a>
        <a aria-label="License"
           href="https://github.com/apostrophecms/module-template/blob/main/LICENSE.md">
            <img alt="License"
                 src="https://img.shields.io/static/v1?style=for-the-badge&labelColor=000000&label=License&message=MIT&color=3DA639">
        </a>
    </p>
</div>

This modules adds a custom route to initiate a Stripe Checkout instance...

![Terminal Teaser Image](https://b.stripecdn.com/docs-statics-srv/assets/custom-amount.7f01047b3e0551814ae9ff1057cd37e3.png)

## Installation

```zsh
npm install stripe-checkout@npm:@stepanjakl/apostrophe-stripe-checkout
```

## TODO
- webhook to save completed payments in Apostrophe pieces
- Option for one-time payments & Recurring payments
- Styling + extra options
- HMTX/Alpine.js examples - clean design (one mostly rounded - one view with rounded body edges)
- Screenshot with Apostrophe Pro subscription (show upsell value)
- Manual how to set it up with Stripe

## Subtitle

It is important to set the `baseUrl` option on your ApostropheCMS application for various reasons. In the SEO module, it contributes to building the correct `canonical` link tag URL, so in production search engines and web crawlers will register the correct link. The `baseUrl` can be set multiple ways:

**With the `APOS_BASE_URL` environment variable**

How you set the variable will depend on your hosting setup.

**As part of an environment configuration in `data/local.js`**

This method is if you are using stagecoach or a similar system for deployment.
```js
  module.exports = {
    baseUrl: 'https://mysite.com',
    modules: {
      // other module env configuration
    }
  };
```

**Via the multisite module if using [Apostrophe Assembly](https://apostrophecms.com/extensions/multisite-apostrophe-assembly)**

See the multisite documentation for details.
