require('dotenv').config({ path: './auth/.env' })
const { createUser, getUsers } = require('../utilitaires/function')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


createUser('mohamed', 'coucou', bcrypt)

module.exports = (app) => {
    app.post('/api/login', async (req, res) => {
        try {
            const admins = await getUsers()
            if (!req.body.username || !req.body.password) {
                return res.status(400).json({ message: "La requête demandée est incorrecte. Fournissez des identifiants valides." })
            }
            const adminUsernameMatched = admins.find(admin => admin.username === req.body.username) 
            if (!adminUsernameMatched) return res.status(401).json({ message: `Un identifiant est inccorect.`})
            
            bcrypt.compare(req.body.password, adminUsernameMatched.password) 
                .then(isPasswordValid => {
                    if (!isPasswordValid) {
                        const message = `Les identifiants insérés sont erronés.`
                        return res.status(401).json({ message })
                    }
                    const token = jwt.sign(
                        { userName: adminUsernameMatched.userName},
                        process.env.PRIVATE_KEY,
                        { expiresIn: 3.145e+10 }
                    )
                    const message = `L'utilisateur a été connecté avec succès.`
                    return res.json({ message, data: adminUsernameMatched, token })
                })
        } catch(error) {
            return res.status(500).json({ message: `Réessayez dans quelques instants.` })
        }
    })
}