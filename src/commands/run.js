import {open} from "sqlite";
import sqlite3 from "sqlite3";
import {initDB, insertParticipants, insertSpace} from "../utils/db.js";
import chalk from "chalk";
import puppeteer from "puppeteer";

const run = async (url) => {
  const db = await open({
    filename: './Cielago.db',
    driver: sqlite3.Database
  })
  await initDB(db);
  const reg = new RegExp(/https:\/\/twitter.com\/i\/spaces\/\w+/)
  if (!reg.test(url)) {
    console.log(chalk.red('ERROR:'), 'Url is not valid')
    process.exit(0)
  }
  // delete ? and all string behind ? in url
  url = url.split('?')[0]
  console.log(chalk.green('INFO:'), 'cielago', 'made by @tunogya')
  console.log(chalk.green('INFO:'), 'twitter space:', url)
  try {
    console.log(chalk.green('INFO:'), 'Start puppeteer...')
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
    )
    page.on('response', async (response) => {
      const regexp = new RegExp('https://api.twitter.com/graphql/.*AudioSpaceById')
      if (regexp.test(response.url()) && response.request().method() === "GET") {
        try {
          let res = await response.text()
          if (res) {
            res = JSON.parse(res)
            const metadata = res.data.audioSpace.metadata
            await insertSpace(db, metadata);
            const {admins, speakers, listeners, total} = res.data.audioSpace.participants
            console.log(chalk.green('INFO:'), metadata.title.slice(0, 10) + '...', 'total participants:', chalk.green(total), 'total_live_listeners:', chalk.yellow(metadata.total_live_listeners))
            for (const admin of admins) {
              await insertParticipants(db, metadata, 'admin', admin)
            }
            for (const speaker of speakers) {
              await insertParticipants(db, metadata, 'speaker', speaker)
            }
            for (const listener of listeners) {
              await insertParticipants(db, metadata, 'listener', listener)
            }
            if (metadata.state === 'Ended') {
              console.log(chalk.red('WARNING:'), metadata.title.slice(0, 10) + '...', 'This space is ended!')
              await browser.close()
              process.exit(0)
            }
          }
        } catch (e) {
          console.log(chalk.yellow('WARNING:'), e)
        }
      }
    });
    await page.goto(url);
  } catch (e) {
    console.log(chalk.yellow('WARNING:'), e)
  }
}

export default run