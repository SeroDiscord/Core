exports.execute = () => {
    createAdmins();
    createJobs();
    createAbilities();
    // createPlayers();
    createEnemies();
}

const createAdmins = () => {
    db.Admin.findAll().then(function (admins) {
        if (!admins.length) {
            console.log('No admins found. Creating admins...')
            db.Admin.bulkCreate([
                {id: '146365826939748353'}, // incon
                {id: '642108520858386452'},
                {id: '107901991283339264'}
            ])
            .then((newAdmins) => {console.log('New admins created.')})
            .catch((err) => {console.log("Admin creation error : ", err)})
        }
    })
}

const createPlayers = () => {
    db.Player.findAll().then(function (players) {
        if (!players.length) {
            console.log('No players found. Creating players...')
            db.Player.bulkCreate([
                {id: '146365826939748353', JobId: 1}, // incon
                {id: '642108520858386452', JobId: 2},
                {id: '107901991283339264', JobId: 3}
            ])
            .then((newPlayers) => {
                console.log('New players created.')
            })
            .catch((err) => {console.log("Player creation error : ", err)})
        }
    })
}

const createJobs = () => {
    db.Job.findAll().then(function (jobs) {
        if (!jobs.length) {
            console.log('No jobs found. Creating jobs...')
            db.Job.bulkCreate([
                {name: 'Blood Mage', emoji: '🩸'},
                {name: 'Space Cowboy', emoji: '🤠'},
                {name: 'Shapeshifter', emoji: '👺'}
            ])
            .then((newJobs) => {console.log('New jobs created.')})
            .catch((err) => {console.log("Job creation error : ", err)})
        }
    })
}

const createEnemies = () => {
    db.Enemy.findAll().then(function (enemies) {
        if (!enemies.length) {
            console.log('No enemies found. Creating enemies...')
            db.Enemy.bulkCreate([
                {name: 'Space Marine', health: 15, difficulty: 1},
                {name: 'Blood Ogre', health: 20, difficulty: 1},
                {name: 'Dainty Lumberjack', health: 25, difficulty: 1},
                {name: 'Living Chaos Orb', health: 5, difficulty: 1},
                {name: 'Shy Canadian', health: 30, difficulty: 2},
                {name: 'Towering Troll', health: 45, difficulty: 3}
            ])
            .then(() => {console.log('New enemies created.')})
            .catch((err) => {console.log("Enemy creation error : ", err)})
        }
    })
}

const createAbilities = () => {
    db.Ability.findAll().then(function (abilities) {
        if (!abilities.length) {
            console.log('No abilities found. Creating abilities...')
            db.Ability.bulkCreate([
                {name: 'Slap',
                    description: 'A hard slap across the face (1 power)',
                    attackText: "slaps the enemy",
                    emoji: '🩸',
                    power: 1},
                {name: 'Pencil Jab',
                    description: 'Jab a pencil into an eye socket (2 power)',
                    attackText: "jabs a pencil into the enemy's eye",
                    emoji: '✏️',
                    power: 2},
                {name: 'Triple Shot',
                    description: 'Fire your gun three times in quick succession',
                    attackText: "fires three times, faster than the eye can see",
                    emoji: '🔫',
                    power: 1}
            ])
            .then(() => {console.log('New abilities created.')})
            .catch((err) => {console.log("Ability creation error : ", err)})
        }
    })
}