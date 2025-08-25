let currentSong = new Audio();
let songs = [];
let currentIndex = 0;

// Format time like 00:00
function formatTimeSingle(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2,'0')}:${String(remainingSeconds).padStart(2,'0')}`;
}

// Load albums from songs.json
async function loadAlbums() {
    try {
        const response = await fetch("songs.json");
        const data = await response.json();

        const cardContainer = document.querySelector(".cardContainer");
        const songUl = document.querySelector(".song-list ul");
        cardContainer.innerHTML = "";
        songUl.innerHTML = "";

        for (const album of data.albums) {
            // Fetch info.json for album
            let info = { title: album.name, descriptions: "" }; // default
            try {
                const infoResp = await fetch(`${album.songs[0].split("/").slice(0, -1).join("/")}/info.json`);
                info = await infoResp.json();
            } catch (err) {
                console.warn(`info.json not found for ${album.name}, using default`);
            }

            // Create album card
            const card = document.createElement("div");
            card.classList.add("card", "rounded", "cursor");
            card.dataset.folder = album.name;

            card.innerHTML = `
                <img class="img" src="images/play-button-arrowhead.png" alt="">
                <img class="rounded" src="${album.cover}" alt="">
                <h4>${info.title}</h4>
                <p>${info.descriptions}</p>
            `;
            cardContainer.appendChild(card);

            // On card click → list songs
            card.addEventListener("click", () => displayAlbumSongs(album));
        }

        // **Default load first album**
        if (data.albums.length > 0) {
            displayAlbumSongs(data.albums[0]);
        }

    } catch (error) {
        console.error("Error loading albums:", error);
    }
}

// Display songs of an album
function displayAlbumSongs(album) {
    const songUl = document.querySelector(".song-list ul");
    songs = album.songs.map(s => s); // copy songs
    currentIndex = 0;
    songUl.innerHTML = "";
    songs.forEach(songPath => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="flex">
                <img class="invert" src="images/music.svg" alt="">
                <div class="info">
                    <div>${decodeURI(songPath.split("/").pop())}</div>
                </div>
            </div>
            <img class="invert" src="images/play.svg" alt="">
        `;
        li.addEventListener("click", () => {
            currentIndex = songs.indexOf(songPath);
            playMusic(songPath);
        });
        songUl.appendChild(li);
    });
}

// Play a song
function playMusic(songPath, paused = false) {
    currentSong.src = songPath;
    if (!paused) {
        currentSong.play();
        document.getElementById("play").src = "images/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(songPath.split("/").pop());
    document.querySelector(".song-time").innerHTML = "00:00/00:00";
}

// Play / Pause
document.getElementById("play").addEventListener("click", () => {
    if (currentSong.paused) {
        currentSong.play();
        play.src = "images/pause.svg";
    } else {
        currentSong.pause();
        play.src = "images/play.svg";
    }
});

// Next / Previous
document.getElementById("next").addEventListener("click", () => {
    if (currentIndex + 1 < songs.length) {
        currentIndex++;
        playMusic(songs[currentIndex]);
    }
});
document.getElementById("previous").addEventListener("click", () => {
    if (currentIndex - 1 >= 0) {
        currentIndex--;
        playMusic(songs[currentIndex]);
    }
});

// Seek bar
currentSong.addEventListener("timeupdate", () => {
    const circle = document.querySelector(".circle");
    const songTime = document.querySelector(".song-time");
    if (currentSong.duration) {
        circle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        songTime.innerHTML = `${formatTimeSingle(currentSong.currentTime)}/${formatTimeSingle(currentSong.duration)}`;
    }
});
document.querySelector(".seek-bar").addEventListener("click", e => {
    const percent = e.offsetX / e.target.getBoundingClientRect().width;
    currentSong.currentTime = currentSong.duration * percent;
    document.querySelector(".circle").style.left = percent * 100 + "%";
});

// Volume
document.querySelector(".range input").addEventListener("input", e => {
    currentSong.volume = e.target.value / 100;
});

// Mute toggle
document.querySelector(".volume>img").addEventListener("click", e => {
    const img = e.target;
    const range = document.querySelector(".range input");
    if (img.src.includes("volume.svg")) {
        img.src = img.src.replace("volume.svg", "mute.svg");
        currentSong.volume = 0;
        range.value = 0;
    } else {
        img.src = img.src.replace("mute.svg", "volume.svg");
        currentSong.volume = 0.1;
        range.value = 10;
    }
});

// Sidebar
document.querySelector(".humburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
});
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
});

// When song ends → play next
currentSong.addEventListener("ended", () => {
    if (currentIndex + 1 < songs.length) {
        currentIndex++;
        playMusic(songs[currentIndex]);
    } else {
        currentIndex = 0;
        playMusic(songs[currentIndex]);
    }
});

// Initialize
async function main() {
    await loadAlbums();
    if (songs.length) playMusic(songs[0], true);
}
main();
