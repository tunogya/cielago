# cielago

[![Node.js Package](https://github.com/tunogya/cielago/actions/workflows/npm-publish.yml/badge.svg?event=release)](https://github.com/tunogya/cielago/actions/workflows/npm-publish.yml)

Cielago is a cli tool for twitter space. It can run a listener for twitter space and export data to csv file.

## Highlights

- No need to log in to Twitter.
- Local storage for twitter space data.
- Export data to csv file.

## Background

- Twitter do not have REST API to get data from twitter space.
- Twitter graphQL API only use for Twitter app.

## Install

```bash
npm install cielago -g
```

**IMPORTANT:** You need to install Chrome browser first.

## Start wizard

Run a listener for twitter space:

```bash
cielago run https://twitter.com/i/spaces/xxxxxxxxx
```

List all twitter spaces:

```bash
cielago ps
```