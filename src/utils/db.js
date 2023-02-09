export const initDB = async (db) => {
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

export const insertSpace = async (db, metadata) => {
  await db.run(`REPLACE INTO space (rest_id, state, title, media_key, created_at, started_at, updated_at,
                                                 conversation_controls, total_replay_watched, total_live_listeners,
                                                 creator_rest_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [metadata.rest_id, metadata.state, metadata.title, metadata.media_key, metadata.created_at,
        metadata.started_at, metadata.updated_at, metadata.conversation_controls,
        metadata.total_replay_watched, metadata.total_live_listeners, metadata.creator_results.result.rest_id])
}

export const insertParticipants = async (db, metadata, role, user) => {
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