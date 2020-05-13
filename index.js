"use strict";

const fetch = require('node-fetch');

const DEFAULT_POLL_TIME = 3 * 1000;

class S3Notifier {

  pollTime;

  host;
  bucket;
  key;

  lastModified;

  constructor(options) {
    this.ui = options.ui;
    this.pollTime = options.poll || DEFAULT_POLL_TIME;

    this.host = options.host;
    this.bucket = options.bucket;
    this.key = options.key;
  }

  subscribe(notify) {
    this.notify = notify;

    return this.getLastModified()
      .then((date) => {
        this.lastModified = date;
      })
      .then(() => this.schedulePoll())
      .catch((error) => {
        this.ui.writeError('error fetching S3 last modified; notifications disabled: ' + error);
      });
  }

  getLastModified() {
    return fetch(`https://${this.host}/${this.bucket}/${this.key}`).then((response => {
      if (!response.ok) {
        throw response;
      }
      return new Date(response.headers.get('Last-Modified'));
    }));
  }

  schedulePoll() {
    setTimeout(() => {
      this.poll();
    }, this.pollTime);
  }

  poll() {
    this.getLastModified()
      .then((date) => {
        this.compareLastModifieds(date);
        this.schedulePoll();
      })
      .catch(() => {
        this.ui.writeError('error fetching S3 last modified; rescheduling');
        this.schedulePoll();
      });
  }

  compareLastModifieds(newLastModified) {
    if (newLastModified.getTime() !== this.lastModified.getTime()) {
      this.ui.writeLine('config modified; old=%s; new=%s', this.lastModified, newLastModified);
      this.lastModified = newLastModified;
      this.notify();
    }
  }
}


module.exports = S3Notifier;
