import {open} from "sqlite";
import sqlite3 from "sqlite3";
import {initDB} from "../utils/db.js";
import chalk from "chalk";

const rm = async (url) => {
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
    await db.run(`DELETE
                      FROM space
                      WHERE rest_id = ?`, [space_id])
    console.log(chalk.green('INFO:'), 'space removed success!')
    await db.run(`DELETE
                      FROM participants
                      WHERE space_id = ?`, [space_id])
    console.log(chalk.green('INFO:'), 'participants removed success!')
  } catch (e) {
    console.log(chalk.yellow('WARNING:'), e)
  }
  await db.close()
}

export default rm