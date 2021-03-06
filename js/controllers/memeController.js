'use strict'

var gCanvas
var gCtx
var gStartPos
var gIsMove = false
var gIsSelected = false
var gMoveStartPos
var gData
var gIsFirstRender = true
var gSavedMemes = []
var gIsStorageMeme = false
var gCurrId
const DEFAULT_TEXT = 'Enter text here'
const STORAGE_KEY = 'memesDB'

const gTouchEvs = ['touchstart', 'touchmove', 'touchend']

function onInit() {
    gCanvas = document.querySelector('canvas')
    gCtx = gCanvas.getContext('2d')
    initMeme(0)
    renderMeme()
    setTimeout(() => {
        gIsFirstRender = true
    }, 100)
    renderGallery()
    addListeners()
    resizeCanvas()
}

function renderMeme() {
    document.querySelector('.gallery').classList.add('hide')
    document.querySelector('.editor').classList.remove('hide')
    document.querySelector('.saved-memes').classList.add('hide')
    var currMeme = getMeme()
    var img = new Image()
    img.onload = () => {
        gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height)
        if (currMeme.lines.length) {
            drawText(currMeme)
        }
        if (gIsFirstRender) {
            _toggleInputs(true)
            gIsFirstRender = false
        }
        if (gIsSelected) _drawTextBorder(currMeme.lines[currMeme.selectedLineIdx])
        gData = gCanvas.toDataURL()
    }
    img.src = `assets/img/${currMeme.selectedImgId}.jpg`
}

function drawText(currMeme) {
    gCtx.lineWidth = 3
    currMeme.lines.forEach(line => {
        gCtx.fillStyle = line.color
        gCtx.font = `${line.size}px ${line.font}`
        gCtx.textAlign = line.align
        gCtx.strokeStyle = line.stroke
        line.width = gCtx.measureText(line.txt).width
        gCtx.fillText(line.txt, line.pos.x, line.pos.y)
        gCtx.strokeText(line.txt, line.pos.x, line.pos.y)
    })
}

function addListeners() {
    addMouseListeners()
    addTouchListeners()
    window.addEventListener('resize', () => {
        resizeCanvas()
    })
}

function addMouseListeners() {
    gCanvas.addEventListener('mousemove', onMove)
    gCanvas.addEventListener('mousedown', onDown)
    gCanvas.addEventListener('mouseup', onUp)

}

function addTouchListeners() {
    gCanvas.addEventListener('touchmove', onMove)
    gCanvas.addEventListener('touchstart', onDown)
    gCanvas.addEventListener('touchend', onUp)
}

function onDown(ev) {
    const pos = getEvPos(ev)
    var meme = getMeme()
    if (!meme.lines.length) return
    var textIdx = getText(pos)
    if (textIdx < 0) {
        _setDefaultText()
        _toggleInputs(true)
        renderMeme()
        return
    }
    meme.selectedLineIdx = textIdx;
    gIsMove = true
    gMoveStartPos = pos
    gIsSelected = true
    _getFocus(meme, textIdx)
    renderMeme()
    document.body.style.cursor = 'grabbing'
}

function onMove(ev) {
    ev.stopPropagation()
    if (!gIsMove) return
    var pos = getEvPos(ev)
    var meme = getMeme()
    var xDiff = pos.x - gMoveStartPos.x
    var yDiff = pos.y - gMoveStartPos.y
    meme.lines[meme.selectedLineIdx].pos.x += xDiff
    meme.lines[meme.selectedLineIdx].pos.y += yDiff
    gMoveStartPos = pos
    renderMeme()
    _toggleInputs(true)
}

function onUp() {
    if (gIsMove) {
        var meme = getMeme()
        _getFocus(meme, meme.selectedLineIdx)
        setTimeout(() => {
            _toggleInputs(false)
        })
    }
    gIsMove = false
    document.body.style.cursor = 'grab'
}

function _drawTextBorder(lineObj) {
    var lineWidth = lineObj.width
    var lineHeight = lineObj.size * 1.286
    gCtx.strokeStyle = 'black'
    gCtx.lineWidth = 3
    gCtx.fillStyle = 'rgba(255,255,255,0.25)'
    var rectXCord = lineObj.pos.x - (lineWidth / 2)
    if (lineObj.align === 'left')
        rectXCord += lineWidth / 2
    else if (lineObj.align === 'right')
        rectXCord -= lineWidth / 2
    gCtx.strokeRect(rectXCord, lineObj.pos.y - (lineHeight / 2) - 10, lineWidth, lineHeight)
    gCtx.fillRect(rectXCord, lineObj.pos.y - (lineHeight / 2) - 10, lineWidth, lineHeight)
}

function resizeCanvas() {
    var viewPortWidth = document.documentElement.clientWidth
    if (viewPortWidth > 1000) {
        gCanvas.width = viewPortWidth * 0.325
        gCanvas.height = viewPortWidth * 0.325
    } else if (viewPortWidth > 740) {
        gCanvas.width = viewPortWidth * 0.5
        gCanvas.height = viewPortWidth * 0.5
    } else if (viewPortWidth > 640) {
        gCanvas.width = viewPortWidth * 0.6
        gCanvas.height = viewPortWidth * 0.6
    } else if (viewPortWidth > 440) {
        gCanvas.width = viewPortWidth * 0.75
        gCanvas.height = viewPortWidth * 0.75
    } else {
        gCanvas.width = viewPortWidth * 0.95
        gCanvas.height = viewPortWidth * 0.95
    }
    if (!gIsFirstRender) {
        renderMeme()
    }
}

function getEvPos(ev) {
    var pos = {
        x: ev.offsetX,
        y: ev.offsetY
    }
    if (gTouchEvs.includes(ev.type)) {
        ev.preventDefault()
        ev = ev.changedTouches[0]
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop
        }
    }
    return pos
}

function onAddLine() {
    addLine()
    var meme = getMeme()
    var textIdx = getCurrLine()
    _getFocus(meme, textIdx)
    gIsSelected = true
    renderMeme()
    _toggleInputs(false)
}

function onDeleteLine() {
    if (!gIsSelected) return
    deleteLine()
    gIsSelected = false
    renderMeme()
    _toggleInputs(true)
    onSwitchLine()
}

function onSetLineText() {
    if (!gIsSelected) return
    setLineText()
}

function onSetFontSize(sizeDiff) {
    if (!gIsSelected) return
    setFontSize(sizeDiff)
    renderMeme()
}

function onSetColor(color, colorType) {
    if (!gIsSelected) return
    setColor(color, colorType)
    renderMeme()
}

function onSwitchLine() {
    var meme = getMeme()
    var linesLength = meme.lines.length
    if (!linesLength) return
    var lineIdx = meme.selectedLineIdx
    lineIdx++
    if (lineIdx === linesLength) lineIdx = 0
    gIsSelected = true
    meme.selectedLineIdx = lineIdx
    renderMeme()
    _getFocus(meme, meme.selectedLineIdx)
    gIsMove = false
    _toggleInputs(false)
}

function onSetFontType(fontType) {
    if (!gIsSelected) return
    setFontType(fontType)
    renderMeme()
    _toggleInputs(false)
}

function onSetTextAlign(align) {
    if (!gIsSelected) return
    setTextAlign(align)
    renderMeme()
}

function initDownload() {
    document.querySelector('.download-btn-link').click()
}

function onDownload(elLink, ev) {
    ev.stopPropagation()
    gIsSelected = false
    renderMeme()
    elLink.href = gData
    elLink.download = 'Meme'
}

function getCanvas() {
    return gCanvas
}

function _getFocus(meme, lineIdx) {
    var textInput = document.querySelector('.text-input')
    var fillInput = document.querySelector('.fill-input')
    var strokeInput = document.querySelector('.stroke-input')
    var fontInput = document.querySelector('.font-input')
    textInput.value = ``
    var txt = meme.lines[lineIdx].txt
    txt !== DEFAULT_TEXT ? textInput.value = txt : textInput.placeholder = txt
    fillInput.value = meme.lines[lineIdx].color
    strokeInput.value = meme.lines[lineIdx].stroke
    fontInput.value = meme.lines[lineIdx].font
    textInput.focus()
}

function _setDefaultText() {
    gIsSelected = false
    var textInput = document.querySelector('.text-input')
    textInput.value = ``
    textInput.placeholder = `Enter text here`
    setTimeout(() => {
        textInput.focus()
    })
}

function _toggleInputs(toggle) {
    var fillInput = document.querySelectorAll('.fill-input')
    var strokeInput = document.querySelectorAll('.stroke-input')
    var fontInput = document.querySelector('.font-input')
    var fontIncBtn = document.querySelector('.font-inc-btn')
    var fontDecBtn = document.querySelector('.font-dec-btn')
    var delLineBtn = document.querySelector('.del-line-btn')
    var textAlignBtn = document.querySelectorAll('.text-align-btn')
    fillInput.forEach(input => input.disabled = toggle)
    strokeInput.forEach(input => input.disabled = toggle)
    fontInput.disabled = toggle
    fontIncBtn.disabled = toggle
    fontDecBtn.disabled = toggle
    delLineBtn.disabled = toggle
    textAlignBtn.forEach(btn => {
        btn.disabled = toggle
    })
}

function renderSavedMemes() {
    gIsStorageMeme = true
    document.querySelector('.gallery').classList.add('hide')
    document.querySelector('.editor').classList.add('hide')
    document.querySelector('.saved-memes').classList.remove('hide')
    gSavedMemes = loadFromStorage(STORAGE_KEY)
    if (!gSavedMemes) return
    var strHTMLs = ''
    gSavedMemes.forEach(meme => {
        var memeDataUrl = meme.imgData
        strHTMLs += `<img onclick="renderStorageMeme('${meme.id}')" src="${memeDataUrl}" alt=""></img>`
    })
    gIsFirstRender = true
    gIsSelected = false
    document.querySelector('.saved-memes-container').innerHTML = strHTMLs
}

function renderStorageMeme(memeId) {
    gCurrId = memeId
    const storage_meme = gSavedMemes.find(meme => meme.id === memeId).meme
    gMeme = storage_meme
    renderMeme()
}

function onSaveToStorage() {
    var meme = getMeme()
    if (gIsStorageMeme) {
        var memeIdx = gSavedMemes.findIndex(meme => meme.id === gCurrId)
        gSavedMemes.splice(memeIdx, 1)
    }
    gSavedMemes.push({
        meme: meme,
        imgData: gData,
        id: makeId()
    })
    saveToStorage(STORAGE_KEY, gSavedMemes)
    renderSavedMemes()
}