import {open} from "sqlite";
import sqlite3 from "sqlite3";
import {initDB} from "../utils/db.js";
import chalk from "chalk";
import ObjectsToCsv from "objects-to-csv";
import path from "path";

const _export = async (urls) => {
  const db = await open({
    filename: './Cielago.db',
    driver: sqlite3.Database
  })
  await initDB(db);
  for (let url of urls) {
    const reg = new RegExp(/https:\/\/twitter.com\/i\/spaces\/\w+/)
    if (reg.test(url)) {
      url = url.split('?')[0]
    }
    const space_id = url.split('/').pop()
    try {
      const participants = await db.all(`SELECT *
                                           FROM participants
                                           WHERE space_id = ?`, [space_id])
      if (participants.length === 0) {
        console.log(chalk.yellow('WARNING:'), `No participants found in ${space_id}!`)
        continue;
      }
      const csv = new ObjectsToCsv(participants)
      const filepath = `./cielago-${space_id}.csv`
      await csv.toDisk(filepath, {allColumns: true})
      console.log(chalk.green('INFO:'), `Export ${space_id} participants success! file path:`, chalk.green(path.resolve(filepath)))
    } catch (e) {
      console.log(chalk.yellow('WARNING:'), e)
    }
  }
  await db.close()
}

export default _export