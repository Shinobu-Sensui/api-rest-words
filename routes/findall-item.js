
const auth = require('../auth/auth')
const { findAllItem } = require('../utilitaires/function')

module.exports = (app, routeName) => {
    app.get(`/api/${routeName}/all`, auth, async (req, res) => {
        try {
            const elements = await findAllItem(`./listes/${ routeName }.txt`)
            return res.status(200).json({ data: elements })
            
        } catch(error) {
            if (error instanceof SyntaxError) {
                const message = `La chaine JSON est invalide`
                return res.status(400).json({ message: message })
            }
            return res.status(500).json({ message: "Rééssayez dans quelques instants."})
        }
    })
}