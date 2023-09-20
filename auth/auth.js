require('dotenv').config({ path: '.env'})

const jwt = require('jsonwebtoken')
const private_key = process.env.PRIVATE_KEY

module.exports = (req, res, next) => {
    const authorizationHeader = req.headers.authorization 

    if (!authorizationHeader) {
        const message = `Vous n'avez pas fourni le jeton d'authentification. Ajoutez-en un dans l'en-tête de la requête.`
        return res.status(401).json({ message })
    }

    const token = authorizationHeader.split(' ')[1]
    const decodedToken = jwt.verify(token, private_key, (error, decodedToken) => {
        if (error) {
            const message = `L'utilisateur n'est pas autorisé à accéder à cette ressource.`
            return res.status(401).json({ message, data: error })
    
        } else {
            next()
        }
    })
}