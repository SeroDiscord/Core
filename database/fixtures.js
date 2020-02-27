exports.initializePlayers = (sql) => {
    console.log('Generating player data...');
    let fixtures = [
        ['146365826939748353', '681986790457868309', 1, 0, 'adventurer'], //incon on incon server
        ['234234234', '2323424', 1, 0, 'adventurer'] //incon on wolf server
    ]
    for (let index = 0; index < fixtures.length; index++) {
        sql.prepare(`INSERT OR REPLACE INTO players (user, guild, level, exp, class) VALUES ('${fixtures[index][0]}', '${fixtures[index][1]}', ${fixtures[index][2]}, ${fixtures[index][3]}, '${fixtures[index][4]}');`).run();
    }
    console.log('Player data loaded.');
}

exports.initializeQuests = (sql) => {
        console.log('Generating quest data...');
        let fixtures = [
            ['Hunt wild boar', 1],
            ['Fetch a shrubbery', 1],
            ['Entice a succubus', 2],
            ['description diff 3', 3],
            ['description diff 4', 4],
            ['description diff 5', 5],
            ['description diff 6', 6],
            ['description diff 7', 7]
        ]
        for (let index = 0; index < fixtures.length; index++) {
            sql.prepare(`INSERT OR REPLACE INTO quests (description, difficulty) VALUES ('${fixtures[index][0]}', ${fixtures[index][1]});`).run();
        }
        console.log('Quest data loaded.');
}   