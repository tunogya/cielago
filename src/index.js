const {Command} = require('commander');
const puppeteer = require('puppeteer');
const sqlite3 = require('sqlite3');
const {open} = require('sqlite');
const ObjectsToCsv = require('objects-to-csv');
const path = require('path');

const program = new Command();

const initDB = async (db) => {
  await db.run(`CREATE TABLE IF NOT EXISTS space
                      (
                          rest_id               TEXT PRIMARY KEY,
                          state                 TEXT,
                          title                 TEXT,
                          media_key             TEXT,
                          created_at            INTEGER,
                          started_at            INTEGER,
                          updated_at            INTEGER,
                          conversation_controls INTEGER,
                          total_replay_watched  INTEGER,
                          total_live_listeners  INTEGER,
                          creator_rest_id       TEXT
                      )`)
  await db.run(`CREATE TABLE IF NOT EXISTS participants
                      (
                          space_id            TEXT,
                          role                TEXT,
                          periscope_user_id   TEXT,
                          start               INTEGER,
                          check_at            INTEGER,
                          twitter_screen_name TEXT,
                          display_name        TEXT,
                          avatar_url          TEXT,
                          is_verified         INTEGER,
                          is_muted_by_admin   INTEGER,
                          is_muted_by_guest   INTEGER,
                          user_rest_id        TEXT,
                          has_nft_avatar      INTEGER,
                          is_blue_verified    INTEGER,
                          primary key (space_id, role, user_rest_id)
                      )`)
}

const insertSpace = async (db, metadata) => {
  await db.run(`REPLACE INTO space (rest_id, state, title, media_key, created_at, started_at, updated_at,
                                                 conversation_controls, total_replay_watched, total_live_listeners,
                                                 creator_rest_id)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [metadata.rest_id, metadata.state, metadata.title, metadata.media_key, metadata.created_at,
        metadata.started_at, metadata.updated_at, metadata.conversation_controls,
        metadata.total_replay_watched, metadata.total_live_listeners, metadata.creator_results.result.rest_id])
}

const insertParticipants = async (db, metadata, role, user) => {
  await db.run(`REPLACE INTO participants (space_id, role, periscope_user_id, start, check_at,
                                                            twitter_screen_name,
                                                            display_name, avatar_url, is_verified, is_muted_by_admin,
                                                            is_muted_by_guest, user_rest_id, has_nft_avatar,
                                                            is_blue_verified)
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        metadata.rest_id, role, user.periscope_user_id, user.start, Date.now(), user.twitter_screen_name,
        user.display_name, user.avatar_url, user.is_verified, user.is_muted_by_admin,
        user.is_muted_by_guest, user.user_results.rest_id, user.user_results.result.has_nft_avatar,
        user.user_results.result.is_blue_verified
      ])
}

program
    .name('cielago')
    .version('0.0.3')
    .description('Cielago is a cli tool for twitter space. It can run a listener for twitter space and export data to csv file. Author: @tunogya')

program
    .command('run')
    .description('Run a listener for twitter space')
    .argument('<string>', 'twitter space url')
    .action(async (url, options) => {
      const db = await open({
        filename: './Cielago.db',
        driver: sqlite3.Database
      })
      await initDB(db);
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
        page.on('response', async (response) => {
          const regexp = new RegExp('https://api.twitter.com/graphql/.*AudioSpaceById')
          if (regexp.test(response.url())) {
            try {
              let res = await response.text()
              if (res) {
                res = JSON.parse(res)
                const metadata = res.data.audioSpace.metadata
                await insertSpace(db, metadata);
                const {admins, speakers, listeners, total} = res.data.audioSpace.participants
                console.log('total participants:', total)
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
                  console.log('This space is ended!', metadata.state)
                  await browser.close()
                  process.exit(0)
                }
              }
            } catch (e) {
              console.log(e)
            }
          }
        });
        await page.goto(url);
      } catch (e) {
        console.log(e)
      }
    })

// TODO can have -watch option to watch the space
program
    .command('ps')
    .description('List all twitter spaces')
    .action(async () => {
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
          title: item.title,
          started_at: new Date(item.started_at).toLocaleString(),
          total_replay_watched: item.total_replay_watched,
          total_live_listeners: item.total_live_listeners,
          url: `https://twitter.com/i/spaces/${item.rest_id}`,
        })))
      } catch (e) {
        console.log(e)
      }
      await db.close()
    })

// remove a space all data from db
// TODO can have -a option to remove all spaces
program
    .command('rm')
    .description('Remove a twitter space record')
    .argument('<string>', 'twitter space url')
    .action(async (url, options) => {
      const db = await open({
        filename: './Cielago.db',
        driver: sqlite3.Database
      })
      await initDB(db);
      const reg = new RegExp(/https:\/\/twitter.com\/i\/spaces\/\w+/)
      if (!reg.test(url)) {
        console.log('url is not valid')
        process.exit(0)
      }
      const space_id = url.split('/').pop()
      try {
        await db.run(`DELETE FROM space WHERE rest_id = ?`, [space_id])
        console.log('space removed success!')
        await db.run(`DELETE FROM participants WHERE space_id = ?`, [space_id])
        console.log('participants removed success!')
      } catch (e) {
        console.log(e)
      }
      await db.close()
    })

program
    .command('export')
    .description('Export a twitter space log')
    .argument('<string>', 'twitter space url')
    .action(async (url, options) => {
      const db = await open({
        filename: './Cielago.db',
        driver: sqlite3.Database
      })
      await initDB(db);
      const reg = new RegExp(/https:\/\/twitter.com\/i\/spaces\/\w+/)
      if (!reg.test(url)) {
        console.log('url is not valid')
        process.exit(0)
      }
      const space_id = url.split('/').pop()
      try {
        const participants = await db.all(`SELECT * FROM participants WHERE space_id = ?`, [space_id])
        if (participants.length === 0) {
          console.log('No participants found!')
          process.exit(0)
        }
        const csv = new ObjectsToCsv(participants)
        const filepath = `./cielago-${space_id}.csv`
        await csv.toDisk(filepath, {allColumns: true})
        console.log('Export participants success! file path:', path.resolve(filepath))
      } catch (e) {
        console.log(e)
      }
      await db.close()
    })

program.parse();