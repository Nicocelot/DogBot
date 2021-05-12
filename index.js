const Discord = require("discord.js");
const FormData = require("form-data");
const fs = require("fs");
const https = require("https");

const client = new Discord.Client();

function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

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
                    if (JSON.parse(data).url.split(".")[2].substring(0, JSON.parse(data).url.split(".")[2].length).toLowerCase() == "mp4" || JSON.parse(data).url.split(".")[2].substring(0, JSON.parse(data).url.split(".")[2].length).toLowerCase() == "webm") {
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

function SendWoof(url) {
    return new Promise((resolve) => {
        function SendWoofRequest() {
            /*
            https.request({method: "POST", hostname: "https://random.dog", path: "/upload"})
            */
            https.get(url, (res) => {
                var data = [];
    
                res.on("data", (chunk) => {
                    data.push(chunk);
                })
    
                res.on("end", () => {
                    var buffer = Buffer.concat(data);
                    var uuid = create_UUID();
    
                    fs.writeFileSync(`temp/${uuid}`, buffer);

                    var form = new FormData();

                    form.append("upload_file", fs.createReadStream(`temp/${uuid}`));
                    form.submit("https://random.dog/upload", (err, response) => {
                        if (!err) {
                            fs.unlinkSync(`temp/${uuid}`)
                            resolve(0)
                        } else {
                            fs.unlinkSync(`temp/${uuid}`)
                            resolve(1);
                        }
                    })
                })
            })
        }

        SendWoofRequest()
    })
}
//https://www.npmjs.com/package/form-data

function lastindexof(str = "", char = "") {
    let ls = -1;
    for (let i = 0; i < str.length; i++) {
        if (str[i] == char) {
            ls = i;
        }
    }
    return ls;
}

function cft(url = "") {
    let index = lastindexof(url, ".");
    if (index != -1) {
        let ft = url.substring(index + 1, url.length).toLowerCase();
        return ft == "mp4" || ft == "png" || ft == "gif" || ft == "jpg" || ft == "webm" || ft == "jpeg";
    }
    return false;
}

function FileSizeLimit(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            var data = [];

            res.on("data", (chunk) => {
                data.push(chunk);
            })

            res.on("end", () => {
                var buffer = Buffer.concat(data);
                var uuid = create_UUID();

                fs.writeFileSync(`temp/${uuid}`, buffer);

                if (fs.statSync(`temp/${uuid}`).size > 50 * 1024 * 1024) {
                    fs.unlinkSync(`temp/${uuid}`);
                    resolve(1);
                } else {
                    fs.unlinkSync(`temp/${uuid}`);
                    resolve(0);
                }
            })
        })
        //const tempfile = fs.writeFileSync(`temp/${create_UUID()}`, );
    })
}



client.on("message", (msg) => {
    if (msg.content == "!dog help") {
        let embed = new Discord.MessageEmbed();
        embed.title = "DOG bot: find images and gifs of dogs"
        embed.description = "Hi, i am a bot to find images/gif of dogs ([https://random.dog/](https://random.dog/)) :robot: \n\n__**COMMAND LIST**__\n\n`!dog`: gives a gif/image of a random dog\n`!dog help`: This!\n`!dog submit`: Send a video/picture to [random.dog](https://random.dog/). it's add's the video/picture on the website!"
        embed.setThumbnail("https://i.imgur.com/RzZCdMJ.png")
        embed.color = "#808080";
        embed.url = "https://random.dog/";

        msg.channel.send(embed);
    }

    if (msg.content == "!dog submit") {
        client.users.fetch(msg.author.id).then((user) => {
            user.createDM().then((e) => {
                let embed = new Discord.MessageEmbed();
                embed.title = "DOG bot: find images and gifs of dogs"
                embed.description = "Hey, hooman do you wanna immortalize your doggo? \n\nIt's your lucky day! You can share your pictures/mp4/webm file's of your doggo! :dog: WOOF!";
                embed.setFooter("Warning! All doggos subject to hooman inspection");
                embed.url = "https://random.dog/";
                embed.color = "#808080";

                e.send(embed);

                //const filter = m => m.content.includes('discord');
                const collector = e.createMessageCollector(m => m.author.tag === msg.author.tag, {time: 60000});

                collector.on('collect', m => {

                });
                
                collector.on('end', collected => {
                    console.log(`Collected ${collected.size} items`);
                    let result = collected.array()[0]

                    console.log(result.author.tag);

                    if (result.attachments.size > 0) {
                        console.log(result.attachments.array()[0].url)

                        FileSizeLimit(result.attachments.array()[0].url).then((limit) => {
                            if (limit == 1) {
                                e.send("Doggo too big, only doggos under 50MB allowed");
                                return;
                            }

                            let isgood = cft(result.attachments.array()[0].url);

                            if (!isgood) {
                                e.send("Only png, jpeg, gif, mp4, and webm doggos allowed");
                                return
                            }

                            SendWoof(result.attachments.array()[0].url).then((es) => {
                                e.send("Doggo Sent! :dog:");
                            });


                        });
                    }
                });
            })
        });
    }

    if (msg.content == "!dog") {
        console.log("hai")
        GetWoof().then((r) => {
            console.log("hi")
            let embed = new Discord.MessageEmbed();
            embed.setTitle(":dog: WOOF! A random dog for you!");
            embed.setImage(JSON.parse(r).url);
            embed.setFooter("Powered by random.dog");
            embed.color = `#${Math.floor(Math.random()*16777215).toString(16)}`
            msg.channel.send(embed);
        })
    }
});

console.log(process.ppid);

//client.login(process.env.Token);
client.login("ODQxODI4NDU3NTk1OTI4NjU3.YJsb2A.1bxLGiWA7PcAo2zsS0oD_6bceCY");