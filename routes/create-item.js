
const auth = require('../auth/auth')
const { newItems, objSyllabEffect } = require('../utilitaires/function')

module.exports = (app, routeName) => {
    app.post(`/api/${ routeName }`, auth, async (req, res) => {
        try {
            const query = Object.keys(req.query)
            if (query.length) return res.status(404).json({ message: "Aucun paramètre ne doit être passé à l'url."})
            if (!Array.isArray(req.body.items)) {
                const message = `La demande est invalide : la propriété items doit être définie et être un tableau.`
                return res.status(400).json({ message })
            }
            if (req.body.items.length > 400) return res.status(400).json({ message: "Vous essayez d'insérer trop de mots."})
            
            req.body.items = req.body.items.map(element => element.toLowerCase())

            const infos = await newItems(`./listes/${ routeName }.txt`, ...req.body.items)
                          await objSyllabEffect(req.body.items, 'add', routeName)
            return res.status(200).json({ message: infos.message})
            
        } catch(error) {
            console.error(error)
            if (error instanceof SyntaxError) {
                const message = `La chaine JSON est invalide`
                return res.status(400).json({ message: message })
            }
            return res.status(500).json({ message: "Rééssayez dans quelques instants."})
        }
    })
}