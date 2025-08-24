
let currentSong = new Audio();

let songs;
let currfolder;


function formatTimeSingle(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getsongs(folder) {
    currfolder = folder

    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let respone = await a.text();
    let div = document.createElement("div");
    div.innerHTML = respone
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {

            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // listing songs in libeary  section
    let songUl = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {

        songUl.innerHTML = songUl.innerHTML + `<li>
                                <div class="flex">
                                <img class="invert" src="images/music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                </div>
                            </div>
                            <img class="invert" src="images/play.svg" alt=""></li>` ;

    }

    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
     return songs

}


playMusic = (track, paused = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currfolder}/` + track
    if (!paused) {

        currentSong.play()
        play.src = "images/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".song-time").innerHTML = "00:00/00:00"
}




async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let respone = await a.text();
    let div = document.createElement("div");
    div.innerHTML = respone;
    let anchars = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchars)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").splice(-2)[0]

            // getting the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let respone = await a.json();
            console.log(respone)
            cardContainer.innerHTML = cardContainer.innerHTML + `  <div data-folder="${folder}" class="card rounded cursor">
            <img class="img" src="images/play-button-arrowhead.png" alt="">
                        <img class="rounded" src="/songs/${folder}/cover.jpg"
                            alt="">
                        <h4> ${respone.title}</h4>
                        <p>${respone.descriptions}</p>
                        
                        </div>
`
        }
    }
    // loading playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            // playMusic(songs[0]) 
        })
    })

}


async function main() {


    // getting the list of all the songs 
    await getsongs("songs/ncs")
    playMusic(songs[0], true)

    // all the albums displayed
    displayAlbums()



    play.addEventListener("click", element => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "images/pause.svg";
        }
        else {
            currentSong.pause()
            play.src = "images/play.svg";

        }

    })


    // timing update and for seekbar
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".song-time").innerHTML = `
        ${formatTimeSingle(currentSong.currentTime)}/${formatTimeSingle(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    // adding an eventlistner to seekbar ( controlling song through seekbar)
    document.querySelector(".seek-bar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
    // adding eventlistner for opening side bar
    document.querySelector(".humburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // adding eventlistner for closing side bar

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })

    // adding eventlistner for previous bar

    previous.addEventListener("click", () => {
        console.log("previous was click")
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
        else {
            playMusic(songs[index])
        }
    })

    // adding eventlistner for next bar

    next.addEventListener("click", () => {
        console.log("next was click")
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }

    })

    // adding eventlistner for volume bar

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to ", (e.target.value), "/100")
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    // adding eventlistner to mute the track

    document.querySelector(".volume>img").addEventListener("click", e=> {
          const img = e.target;
        if ( img.src.includes("volume.svg")) {
           img.src = img.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
             document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else {
            img.src = img.src.replace("mute.svg", "volume.svg")
            currentSong.volume =.10;
            
             document.querySelector(".range").getElementsByTagName("input")[0].value=10
        }
    })



    // jab current song khatam ho to next wala play ho
currentSong.addEventListener("ended", () => {
    let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0]);
    if ((index + 1) < songs.length) {
        playMusic(songs[index + 1]);
    } else {
        playMusic(songs[0]); 
    }
});

}

main()