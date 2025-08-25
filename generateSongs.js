const fs = require("fs");
const path = require("path");

const songsDir = path.join(__dirname, "songs");

function generateSongsJson() {
    const albums = [];

    fs.readdirSync(songsDir).forEach(albumName => {
        const albumPath = path.join(songsDir, albumName);
        const stat = fs.statSync(albumPath);

        if (stat.isDirectory()) {
            const files = fs.readdirSync(albumPath);
            const songs = files.filter(f => f.endsWith(".mp3"));
            const cover = files.find(f => f.toLowerCase().includes("cover"));

            albums.push({
                name: albumName,
                cover: cover ? `songs/${albumName}/${cover}` : null,
                songs: songs.map(song => `songs/${albumName}/${song}`)
            });
        }
    });

    const output = { albums };
    fs.writeFileSync("songs.json", JSON.stringify(output, null, 2), "utf-8");
    console.log("✅ songs.json generated successfully!");
}

generateSongsJson();
