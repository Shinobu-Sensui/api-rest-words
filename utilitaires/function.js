
const fs = require('fs')
const { readFile, writeFile } = require('fs/promises')
const { dirname } = require('path')
const path = require('path')
const safeRegex = require('safe-regex');
const sub = require('../sub6')

const stringTypeValues = (...args) => {
    const chaines = []
    for (const valeur of args) if (typeof valeur === 'string') chaines.push(valeur);
    return chaines
}

const detectItemsDeleted = (array, elementsToDelete) => {
    let itemsDeleted = [], items = [];
    array.forEach(word => {
        if (elementsToDelete.includes(word)) itemsDeleted.push(word)   
        else items.push(word)
    })
    const message = `${ 
        itemsDeleted.length === 0 ? 'Aucun mot n\'a été supprimé.' :
        itemsDeleted.length === 1 ? `${ itemsDeleted.length } mot a été supprimé : ${ itemsDeleted.join('') }.` :
        `${ itemsDeleted.length } mots ont été supprimés : ${ itemsDeleted.join(' ') }.`
    }`

    return {
        initArray: array,
        result: items, 
        itemsDeleted: itemsDeleted,
        message: message
    }

}

const detectItemsAdded = (array1, array2) => {
    let set1 = new Set(array1);
    let set2 = new Set(array2);
    let itemsAdded = [], itemsInArray = []

    for(let element of set2) {
        if (set1.has(element)) {
            itemsInArray.push(element)
        }
        else {
            set1.add(element)
            itemsAdded.push(element)   
        }  
    }

    const fractmessage1 = `${ 
            itemsAdded.length === 0 ? 'Aucun mot n\'a été ajouté.' :
            itemsAdded.length === 1 ? `${ itemsAdded.length } mot a été ajouté : ${ itemsAdded.join('') }.` :
            `${ itemsAdded.length } mots ont été ajoutés : ${ itemsAdded.join(' ') }.`
        }`

    const fractmessage2 = `${  itemsInArray.length === 0 ? '' :
            itemsInArray.length === 1 ? `${ itemsInArray.length } mot identique a été détecté : ${ itemsInArray.join('') }.` :
            `${ itemsInArray.length } mots identiques ont été détectés : ${ itemsInArray.join(' ') }.`
        } `

    const message = `${ fractmessage1 } ${fractmessage2}`

    return {
        doublonsDetected: itemsInArray, 
        itemsAdded: itemsAdded, 
        message: message,
        result: [...set1]
    }  
}

const loadFile = async (file) => {
    const list = await readFile(file, 'utf-8')  
    return list?.length ? list.split('\n') : list.split('')
}

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const trouverTousLesSousChaines = (t , z = (n, f) => [...Array(n)].map((_, i) => f(i))) => {
    return t.map(v => v.includes('-') ? v.replace(/-/g, '') : v)
    .map(x => z(2, i => [...new Set(z(x.length - i - 1, j => x.substr(j, i + 2)))])).flat(2).reduce((a, b) => (a[b] = (a[b] || 0) + 1, a), {})
}


const write = async (path, obj) => await writeFile(path, JSON.stringify(obj), 'utf8', err => console.error(err))

exports.getSyllables = async (routeName) => {
    const listString = await readFile(`./listes/syllables/${ routeName }.txt`, 'utf-8')
    const list = await JSON.parse(listString) 
    const listLength = Object.keys(list).length
    
    return {
        global: listLength,
        data : list
    }
}

const listOutVerbes = async () => {
    const verbesString = await loadFile('../listes/verbes/verbes.txt')
    const dictionnaire = await loadFile('../listes/dictionnaire.txt')
    const verbs = verbesString.split('\n').map(x => x.replace('\r', ''))
    const dicoVerbsRemoved = removeMatchedElements(dictionnaire, verbs).join('\n')
    await writeFile('../listes/verbes/dictionnaire.txt', dicoVerbsRemoved)
}


exports.getSyllable = async (routeName, nb, limit) => {
    try {
        const listString = await readFile(`./listes/syllables/${ routeName }.txt`, 'utf-8')
        const list = await JSON.parse(listString)
        const result = Object.keys(list).filter(syllabe => list[syllabe] === nb)
        const globalLength = result.length
        const resultsliced = result.slice(0, limit)
        const resultslicedLength = resultsliced.length
        const message = 
            result === 0 ? `Aucune syllabe n\'a été trouvée pour le nombre ${ nb }.` :
            result.length === 1 ? `${ result.length } syllabe a été trouvée.` :
            `${ resultsliced.length } syllabes ont été trouvées.`
        
        return {
            message: message,
            sliced: resultsliced, 
            slicedLenght: resultslicedLength,
            global: result,
            globalLength : globalLength
        }

    } catch(error) {
        console.error(error)
    }
}

exports.generateLists = async (routeName) => {
    const list = await loadFile(`./listes/${ routeName }.txt`) 
    await write(`./listes/syllables/${ routeName }.txt`, trouverTousLesSousChaines(list))
    const listOcc = await readFile(`./listes/syllables/${ routeName }.txt`, 'utf-8')
    return JSON.parse(listOcc)
}

const removeMatchedElements = (a, b) => {
    a = new Set(a), b = new Set(b);
    let c = [];
    for(const element of a) !b.has(element) && c.push(element)
    return c   
}

const wordExplodeLetters = (word) => {
    const w = word.replace(/[w-zW-Z]/g, '')
    if (w.match(/^[a-zA-Z]+$/)) return { word : word, size:  new Set([...w]).size }
}

const generateObjExplodeLetters = (dictionnaire) => {
    return dictionnaire.map(wordExplodeLetters).sort((a, b) => b.size - a.size)
}

exports.chooseNbExplodeletters = async (routeName, nbLetters, limit) => {
    const elements = await loadFile(`./listes/${ routeName }.txt`) 
    const transformDico = generateObjExplodeLetters(elements)
    const listNotFormat = transformDico.filter(element => element.size === nbLetters)
   
    const list = listNotFormat.reduce((acc, { word, size }, i) => {
        i === 0 && (acc.size = size);
        acc.content.push(word)
        return acc
    }, { content: [] })

    shuffle(list.content)
    const listLength = list.content.length
    const listSliced = list.content.slice(0, limit)
    const listSlicedLength = listSliced.length
    
    const message = `${ 
        listSlicedLength === 0 ? `Aucun mot n\'a été trouvé pour ce nombre.` :
        listSlicedLength === 1 ? `${ listSliced.length } mot a été trouvé.` :
        `${ listSlicedLength } mots ont été trouvés.`
    }`

    return {
        nb: list.size,
        message, 
        globalLength: listLength,
        data:listSliced
    }   
}

exports.findLengthElement = async (uri, taille) => {
    const array = await loadFile(uri) || []
    let message, elements = [], elementsSliced = [];
    try {
        elements = shuffle(array.filter(element => element.length === taille))
        elementsSliced = elements.slice(0, 30)
        message = `${ 
            elementsSliced.length === 0 ? `Aucun mot n\'a été trouvé pour la taille ${ taille }.` :
            elementsSliced.length === 1 ? `${ elementsSliced.length } mot a été trouvé.` :
            `${ elementsSliced.length } mots ont été trouvés.`
        }`      
        
    } catch(e) {
        console.error(e)
    }
    return {
        message: message, 
        globalLength: elements.length,
        result:  elementsSliced 
    }
}

exports.findElement = async (uri, limit, syllabe) => {
    const array = await loadFile(uri) || []
    const regex = new RegExp(syllabe)
    let message, elements = [], elementsSliced = [];

    try {
        if (safeRegex(regex)) {
            elements = shuffle(array.filter(element => element.match(syllabe)))
            elementsSliced = elements.slice(0, limit)
            message = `${ 
                elementsSliced.length === 0 ? `Aucun mot n\'a été trouvé pour la syllabe ${ syllabe }.` :
                elementsSliced.length === 1 ? `${ elementsSliced.length } mot a été trouvé.` :
                `${ elementsSliced.length } mots ont été trouvés.`
            }`
        } else {
            message = `L'expression régulière insérée n'est pas adapatée. Réessayez avec une formulation valide.`
        }
    } catch(e) {
        console.error(e)
    }
    return {
        message: message, 
        globalLength: elements.length,
        result:  elementsSliced 
    }
}

exports.findAllItem = async(uri) => {
    const list = await loadFile(uri)
    return list
}

exports.newItems = async (uri, ...word) => {
    const list = await loadFile(uri) || []
    const toBeAdded = stringTypeValues(...word)
    const arrayInfos = detectItemsAdded(list, toBeAdded)
    const insertionResult = arrayInfos.result
    const textifiedArray = insertionResult.join('\n')
    fs.writeFile(uri, textifiedArray, 'utf8', (err) => {
        if (err) throw err
    })
    return arrayInfos
}

exports.removeItems = async (uri, ...word) => {
    let myList = await loadFile(uri) || []
    const toBeDeleted = stringTypeValues(...word)
    const arrayInfos = detectItemsDeleted(myList, toBeDeleted)
    const cleanedArray = arrayInfos.result
    const textifiedArray = cleanedArray.join('\n')
    fs.writeFile(uri, textifiedArray, 'utf8', (err) => {
        console.log(arrayInfos)
        if (err) throw err
    })
    return arrayInfos
}

const cut = (list) => {
    const o = [], len = list.length - 1
    for(let i = 0; i < len; i++) o.push(list.slice(i, i + 2), list.slice(i, i + 3))
    return o
}

const cutter = (list) => {
    const o = [], len = list.length - 1
    for(let i = 0; i < len; i++) o.push(list.slice(i, i + 2), list.slice(i, i + 3))
    return [...new Set(o)]
}

exports.getocc = async (routeName, currentpage, results) => {
    const coeff = currentpage - 1   
    const firstpage =  results * coeff 
    const lastpage = firstpage + results 
    const listJSON = await readFile(`./listes/occ/${ routeName }.txt`, 'utf-8')
    const list = await JSON.parse(listJSON)
    const res = list.slice(firstpage, lastpage)
    console.log(list)
    let message = `Succès`
    if (res.length === 0) {
        message = `Aucune solution n'a été trouvée.`
    }
    return {
        message, 
        data: res
    }
}

exports.generateOccList = async (routeName) => {
    const json_dictionnaire = await readFile(`./listes/${ routeName }.txt`, 'utf-8')
    const json_syllables = await loadFile(`./listes/syllables/${ routeName }.txt`)
    const syllables = JSON.parse(json_syllables)
    const dictionnaire = json_dictionnaire.split('\n')
    const diko = dictionnaire.reduce((acc, val) => {
        let s = cutter(val)
        if (s.filter(x => syllables[x] < 100).length) acc.push(val)
        return acc  
    }, [])

    const results = diko.reduce((acc, val) => {
        const sy = cutter(val)
        acc[val] = {   
            word: val,
            sy: sy.map(x => ({ syName: x, occ: 1 / syllables[x] })).sort((a, b) => a.occ - b.occ),
            len: sy.length, globalocc: sy.reduce((acc, val) => acc + (1 / syllables[val]), 0) 
        }
            return acc
       }, {})
       
    const result = Object.values(results).sort((a, b) => b.globalocc - a.globalocc)
    const final = result.map((x, index) => ({ ...x, 
        level: x.sy.reduce((acc, b) => {
            let min = x.sy[0].occ
            let max = x.sy[x.sy.length - 1].occ
            if (b.occ === min) acc.min.push(b.syName) 
            else if (b.occ === max) acc.max.push(b.syName) 
            return acc
    }, { min : [], max : []}),  
        rang: `top ${ index + 1 }`}) );
    console.log(final.slice(0, 1)[0].level)
    const detectFolder = 'verbes'
    if (!fs.existsSync(`./listes/occ/${ detectFolder }`)) fs.mkdirSync(`./listes/occ/${ detectFolder }`, { recursive: true});  
    await writeFile(`./listes/occ/${ routeName }.txt`, JSON.stringify(final)) 
}

exports.infoWord = async (word) => {
    const dictionnaire = await loadFile('./listes/dictionnaire.txt')
    const adverbes = await loadFile('./listes/adverbes.txt')
    const gentiles = await loadFile('./listes/gentiles.txt')
    const fleurs = await loadFile('./listes/fleurs.txt')
    const verbes = await loadFile('./listes/verbes/verbes.txt')
    const syllablesJSON = await readFile('./listes/syllables/dictionnaire.txt', 'utf-8')
    const syllables = JSON.parse(syllablesJSON)

    let message
    if (!dictionnaire.includes(word)) {
        message = `Le mot ${ word } n'est pas répertorié dans le dictionnaire.`;
        return { message }
    }
    message = `succès`

    const wordOrigin = [] 
        if (adverbes.includes(word)) wordOrigin.push('adverbe')
        if (fleurs.includes(word)) wordOrigin.push('fleur')
        if (gentiles.includes(word)) wordOrigin.push('gentilé')
        if (verbes.includes(word)) wordOrigin.push('verbe')
    wordOrigin.length === 0 && wordOrigin.push(`Mot pas encore classé.`)

    const wordInElementSize = dictionnaire.filter(x => x.includes(word)).length
    const messageWordInElement = 
        wordInElementSize === 1 ? 
                `Le mot ${ word } est répertorié une seule fois comme un sous-mot dans le dictionnaire.` : 
        wordInElementSize > 1 ? 
                `Le mot ${ word } est répertorié ${ wordInElementSize } fois comme un sous-mot dans le dictionnaire.` :
                ''

    const wordOcc = cutter(word).reduce((acc, val) => {
        acc.push({ val : val, occ : syllables[val] }) 
        return acc
    },[])
        .sort((a, b) => a.occ - b.occ)
    const wordExplode = wordExplodeLetters(word)

    return {
        message, 
        occClassement : wordOcc, 
        wordInElementSize, 
        wordOrigin,
        word, 
        explodeLetters: wordExplode.size
    }
}

exports.findWordsWithSyllable = async (routeName, syllable) => {
    const json_dictionnaire = await readFile(`./listes/${ routeName }.txt`, 'utf-8')
    const list = json_dictionnaire.split('\n')
    return list.filter(word => (word.match(new RegExp(syllable, "g")) || []).length >= 2);
}

async function createUserModel(userBody, res) {
    if (typeof userBody === "object" && Array.isArray(userBody)) {
        res.status(400).json('Seul un objet valide peut être inséré.');
        return;
    } else if (typeof userBody === "object") {
        const filepath = path.resolve(__dirname, '../auth/', 'users.json');
        let users = await readFile(filepath, 'utf-8');
        let userParse = users === '' ? [] : JSON.parse(users);
        const matchUsername = userParse.filter(user => userBody.username === user.username);
        if (!matchUsername.length)
            userParse.push(userBody);
        const textified = JSON.stringify(userParse);
        fs.writeFile(filepath, textified, 'utf8', (error) => {
            if (error)
                throw error;
        });
    } else {
        return res.status(400).json({ message: 'Problème de syntaxe.' });
    }

}

const obj = {}
function getRandomIntInclusive(min, max) {
  if (min > max) {
    return undefined;
  }
  min = Math.ceil(min);
  max = Math.floor(max);
  if (max - min + 1 <= 0) {
    return undefined;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.createUser =  (username, password, bcrypt) => {
     bcrypt.hash(password, 10).then(async hash => 
         await createUserModel({ username: username, password: hash})   
    )
}

exports.getUsers = async () => {
    const users = await readFile('./auth/users.json', 'utf-8')
    return JSON.parse(users)
}

exports.objSyllabEffect = async (list, choose, routeName) => {
    const listText = await readFile(`./listes/syllables/${ routeName }.txt`, err => console.error(err))
    const obj = await JSON.parse(listText)
    const sy = [...new Set(list.flatMap(cut))]
    if (sy?.length === 0) return false
    sy.map(element => {
        if (choose === "delete") obj[element] > 0 && obj[element]-- 
        else if (choose === "add")!obj[element] ? obj[element] = 1 : ++obj[element]
    }) 
    await write(`./listes/syllables/${ routeName }.txt`, obj)
}