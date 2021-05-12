const Discord = require("discord.js");
const https = require("https");

const client = new Discord.Client();

function GetWoof() {
    return new Promise((resolve) => {
        function WoofRequest() {
            https.get("https://random.dog/woof.json", (res) => {
                let data = "";
                res.on("data", (chunk) => {
                    data += chunk
                })
                res.on("end", () => {
                    console.log(JSON.parse(data).url.split(".")[2].substring(0, JSON.parse(data).url.split(".")[2].length) )
                    if (JSON.parse(data).url.split(".")[2].substring(0, JSON.parse(data).url.split(".")[2].length) == "mp4") {
                        WoofRequest();
                    } else {
                        console.log("hi")
                        resolve(data);
                    }
                })
            })
        }

        WoofRequest();
    });
}

client.on("message", (msg) => {
    if (msg.content == "!dog") {
        console.log("hai")
        GetWoof().then((r) => {
         console.log("hi")
         let embed = new Discord.MessageEmbed();
         embed.setTitle(":dog: WOOF! A random dog for you!");
         embed.setImage(JSON.parse(r).url);
         embed.setFooter("Powered by random.dog");

         msg.channel.send(embed);
        })
    }
});

console.log(process.ppid);

client.login(process.env.Token);