const auth = require("../auth/auth")
const { getocc } = require('../utilitaires/function')

module.exports = (app, routeName) => {
    app.get(`/api/rares/${ routeName }`, auth, async (req, res) => {
        try {
        
            let page = req.query.page
            let solutions = 10
            if (page) {
                if (isNaN(page)) return res.status(400).json({ message: `La valeur du paramètre page doit être un nombre.`})
                taille = parseInt(page)
                if (req.query.soluce) {
                    if (isNaN(req.query.soluce)) return res.status(400).json({ message: `La valeur du paramètre page doit être un nombre.`})
                    if (req.query.soluce < 1) return res.status(400).json({ message: 'La valeur du paramètre soluce doit être supérieure au nombre 1 et inférieure ou égale au nombre 100.'})
                    solutions = parseInt(req.query.soluce)
                }
                if (page < 1) return res.status(400).json({ message: 'La valeur du paramètre page doit être supérieure au nombre 1.'})
                const infos = await getocc(routeName, page, solutions)
                return res.status(200).json({ data: infos.data, message: infos.message })
            }
            return res.status(400).json({ message: `Le paramètre page doit être renseigné.`})
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