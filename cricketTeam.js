const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Output at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

// List of players
app.get('/players', async (request, response) => {
  const query = `
  select * from cricket_team
  `
  const dbResponse = await db.all(query)
  response.send(dbResponse)
})
// Add player
app.post('/players/', async (request, response) => {
  try {
    const {playerName, jerseyNumber, role} = request.body

    const addPlayerQuery = `
      INSERT INTO cricket_team (player_name, jersey_number, role)
      VALUES (?, ?, ?);`

    await db.run(addPlayerQuery, [playerName, jerseyNumber, role])
    response.send('Player Added to Team')
  } catch (e) {
    response.status(500).send({error: e.message})
  }
})

// Get player details
app.get('/players/:playerId/', async (request, response) => {
  try {
    const {playerId} = request.params
    const playerQuery = `SELECT * FROM cricket_team WHERE player_id = ?`
    const player = await db.get(playerQuery, playerId)

    if (player) {
      const dbResponse = {
        playerId: player.player_id,
        playerName: player.player_name,
        jerseyNumber: player.jersey_number,
        role: player.role,
      }
      response.send(dbResponse)
    } else {
      response.status(404).send({error: 'Player not found'})
    }
  } catch (e) {
    response.status(500).send({error: e.message})
  }
})

// Update player details
app.put('/players/:playerId/', async (request, response) => {
  try {
    const {playerId} = request.params
    const {playerName, jerseyNumber, role} = request.body

    const updatePlayerQuery = `
      UPDATE cricket_team
      SET player_name = ?, jersey_number = ?, role = ?
      WHERE player_id = ?;`

    await db.run(updatePlayerQuery, [playerName, jerseyNumber, role, playerId])
    response.send('Player Details Updated')
  } catch (e) {
    response.status(500).send({error: e.message})
  }
})

// Delete player
app.delete('/players/:playerId/', async (request, response) => {
  try {
    const {playerId} = request.params
    const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ?`
    await db.run(deletePlayerQuery, playerId)
    response.send('Player Removed')
  } catch (e) {
    response.status(500).send({error: e.message})
  }
})

module.exports = app

