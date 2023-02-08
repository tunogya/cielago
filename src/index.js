import {Command} from 'commander';
import puppeteer from 'puppeteer';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite'

const program = new Command();

program
    .name('cielago')
    .version('0.0.1')
    .description('Cielago is a cli tool for twitter spaces')

program
    .command('run')
    .description('Run a listener for twitter space')
    .argument('<string>', 'twitter space url')
    .action(async (url, options) => {
      const reg = new RegExp(/https:\/\/twitter.com\/i\/spaces\/\w+/)
      if (!reg.test(url)) {
        console.log('url is not valid')
        process.exit(0)
      }
      try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
        )
        const db = await open({
          filename: './cielago.db',
          driver: sqlite3.Database
        })
        page.on('response', async (response) => {
          const regexp = new RegExp('https://api.twitter.com/graphql/.*AudioSpaceById')
          if (regexp.test(response.url())) {
            try {
              let res = await response.text()
              if (res) {
                res = JSON.parse(res)
                const metadata = res.data.audioSpace.metadata
                if (metadata.state === 'TimedOut') {
                  console.log('This space is ended!')
                  await browser.close()
                  process.exit(0)
                  return
                }
                const participants = res.data.audioSpace.participants
                console.log(participants)
              }
            } catch (e) {
            }
          }
        });
        await page.goto(url);
      } catch (e) {
        console.log(e)
      }
    })

program
    .command('rm')
    .description('Remove a twitter space record')
    .argument('<string>', 'twitter space url')
    .action(async (options) => {
      try {
        const db = await open({
          filename: './cielago.db',
          driver: sqlite3.Database
        })
        console.log(db)
      } catch (e) {
        console.log(e)
      }
    })

program
    .command('logs')
    .description('List all twitter space logs')
    .action(async (options) => {
      try {
        const db = await open({
          filename: './cielago.db',
          driver: sqlite3.Database
        })
        console.log(db)
      } catch (e) {
        console.log(e)
      }
    })

program
    .command('export')
    .description('Export a twitter space log')
    .argument('<string>', 'twitter space url')
    .action(async (options) => {
      try {
        const db = await open({
          filename: './cielago.db',
          driver: sqlite3.Database
        })
        console.log(db)
      } catch (e) {
        console.log(e)
      }
    })

program.parse();