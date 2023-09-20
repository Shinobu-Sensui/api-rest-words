
const { findElement, findLengthElement } = require('../utilitaires/function')
const auth = require('../auth/auth')

module.exports = (app, routeName) => {
    app.get(`/api/${ routeName }`, auth,  async (req, res) => {
        try {
            const requests = Object.keys(req.query).length
            let taille = req.query.taille
            if (taille && requests == 1) {
                if (isNaN(taille)) return res.status(400).json({ message: `La valeur du paramètre taille doit être un nombre.`})
                taille = parseInt(taille)
                if (taille < 1 || taille >= 100) return res.status(400).json({ message: 'La taille du mot doit être supérieure au nombre 1 et inférieure ou égale au nombre 100.'})
                const infos = await findLengthElement(`./listes/${ routeName }.txt`, taille)
                return res.status(200).json({ globalLength: infos.globalLength, message : infos.message, data: infos.result })

            } else {
                let limit = 10
                if (!req.query.syllabe) return res.status(400).json({ messsage: `La paramètre syllabe doit être défini dans l'url.` })
                if (!typeof req.query.syllabe === "string") {
                    const message = `La demande est invalide : la valeur du paramètre syllabe doit être une chaîne de caractères.`
                    return res.status(400).json({ message })
                }
                
                if(req.length > 40) return res.status(400).json({ message: `La taille de la syllabe est trop grande. `})
                
                if (req.query.limit) {
                    if (isNaN(limit)) return res.status(400).json({ messsage: `La limite doit être un nombre.` })
                    limit = parseInt(req.query.limit)
                    if (limit < 1 || limit >= 100) return res.status(400).json({ message: 'La limite doit être supérieure au nombre 1 et inférieure ou égale au nombre 100.'})
                }
                
                try {
                    const infos = await findElement(`./listes/${ routeName }.txt`, limit, req.query.syllabe.toLowerCase())
                    return res.status(200).json({ globalLength: infos.globalLength, message : infos.message, data: infos.result })
                } catch(err) {
                    console.error(err)
                }
            }
            
        } catch(error) {
            if (error instanceof SyntaxError) {
                const message = `La chaine JSON est invalide`
                return res.status(400).json({ message })
            }
            return res.status(500)
        }
    })
}