exports.execute = () => {
    createAdmins();
    createJobs();
    createPlayers();
}


const createAdmins = () => {
    db.Admin.findAll().then(function (admins) {
        if (!admins.length) {
            console.log('No admins found. Creating admins...')
            db.Admin.bulkCreate([
                {id: '146365826939748350'}, // incon test server
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
                {id: '146365826939748350', JobId: 1}, // incon test server
                {id: '642108520858386452', JobId: 2},
                {id: '107901991283339264', JobId: 3}
            ])
            .then((newPlayers) => {console.log('New players created.')})
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