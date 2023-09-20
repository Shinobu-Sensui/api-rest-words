
const { infoWord } = require('../utilitaires/function')
const auth = require('../auth/auth')

module.exports = (app) => {
    app.get(`/api/info/:word`, auth,  async (req, res) => {
        try {   
          let word = req.params.word 
          const regex = /^[a-z]+$/i;
          if (!regex.test(word)) return res.status(400).json({
            message: `Le paramètre doit être uniquement une chaîne de caractères.`
          })

          if (word)  return res.status(200).json(await infoWord(word.toLowerCase()))
          
        } catch(error) {
            if (error instanceof SyntaxError) {
                const message = `La chaine JSON est invalide`
                return res.status(400).json({ message })
            }
            return res.status(500)
        }
    })
}