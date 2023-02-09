import {open} from "sqlite";
import sqlite3 from "sqlite3";
import {initDB} from "../utils/db.js";
import chalk from "chalk";
import ObjectsToCsv from "objects-to-csv";
import path from "path";

const _export = async (url) => {
  const db = await open({
    filename: './Cielago.db',
    driver: sqlite3.Database
  })
  await initDB(db);
  const reg = new RegExp(/https:\/\/twitter.com\/i\/spaces\/\w+/)
  if (!reg.test(url)) {
    console.log(chalk.red('ERROR:'), 'url is not valid')
    process.exit(0)
  }
  url = url.split('?')[0]
  const space_id = url.split('/').pop()
  try {
    const participants = await db.all(`SELECT *
                                           FROM participants
                                           WHERE space_id = ?`, [space_id])
    if (participants.length === 0) {
      console.log(chalk.yellow('WARNING:'), 'No participants found!')
      process.exit(0)
    }
    const csv = new ObjectsToCsv(participants)
    const filepath = `./cielago-${space_id}.csv`
    await csv.toDisk(filepath, {allColumns: true})
    console.log(chalk.green('INFO:'), 'Export participants success! file path:', chalk.green(path.resolve(filepath)))
  } catch (e) {
    console.log(chalk.yellow('WARNING:'), e)
  }
  await db.close()
}

export default _export