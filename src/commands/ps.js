import {open} from "sqlite";
import sqlite3 from "sqlite3";
import {initDB} from "../utils/db.js";
import chalk from "chalk";

const ps = async () => {
  const db = await open({
    filename: './Cielago.db',
    driver: sqlite3.Database
  })
  await initDB(db);
  try {
    const spaces = await db.all('SELECT * FROM space')
    // print a table of spaces
    console.table(spaces.map((item) => ({
      state: item.state,
      title: item.title.slice(0, 10) + '...',
      started_at: new Date(item.started_at).toLocaleString(),
      total_replay_watched: item.total_replay_watched,
      total_live_listeners: item.total_live_listeners,
      url: `https://twitter.com/i/spaces/${item.rest_id}`,
    })))
  } catch (e) {
    console.log(chalk.yellow('WARNING:'), e)
  }
  await db.close()
}

export default ps