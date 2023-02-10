import {open} from "sqlite";
import sqlite3 from "sqlite3";
import {initDB} from "../utils/db.js";
import chalk from "chalk";

const rm = async (urls, options) => {
  const db = await open({
    filename: './Cielago.db',
    driver: sqlite3.Database
  })
  await initDB(db);
  if (options.all) {
    try {
      await db.run(`DELETE
                    FROM space`)
      console.log(chalk.green('INFO:'), 'all space removed success!')
      await db.run(`DELETE
                    FROM participants`)
      console.log(chalk.green('INFO:'), 'all participants removed success!')
    } catch (e) {
      console.log(chalk.yellow('WARNING:'), e)
    }
  } else {
    for (let url of urls) {
      const reg = new RegExp(/https:\/\/twitter.com\/i\/spaces\/\w+/)
      if (!reg.test(url)) {
        console.log(chalk.red('ERROR:'), `${url} is not valid url`)
        continue;
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
    }
  }
  await db.close()
}

export default rm