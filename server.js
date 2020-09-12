const http = require('http');
const express = require('express');
const app = express();

app.use(express.static('public'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/", (request, response) => {
  response.sendStatus(200);
});

app.listen(process.env.PORT);

setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`); 
}, 280000);

const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, Util } = require("discord.js");
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");
const dotenv = require("dotenv").config();
require("./server.js");

const TOKEN = process.env.BOT_TOKEN;
const PREFIX = process.env.PREFIX;
const GOOGLE_API_KEY = process.env.YTAPI_KEY;

const youtube = new YouTube(GOOGLE_API_KEY);
const queue = new Map();

client.on('ready', () => {
  console.log('ESTOY LISTO PARA TRABAJAR!');
  client.user.setPresence({
       status: "dnd",
       activity: {
           name: "m?comandos",
           type: "WATCHING"
       }
   });

});

client.on("message", async (msg) => {
  
      if (msg.author.bot) return;
    if (!msg.content.startsWith(PREFIX)) return;
    if(msg.author.bot) return;
  
   const args1 = msg.content.slice(PREFIX.length).trim().split(/ +/g); 
    const url = args1[1] ? args1[1].replace(/<(.+)>/g, "$1") : "";
    const searchString = args1.slice(1).join(" ");
    const serverQueue = queue.get(msg.guild.id);

    let command = msg.content.toLowerCase().split(" ")[0];
    command = command.slice(PREFIX.length);

    if (command === "comandos" || command === "cmd") {
          const embed = new Discord.MessageEmbed()
             .setColor("#7289DA")
            .setTitle("**COMANDOS**")
            .setAuthor(msg.author.username, msg.author.displayAvatarURL())
            .setThumbnail(msg.author.displayAvatarURL())
            .setDescription(`**COMANDO PRINCIPAL DEL BOT ES: m?cmd o m?comandos , \nCOMANDO: m?play SIRVE PARA ESCUCHAR MUSICA , \nm?skip SIRVE PARA PASAR LA MUSICA , \nm?continuar SIRVE PARA SEGUIR SONANDO LA MUSICA , \nm?pausar SIRVE PARA PAUSAR LA MUSICA , \nm?creditos PARA SABER LOS CREDORES DE ESTE BOT, \nm?invitar para invitarme**, \nm?salir EL BOT SALE DEL CANAL DE VOZ!`)
            .setFooter("© Bot Creator By「💥」𝓡𝓔𝓧 𝒀𝑻#2276 and by XX_soyhugoyt_XXoficial#0001", client.user.avatarURL())  
          msg.channel.send(embed);
  }
  
     if (command === "invitar" || command === "invi") {
          const embed = new Discord.MessageEmbed()
             .setColor("#7289DA")
            .setTitle("**Invitame**")
            .setAuthor(msg.author.username, msg.author.displayAvatarURL())
            .setThumbnail(msg.author.displayAvatarURL())
            .setDescription(`**Invitame link: https://bit.ly/mememusicinv**`)
          msg.channel.send(embed);
  }
  
    if (command === "play" || command === "p") {
      
        const voiceChannel = msg.member.voice.channel;
        if (!voiceChannel) return msg.channel.send("NO ESTAS EN NINGUN CANAL DE VOZ!");
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has("CONNECT")) {
            return msg.channel.send("PERDON PERO NO TENGO PERMISOS Y NECESITO ESTE PERMISO , **`CONNECT`** PARA CONECTARME!");
        }
      
        if (!permissions.has("SPEAK")) {
            return msg.channel.send("PERDON PERO NO TENGO PERMISOS Y NECESITO ESTE PERMISO , **`SPEAK`** PARA CONECTARME!");
        }
      
        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id);
                 await handleVideo(video2, msg, voiceChannel, true); 
            }
            return msg.channel.send(`<:yes:591629527571234819>  **|**  Playlist: **\`${playlist.title}\`** SE HA AÑADIDO A LA COLA!`);
        } else {
            try {
                var video = await youtube.getVideo(url);
            } catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 10);
                    var video = await youtube.getVideoByID(videos[0].id);
                    if (!video) return msg.channel.send("NO SE HA OBTENIDO RESULTADOS");
                } catch (err) {
                    console.error(err);
                    return msg.channel.send("NO SE HA OBTENIDO RESULTADOS");
                }
            }
            return handleVideo(video, msg, voiceChannel);
        }
    }
  
   if (command === "skip" || command == "s") {
        if (!msg.member.voice.channel) return msg.channel.send("NO ESTA SONANDO NINGUNA CANCION!");
        if (!serverQueue) return msg.channel.send("**NO HAY NINGUNA CANCION PARA SALTAR!**");
        serverQueue.connection.dispatcher.end("¡Se ha usado el comando skip para saltar la cancion!");
        return msg.channel.send("**SE HA PASADO LA MUSICA!**");
     
      } else if (command === "pausar") {
        if (serverQueue && serverQueue.playing) {
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            return msg.channel.send("**SE HA PAUSADO LA MUSICA!**");
        }
        return msg.channel.send("NO HAY NINGUNA CANCION.");

    } else if (command === "continuar" || command === "c") {
        if (serverQueue && !serverQueue.playing) {
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            return msg.channel.send("**LA MUSICA AHORA MISMO ESTA SONANDO! <a:escribiendo:726162868420214874>**");
        }
    }
     
     if(command === 'parar' ||command === 'p') {
   if (!msg.member.voice.channel) return msg.channel.send('**PRIMERO DE TODO TE TIENES QUE UNIRTE A UN CANAL DE VOZ!**');
   if (!serverQueue) return msg.channel.send('**NO HAY NINGUNA CANCION , ESTA LA LISTA DE CANCIONES VACIA!**');
   serverQueue.songs = [];
   await serverQueue.connection.dispatcher.end();
   msg.channel.send('**LA LISTA DE CANCIONES FUE ELIMANADA Y SE HA SALIDO EL BOT!**')

  }
      if (command === "creditos" || command === "cd") {
          const embed = new Discord.MessageEmbed()
             .setColor("#7289DA")
            .setTitle("**CREDITOS**")
            .setDescription("**BOT HECHO POR「💥」𝓡𝓔𝓧 𝒀𝑻#2276 Y CON EL BOT 🚨 RexBot ⇝#1694 Y TAMBIEN CON XX_soyhugoyt_XXoficial#0001**")
          msg.channel.send(embed);
  }
     if(command === 'salir') {
   if (!msg.member.voice.channel) return msg.channel.send('**PRIMERO DE TODO TE TIENES QUE UNIRTE A UN CANAL DE VOZ!**');
   if (!serverQueue) return msg.channel.send('**NO HAY NINGUNA CANCION , ESTA LA LISTA DE CANCIONES VACIA!**');
   serverQueue.songs = [];
   await serverQueue.connection.dispatcher.end();
   msg.channel.send('**LA LISTA DE CANCIONES FUE ELIMANADA Y SE HA SALIDO EL BOT!**')

  }
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
    const serverQueue = queue.get(msg.guild.id);
    const song = {
        id: video.id,
        title: Util.escapeMarkdown(video.title),
        url: `https://www.youtube.com/watch?v=${video.id}`
    };
    if (!serverQueue) {
        const queueConstruct = {
            textChannel: msg.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 100,
            playing: true,
            loop: false
        };
        queue.set(msg.guild.id, queueConstruct);

        queueConstruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueConstruct.connection = connection;
            play(msg.guild, queueConstruct.songs[0]);
        } catch (error) {
            console.error(`No pude unirme al canal de voz: ${error}`);
            queue.delete(msg.guild.id);
            return msg.channel.send(`No pude unirme al canal de voz: **\`${error}\`**`);
        }
    } else {
        serverQueue.songs.push(song);
        if (playlist) return;
        else return msg.channel.send(`<a:left2:701420487439417344> | **|** **\`${song.title}\`** SE HA AÑADIDO A LA COLA POR: ${msg.author.tag}!`);
    }
    return;
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    if (!song) {
        serverQueue.voiceChannel.leave();
        return queue.delete(guild.id);
    }

    const dispatcher = serverQueue.connection.play(ytdl(song.url))
        .on("finish", () => {
            const shiffed = serverQueue.songs.shift();
            if (serverQueue.loop === true) {
                serverQueue.songs.push(shiffed);
            };
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolume(serverQueue.volume / 100);

    serverQueue.textChannel.send({
        embed: {
            color: "RANDOM",
            description: `**Reproduciendo ahora:** **\`${song.title}\`**`
        }
    });
      
 }

client.login(TOKEN);

