const $ = require('jquery')
const mm = require('music-metadata')
const {ipcRenderer} = require('electron')
let songData = {path:[], title:[]}
let audioPlayer = $('audio').get(0)
let playing = false
let currentIndex = 0
let timer = null

function chooseMusic(){
    $('input').click()
}

function musicSelected(){
    let files = $('input').get(0).files
    //console.log(files)

    for(let i = 0; i<files.length; i++){
        let {path} = files[i]
        mm.parseFile(path, {native:true}).then(metadata =>{
            songData.path[i] = path
            songData.title[i] = metadata.common.title

            let songRow = `
            <tr ondblclick="playSong(${i})">
                <td>${metadata.common.title}</td>
                <td>${metadata.common.artist}</td>
                <td>${secondsToTime(metadata.format.duration)}</td>
            </tr>
            `

            $('#table-body').append(songRow)
            
        })
    }
}

function playSong(index){
    audioPlayer.src = songData.path[index]
    currentIndex = index
    audioPlayer.load()
    audioPlayer.play()
    playing = true
    $('h4').text(songData.title[index])
    updatePlayButton()
    timer = setInterval(updateTime, 1000)
    ipcRenderer.send('playing', songData.title[index])
}


function play(){
    if(playing){
        audioPlayer.pause()
        clearInterval(timer)
        playing = false
    }else{
        audioPlayer.play()
        playing = true
        timer = setInterval(updateTime, 1000)
    }
    updatePlayButton()
}

function playNext(){
    currentIndex++
    if(currentIndex>=songData.path.length)currentIndex=0
    playSong(currentIndex)
}

function playPrevious(){
    currentIndex--
    if(currentIndex<0)currentIndex = songData.path.length - 1
    playSong(currentIndex)
}

function clearPlaylist(){
    clearInterval(timer)
    $('#time-left').text('00:00')
    $('#total-time').text('00:00')
    $('#table-body').html('')
    audioPlayer.pause()
    audioPlayer.src = ''
    currentIndex = 0
    playing = false
    $('h4').text('')
    updatePlayButton()
    songData = {path:[], title:[]}
}

function updateTime(){
    $('#time-left').text(secondsToTime(audioPlayer.currentTime))
    $('#total-time').text(secondsToTime(audioPlayer.duration))
    if(audioPlayer.currentTime>=audioPlayer.duration){
        playNext()
    }
    console.log('tick')
}

function updatePlayButton(){
    let playIcon = $('#play-button span')
    if(playing){
        playIcon.removeClass('icon-play')
        playIcon.addClass('icon-pause')
    }else{
        playIcon.removeClass('icon-pause')
        playIcon.addClass('icon-play')
    }
}

function secondsToTime(t) {
    return padZero(parseInt((t / (60)) % 60)) + ":" + 
           padZero(parseInt((t) % 60));
  }
function padZero(v) {
return (v < 10) ? "0" + v : v;
}