'use strict'

var gImgs = [
    { id: 1, url: `assets/img/1.jpg`, keywords: [`funny`, `cat`] },
    { id: 2, url: `assets/img/2.jpg`, keywords: [`funny`, `cat`] },
    { id: 3, url: `assets/img/3.jpg`, keywords: [`funny`, `cat`] },
    { id: 4, url: `assets/img/4.jpg`, keywords: [`funny`, `cat`] },
    { id: 5, url: `assets/img/5.jpg`, keywords: [`funny`, `cat`] },
    { id: 6, url: `assets/img/6.jpg`, keywords: [`funny`, `cat`] },
    { id: 7, url: `assets/img/7.jpg`, keywords: [`funny`, `cat`] },
    { id: 8, url: `assets/img/8.jpg`, keywords: [`funny`, `cat`] },
    { id: 9, url: `assets/img/9.jpg`, keywords: [`funny`, `cat`] },
    { id: 10, url: `assets/img/10.jpg`, keywords: [`funny`, `cat`] },
    { id: 11, url: `assets/img/11.jpg`, keywords: [`funny`, `cat`] },
    { id: 12, url: `assets/img/12.jpg`, keywords: [`funny`, `cat`] },
    { id: 13, url: `assets/img/13.jpg`, keywords: [`funny`, `cat`] },
    { id: 14, url: `assets/img/14.jpg`, keywords: [`funny`, `cat`] },
    { id: 15, url: `assets/img/15.jpg`, keywords: [`funny`, `cat`] },
    { id: 16, url: `assets/img/16.jpg`, keywords: [`funny`, `cat`] },
    { id: 17, url: `assets/img/17.jpg`, keywords: [`funny`, `cat`] },
    { id: 18, url: `assets/img/18.jpg`, keywords: [`funny`, `cat`] },
]

function renderGallery() {
    document.querySelector('.gallery').classList.remove('hide')
    document.querySelector('.editor').classList.add('hide')
    var strHTMLs = gImgs.map(img => {
        return `<img src="${img.url}" onclick="setImg(${img.id})" class="img-${img.id}">`
    })
    document.querySelector('.gallery-container').innerHTML = strHTMLs.join('')
    setTimeout(() => {
        gIsFirstRender = true
    })
}