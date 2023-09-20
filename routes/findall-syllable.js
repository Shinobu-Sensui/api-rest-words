const { getSyllables } = require('../utilitaires/function')
const auth = require('../auth/auth')

module.exports = (app, routeName) => {
    app.get(`/api/${ routeName }/syllable/all`, auth,  async (req, res) => {
        try {
            const infos = await getSyllables(routeName)
            return res.status(200).json({ global : infos.global, data: infos.data })
        } catch(error) {
            if (error instanceof SyntaxError) {
                const message = `La chaine JSON est invalide`
                return res.status(400).json({ message })
            }
            return res.status(500)
        }
    })
}