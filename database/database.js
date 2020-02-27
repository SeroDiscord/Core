const SQLite = require("better-sqlite3");
const sql = new SQLite('./wolf-game.sqlite');
const fixtures = require('./fixtures.js');

exports.initialize = (bot) => {
    // create tables if they don't exist
    players(bot);
    quests(bot);
    playerQuests(bot);
}

players = (bot) => {
    // check if the table "players" exists.
    const playersTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'players';").get();
    if (!playersTable['count(*)']) {
      // if no "players" table, create it
      sql.prepare("CREATE TABLE players (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, guild TEXT, level INTEGER, exp INTEGER, class TEXT);").run();
      sql.prepare("CREATE UNIQUE INDEX idx_players_id ON players (id);").run();
      // sql.pragma("synchronous = 1");
      // sql.pragma("journal_mode = wal");

      // table did not exist, so add fixtures
      fixtures.initializePlayers(sql);
    }
    
    // setters and getters for "players" table
    bot.getPlayerByUserAndGuild = sql.prepare("SELECT * FROM players WHERE user = ? AND guild = ?");
    bot.setPlayer = sql.prepare("INSERT OR REPLACE INTO players (user, guild, level, exp, class) VALUES (@user, @guild, @level, @exp, @class);");
}

playerQuests = (bot) => {
    // check if the table "playerQuests" exists.
    const playerQuests = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'playerQuests';").get();
    if (!playerQuests['count(*)']) {
      // if no "quests" table, create it
      sql.prepare("CREATE TABLE playerQuests (id INTEGER PRIMARY KEY AUTOINCREMENT, playerId INTEGER, questId INTEGER, endTime INTEGER);").run();
      sql.prepare("CREATE UNIQUE INDEX idx_playerquests_id ON playerQuests (id);").run();
      // sql.pragma("synchronous = 1");
      // sql.pragma("journal_mode = wal");
    }
    
    // setters and getters for "playerQuests" table
    bot.getPlayerQuestByPlayerId = sql.prepare("SELECT * FROM playerQuests WHERE playerId = ?");
    bot.setPlayerQuest = sql.prepare("INSERT OR REPLACE INTO playerQuests (playerId, questId, endTime) VALUES (@playerId, @questId, @endTime);");
}

quests = (bot) => {
    // check if the table "quests" exists.
    const quests = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'quests';").get();
    if (!quests['count(*)']) {
      // if no "quests" table, create it
      sql.prepare("CREATE TABLE quests (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT, difficulty INTEGER);").run();
      sql.prepare("CREATE UNIQUE INDEX idx_quests_id ON quests (id);").run();
      // sql.pragma("synchronous = 1");
      // sql.pragma("journal_mode = wal");

      // table did not exist, so add fixtures
      fixtures.initializeQuests(sql);
    }
    
    // fetch by questId
    bot.getQuestById = sql.prepare("SELECT * FROM quests WHERE id = ?");
    // fetch a random quest by difficulty
    bot.getRandomQuestByDifficulty = sql.prepare("SELECT * FROM quests WHERE difficulty = ? ORDER BY RANDOM() LIMIT 1");
}