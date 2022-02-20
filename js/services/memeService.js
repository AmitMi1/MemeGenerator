'use strict'

var gCurrLine = 0
var gMeme

function initMeme(imgId) {
    var canvas = getCanvas()
    gMeme = {
        selectedImgId: imgId,
        selectedLineIdx: 0,
        lines: [
            {
                txt: 'Enter text here',
                size: 40,
                align: 'center',
                color: '#ffffff',
                stroke: '#000000',
                font: 'font1',
                width: null,
                pos: { x: canvas.width / 2, y: canvas.height / 10 }
            }]
    }
}

function getMeme() {
    return gMeme
}

function setMeme(imgId, imgDataUrl) {
    gMeme.selectedImgId = imgId
    // renderMeme()
}

function setImg(imgId) {
    initMeme(imgId)
    gIsStorageMeme = false
    renderMeme()
}

function setLineText() {
    var newText = document.querySelector('.text-input').value
    var meme = getMeme()
    var lineIdx = meme.selectedLineIdx
    document.querySelector('.text-input').placeholder = `${meme.lines[lineIdx].txt}`
    meme.lines[lineIdx].txt = newText
    renderMeme()
}

function getText(clickPos) {
    var ctx = getCanvas().getContext('2d')
    var textIdx
    var align = gMeme.lines[gMeme.selectedLineIdx].align
    return gMeme.lines.findIndex(line => {
        var pos = line.pos
        if (align === 'left')
            textIdx = (clickPos.x - line.width / 2 <= pos.x + (line.width / 2) && clickPos.x - line.width / 2 >= pos.x - (line.width / 2) && clickPos.y <= pos.y && clickPos.y >= pos.y - line.size)
        else if (align === 'right')
            textIdx = (clickPos.x + line.width / 2 <= pos.x + (line.width / 2) && clickPos.x + line.width / 2 >= pos.x - (line.width / 2) && clickPos.y <= pos.y && clickPos.y >= pos.y - line.size)
        else if (align === 'center')
            textIdx = (clickPos.x <= pos.x + (line.width / 2) && clickPos.x >= pos.x - (line.width / 2) && clickPos.y <= pos.y && clickPos.y >= pos.y - line.size)
        return textIdx
    })

}

function addLine() {
    gCurrLine++
    gMeme.selectedLineIdx = gMeme.lines.length
    var canvas = getCanvas()
    var newLinePos = _getValidPos(gMeme.selectedLineIdx, canvas)
    gMeme.lines[gCurrLine] = {
        txt: 'Enter text here',
        size: 40,
        align: 'center',
        color: '#ffffff',
        stroke: '#000000',
        font: 'font1',
        width: null,
        pos: newLinePos
    }
}

function _getValidPos(gCurrLine, canvas) {
    if (gCurrLine === -1) gCurrLine = 0
    var linePos = { x: null, y: null }
    linePos.x = canvas.width / 2
    linePos.y = canvas.height / 2
    if (gCurrLine < 3) {
        switch (gCurrLine) {
            case 0:
                linePos.y = canvas.height / 10
                break
            case 1:
                linePos.y = canvas.height / 10 * 9
                break
            case 2:
                linePos.y = canvas.height / 2
                break
        }
    }
    gCurrLine++
    return linePos
}

function deleteLine() {
    var lineIdx = gMeme.selectedLineIdx
    gMeme.lines.splice(lineIdx, 1)
    if (gMeme.selectedLineIdx === -1) return
    gCurrLine--
    if (gMeme.selectedLineIdx > 0) {
        gMeme.selectedLineIdx--
    } else gMeme.selectedLineIdx = gMeme.lines.length - 1
}

function setFontSize(sizeDiff) {
    gMeme.lines[gMeme.selectedLineIdx].size += sizeDiff
}

function setColor(color, colorType) {
    if (colorType === 'fill') gMeme.lines[gMeme.selectedLineIdx].color = color
    else if (colorType === 'stroke') gMeme.lines[gMeme.selectedLineIdx].stroke = color
}

function setFontType(fontType) {
    gMeme.lines[gMeme.selectedLineIdx].font = fontType
}

function setTextAlign(align) {
    gMeme.lines[gMeme.selectedLineIdx].align = align
}

function getCurrLine() {
    return gCurrLine
}