
const { chooseNbExplodeletters } = require('../utilitaires/function')
const auth = require('../auth/auth')

module.exports = async (app, routeName) => {
    app.get(`/api/explode/${ routeName }`, auth,  async (req, res) => {
        try {
            let limit = 20
            let destroyLetters = req.query.destroyLetters
            if (!destroyLetters) return res.status(400).json({ messsage: `La valeur du paramètre destroyLetters doit être définie dans l'url.` })
            if (isNaN(destroyLetters)) {
                const message = `La demande est invalide : la valeur du paramètre destroyLetters doit être un nombre.`
                return res.status(400).json({ message })
            }
        
            if (req.query.limit) {
                if (isNaN(limit)) return res.status(400).json({ messsage: `La limite doit être un nombre.` })
                if (limit < 1) return res.status(400).json({ message: `La limite ne peut pas être inférieure à 1.`})
                limit = parseInt(req.query.limit)
                if (limit >= 100) return res.status(400).json({ message: `La limite doit être inférieure ou égale à 100.`})   
            }

            destroyLetters = parseInt(destroyLetters)
            if (destroyLetters < 0) return res.status(400).json({ message: `Le nombre de solutions doit être supérieur à 0.`})
            
            const infos = await chooseNbExplodeletters(routeName, destroyLetters, limit)
            return res.status(200).json({ globalLength: infos.globalLength, message : infos.message, data: infos.data, nb: infos.nb })
            
        } catch(error) {
            if (error instanceof SyntaxError) {
                const message = `La chaine JSON est invalide`
                return res.status(400).json({ message })
            }
            return res.status(500)
        }
    })
}