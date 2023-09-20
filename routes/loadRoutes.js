module.exports = (app) => {
    const listes = ["dictionnaire", "gentiles", "fleurs", "adverbes", "verbes/dictionnaire", "verbes/verbes"]
    for(let liste of listes) {
        require('./create-item')(app, liste)
        require('./delete-item')(app, liste)
        require('./find-item')(app, liste)
        require('./findall-item')(app, liste)
        require('./syllable-root-generate')(app, liste)
        require('./find-syllable')(app, liste)
        require('./findall-syllable')(app, liste)
        require('./explodeLetters')(app, liste)
        require('./word-occ-generate')(app, liste)
        require('./find-occ')(app, liste)
    }   
       require('./info-item')(app)
       require('./syllable-root-generateAll')(app, listes)
       require('./word-occ-generateAll')(app, listes)


    app.use(({ res }) => {
        const message = `Impossible de trouver la ressource demandée. Vous pouvez essayer une autre URL.`
        res.status(404).json({ message })
    })
}
