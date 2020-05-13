## FastBoot S3 Fetch Notifier

This notifier for the [FastBoot App Server][app-server] works with AWS
S3 to poll an object's Last Modified header to detect when you have
deployed a new version of your app. This notifier is a fork of
[fastboot-s3-notifier](https://github.com/tomdale/fastboot-s3-notifier),
that makes use of node-fetch instead of the s3 client.

[app-server]: https://github.com/ember-fastboot/fastboot-app-server

To use the notifier, configure it with an S3 host, bucket and key:

```js
const S3Notifier = require('fastboot-s3-notifier');

let notifier = new S3Notifier({
  host: "s3.eu-central-1.amazonaws.com",
  bucket: "bucketname",
  key: "path/to/fastboot-deploy-info.json",
});

let server = new FastBootAppServer({
  notifier: notifier
});
```

When the notifier starts, it will poll the object at the specified
bucket and key. Once the `LastModified` metadata changes, it will tell
the FastBoot App Server to fetch the latest version of the app.

Note that you should point the notifier at a _static_ path on S3, like
`fastboot-deploy-info.json`. That JSON file should then point the app
server to the latest application bundle. This way, you don't have to
propagate configuration changes to all of your app servers, and they can
poll a single key in perpetuity.

If you like this, you may also be interested in the companion
[fastboot-s3-downloader](https://github.com/tomdale/fastboot-s3-downloader),
which parses the above-described JSON file to find and download the
latest version of your app.
