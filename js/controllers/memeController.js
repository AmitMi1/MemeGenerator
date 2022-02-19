'use strict'

var gCanvas
var gCtx
var gStartPos
var gIsMove = false
var gIsSelected = false
var gMoveStartPos
var gData
var gIsFirstRender = true
const DEFAULT_TEXT = 'Enter text here'

const gTouchEvs = ['touchstart', 'touchmove', 'touchend']

function onInit() {
    gCanvas = document.querySelector('canvas')
    gCtx = gCanvas.getContext('2d')
    initMeme(1)
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
    // document.querySelector('#about').classList.remove('hide')
    document.querySelector('.editor').classList.remove('hide')
    var currMeme = getMeme()
    var img = new Image()
    img.onload = () => {
        gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height)
        drawText(currMeme)
        if (gIsFirstRender) {
            // document.querySelector('canvas').click()
            _toggleInputs(true)
            gIsFirstRender = false
        }
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
        // renderMeme()
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
    // ev.stopPropagation()
    renderMeme()
    _setDefaultText()
    _toggleInputs(true)
    const pos = getEvPos(ev)
    var textIdx = getText(pos)
    if (textIdx < 0) return
    var meme = getMeme()
    meme.selectedLineIdx = textIdx;
    gIsMove = true
    gMoveStartPos = pos
    setTimeout(() => {
        _getFocus(meme, textIdx)
        _drawTextBorder(meme.lines[meme.selectedLineIdx])
    })
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
    setTimeout(() => {
        _drawTextBorder(meme.lines[meme.selectedLineIdx])
        _toggleInputs(true)
    })

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
    gIsSelected = true
    var gradient = _getGardient()
    var lineWidth = lineObj.width
    var lineHeight = lineObj.size * 1.286
    gCtx.strokeStyle = gradient
    gCtx.lineWidth = 1
    gCtx.fillStyle = 'rgba(0,0,0,0.15)'
    var rectXCord = lineObj.pos.x - (lineWidth / 2)
    if (lineObj.align === 'left')
        rectXCord += lineWidth / 2
    else if (lineObj.align === 'right')
        rectXCord -= lineWidth / 2
    gCtx.strokeRect(rectXCord, lineObj.pos.y - (lineHeight / 2) - 10, lineWidth, lineHeight)
    gCtx.fillRect(rectXCord, lineObj.pos.y - (lineHeight / 2) - 10, lineWidth, lineHeight)
    // _toggleInputs(false)
}

function _getGardient() {
    var gradient = gCtx.createLinearGradient(0, 0, 170, 0)
    gradient.addColorStop("0", "magenta")
    gradient.addColorStop("0.5", "blue")
    gradient.addColorStop("1.0", "red")
    return gradient
}

function resizeCanvas() {
    console.log(gIsFirstRender)
    const elContainer = document.querySelector('.gallery')
    // console.log(elContainer.offsetWidth)
    var viewPortWidth = document.documentElement.clientWidth
    if (viewPortWidth > 1000) {
        gCanvas.width = viewPortWidth * 0.325
        gCanvas.height = viewPortWidth * 0.325
    } else if (viewPortWidth > 740) {
        gCanvas.width = viewPortWidth * 0.5
        gCanvas.height = viewPortWidth * 0.5
    } else {
        gCanvas.width = viewPortWidth * 0.725
        gCanvas.height = viewPortWidth * 0.725
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
    _setDefaultText()
    addLine()
    var meme = getMeme()
    var textIdx = getCurrLine()
    _getFocus(meme, textIdx)
    renderMeme()
    setTimeout(() => {
        _drawTextBorder(meme.lines[meme.selectedLineIdx])
    })
}

function onDeleteLine() {
    if (!gIsSelected) return
    deleteLine()
    gIsSelected = false
    renderMeme()
    _toggleInputs(true)
}

function onSetLineText() {
    if (!gIsSelected) return
    var meme = getMeme()
    setLineText()
    setTimeout(() => {
        _drawTextBorder(meme.lines[meme.selectedLineIdx])
    })
}

function onSetFontSize(sizeDiff) {
    if (!gIsSelected) return
    var meme = getMeme()
    setFontSize(sizeDiff)
    renderMeme()
    setTimeout(() => {
        _drawTextBorder(meme.lines[meme.selectedLineIdx])
    })
}

function onSetColor(color, colorType) {
    if (!gIsSelected) return
    var meme = getMeme()
    setColor(color, colorType)
    renderMeme()
    setTimeout(() => {
        _drawTextBorder(meme.lines[meme.selectedLineIdx])
    })
}

function onSwitchLine() {
    var meme = getMeme()
    var linesLength = meme.lines.length - 1
    var lineIdx = meme.selectedLineIdx
    lineIdx === linesLength ? lineIdx = 0 : lineIdx++
    var ev = {
        offsetX: meme.lines[lineIdx].pos.x,
        offsetY: meme.lines[lineIdx].pos.y
    }
    onDown(ev)
    gIsMove = false
    _toggleInputs(false)
}

function onSetFontType(fontType) {
    if (!gIsSelected) return
    setFontType(fontType)
    renderMeme()
    var meme = getMeme()
    setTimeout(() => {
        _drawTextBorder(meme.lines[meme.selectedLineIdx])
        _toggleInputs(false)
    })
}

function onSetTextAlign(align) {
    if (!gIsSelected) return
    var meme = getMeme()
    setTextAlign(align)
    renderMeme()
    setTimeout(() => {
        _drawTextBorder(meme.lines[meme.selectedLineIdx])
    })
}

function initDownload() {
    document.querySelector('.download-btn-link').click()
}

function onDownload(elLink, ev) {
    ev.stopPropagation()
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
    var fillInput = document.querySelector('.fill-input')
    var strokeInput = document.querySelector('.stroke-input')
    var fontInput = document.querySelector('.font-input')
    var fontIncBtn = document.querySelector('.font-inc-btn')
    var fontDecBtn = document.querySelector('.font-dec-btn')
    var delLineBtn = document.querySelector('.del-line-btn')
    var textAlignBtn = document.querySelectorAll('.text-align-btn')
    fillInput.disabled = toggle
    strokeInput.disabled = toggle
    fontInput.disabled = toggle
    fontIncBtn.disabled = toggle
    fontDecBtn.disabled = toggle
    delLineBtn.disabled = toggle
    textAlignBtn.forEach(btn => {
        btn.disabled = toggle
    })
}