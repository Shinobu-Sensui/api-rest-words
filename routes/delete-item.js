
const { removeItems, objSyllabEffect } = require('../utilitaires/function')
const auth = require('../auth/auth')

module.exports = (app, routeName) => {
    app.delete(`/api/${routeName}`, auth, async (req, res) => {
        try {
            if (!req.query.array) return res.status(400).json({ messsage: `La clé array doit être définie dans l'url.` })
            let deleteItems = JSON.parse(req.query.array)

            if (!Array.isArray(deleteItems)) {
                const message = `La demande est invalide : la clé array doit être un tableau.`
                return res.status(400).json({ message })
            }
            
            if (deleteItems.length >= 400) return res.status(400).json({ message: 'Il est impossible de supprimer plus de 400 mots.' }) 
            
            deleteItems = deleteItems.map(element => element.toLowerCase())
            
            const infos = await removeItems(`./listes/${ routeName }.txt`, ...deleteItems)
            await objSyllabEffect(deleteItems, 'delete', routeName)
           
            return res.status(200).json({ message : infos.message })
            
        } catch(error) {
            if (error instanceof SyntaxError) {
                const message = `La chaine JSON est invalide`
                return res.status(400).json({ message })
            }
            return res.status(500)
        }
    })
}