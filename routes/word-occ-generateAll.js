
const auth = require('../auth/auth')
const { generateOccList } = require('../utilitaires/function')

module.exports = (app, routeName) => {
    app.get(`/api/generate/occ/all`, auth, async (req, res) => {
        try {
            for(const list of routeName) await generateOccList(list);  
            const message = `Les données ont été récupérées avec succès.`
            return res.status(201).json({ message })
        } catch(error) {
            console.log(error)
            if (error instanceof SyntaxError) {
                const message = `La chaine JSON est invalide`
                return res.status(400).json({ message: message })
            }
            return res.status(500).json({ message: "Rééssayez dans quelques instants."})
        }
    })
}