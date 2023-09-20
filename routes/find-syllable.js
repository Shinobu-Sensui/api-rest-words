
const { getSyllable } = require('../utilitaires/function')
const auth = require('../auth/auth')

module.exports = (app, routeName) => {
    app.get(`/api/${ routeName }/syllable`, auth,  async (req, res) => {
        try {
            let limit = 20
            if (!req.query.nb) return res.status(400).json({ messsage: `La clé syllabe doit être définie dans l'url.` })
            if (isNaN(req.query.nb)) {
                const message = `La demande est invalide : la clé syllabe doit être un nombre.`
                return res.status(400).json({ message })
            }
        
            if (req.query.limit) {
                if (isNaN(limit)) return res.status(400).json({ messsage: `La limite doit être un nombre.` })
                if (limit < 1) return res.status(400).json({ message: `La limite ne peut pas être inférieure à 1.`})
                limit = parseInt(req.query.limit)
                if (limit >= 100) return res.status(400).json({ message: `La limite doit être inférieure ou égale à 100.`})   
            }

            req.query.nb = parseInt(req.query.nb)
            if (req.query.nb < 0) return res.status(400).json({ message: `Le nombre de solutions doit être supérieur à 0.`})
            
            const infos = await getSyllable(routeName, req.query.nb, limit)
            return res.status(200).json({ globalLength: infos.globalLength, message : infos.message, data: infos.global, sliced: infos.sliced})
            
        } catch(error) {
            if (error instanceof SyntaxError) {
                const message = `La chaine JSON est invalide`
                return res.status(400).json({ message })
            }
            return res.status(500)
        }
    })
}