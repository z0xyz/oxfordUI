// ==UserScript==
// @name         oxford-dictionary
// @version      0.2
// @description  Auto pronounce as soon as the forvo page loads .
// @author       z0xyz
// @match        https://www.oxfordlearnersdictionaries.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @run-at       document-end
// ==/UserScript==

let emptyString = ''
let current_number = -1
let definitioneElement = document.getElementsByClassName("def")
let definitionsLength = definitioneElement.length

function currentSegment(number) {
    let returnValue = definitioneElement.item(number).closest("li")
    if (returnValue == null) {
        return (definitioneElement.item(number).parentElement.parentElement)
    }else {
        return (returnValue)
    }
}

function printTextualData(){
    let pageSegment = definitioneElement.item(current_number)
    let ultimateString = ""

    console.log(current_number)
    if (current_number == 0) {
        let wordType = document.getElementsByClassName("pos").item(0).textContent
        ultimateString += `(${wordType})\n`
    }
	// I guess i should figure out a way to evade these multiple try catch statement
    try {
        let wordDefinitioncategory = pageSegment.closest("li").parentElement.getElementsByClassName("shcut").item(0).textContent
        ultimateString += `${wordDefinitioncategory}\n`
    }catch {
        console.log("missing element!")
    }
    try {
        let definitionTopic = document.getElementsByClassName("topic-g").item(0).textContent.slice(0,-2)
        ultimateString += `${definitionTopic}\n`
    }catch {
        console.log("missing elemenent!")
    }

    let wordDefinition = pageSegment.textContent
    ultimateString += `${wordDefinition} \n`

	let wordThesaurus = document.getElementsByClassName("prefix").item(0).parentElement
	ultimateString += (wordThesaurus.previousElementSibling.className == 'def') ? `${wordThesaurus.textContent}\n` : emptyString

    try {
        let defintionExamplesCount = currentSegment(current_number).getElementsByClassName("x-gs").item(0).getElementsByClassName("x").length
        for (let x = 0 ; x < defintionExamplesCount ; x++) {
            try {
                let wordExample = currentSegment(current_number).getElementsByClassName("x-gs").item(0).getElementsByClassName("x").item(x)
                let wordAbstractUsage = wordExample.parentElement.getElementsByClassName("cf").item(0)
                ultimateString += `\t${wordAbstractUsage.textContent} \n\t\t${wordExample.textContent}\n`
            }catch {
                let wordExample = currentSegment(current_number).getElementsByClassName("x-gs").item(0).getElementsByClassName("x").item(x)
                ultimateString += `\t${wordExample.textContent}\n`
            }
        }

    }catch {
        console.log("There aren't any definition examples!")
    }

    navigator.clipboard.writeText(ultimateString)
}

function abstractHighlighter(current_number,previous_number){
    try {
        let pageSegmentNode = currentSegment(current_number)
        pageSegmentNode.style = "border:solid thin lightblue;border-radius:3px ; background-color:#d8d8d8"
        pageSegmentNode.scrollIntoView ({ behavior:"smooth", block:"center" })
    }catch {
        console.log("Operation not successful")
    }
    try {
        let previouspageSegmentNode = currentSegment(previous_number)
        previouspageSegmentNode.style = ""
        previouspageSegmentNode.scrollIntoView ({ behavior:"smooth", block:"nearest" })
    }catch {
        console.log("Operation not successful")
    }
}

function segmentHighlighter(keypressEvent) {
    if (keypressEvent.shiftKey && keypressEvent.key == "Tab") {
        if (current_number < 1) {
            keypressEvent.preventDefault()
        }else {
            keypressEvent.preventDefault()
            current_number --
            abstractHighlighter(current_number,current_number+1)
        }
    }else if (keypressEvent.key == "Tab") {
        if (current_number > definitionsLength-1) {
            keypressEvent.preventDefault()
        }else {
            keypressEvent.preventDefault()
            current_number ++
            abstractHighlighter(current_number,current_number-1)
        }
    }else if (keypressEvent.key == "Enter"){
        keypressEvent.preventDefault()
        printTextualData()
    }
    else if (keypressEvent.code == "Space"){
        keypressEvent.preventDefault()
        document.getElementsByClassName("icon-audio").item(0).click()
    }
}
window.addEventListener("keydown",segmentHighlighter,false)
