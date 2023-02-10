# cielago

[![Node.js Package](https://github.com/tunogya/cielago/actions/workflows/npm-publish.yml/badge.svg?event=release)](https://github.com/tunogya/cielago/actions/workflows/npm-publish.yml)

Welcome to cielago, a powerful and convenient CLI tool for downloading Twitter Space audience information. With this tool, you can easily gather data about your audience and make the most of your Twitter Space experience, all without ever having to log in to Twitter.


## Highlights

- **No Login Required**: With cielago, you can download Twitter Space audience information without ever having to log in to Twitter. This means you can access your data more securely and easily, without risking your privacy.
- **Local and Secure**: The data you download with cielago is stored locally on your machine, giving you complete control and privacy over your information.
- **Powerful and Convenient**: cielago is a powerful and easy-to-use CLI tool that makes it simple to gather the information you need about your Twitter Space audience.

## Background

- Twitter do not have any free API to get those data of twitter space.
- Twitter graphQL API only use for Twitter app.

## Install

```bash
npm install cielago -g
```

**IMPORTANT:** You need to install Chrome browser first.

## Start wizard

Run a listener for twitter space:

```bash
$ cielago run https://twitter.com/i/spaces/xxxxxxxxx

or

$ cielago run xxxxxxxxx
```

List all twitter spaces:

```bash
$ cielago ps
```

Export data to csv:

```bash
$ cielago export xxxxxxxxx
```

## Open Source

cielago is an open-source project, and we welcome contributions from the community. If you're interested in helping to improve cielago, please visit our GitHub repository for more information.

## Conclusion

If you're looking for a fast, easy, and secure way to access your Twitter Space audience information, look no further than cielago. Give it a try today and see what you can discover!