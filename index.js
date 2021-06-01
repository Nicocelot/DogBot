const Discord = require("discord.js");
const FormData = require("form-data");
const fs = require("fs");
const https = require("https");
const CanvasM = require('canvas')

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

function flipImage(image, ctx, flipH, flipV) {
    var scaleH = flipH ? -1 : 1, // Set horizontal scale to -1 if flip horizontal
        scaleV = flipV ? -1 : 1, // Set verical scale to -1 if flip vertical
        posX = flipH ? image.width * -1 : 0, // Set x position to -100% if flip horizontal 
        posY = flipV ? image.height * -1 : 0; // Set y position to -100% if flip vertical
    
    ctx.save(); // Save the current state
    ctx.scale(scaleH, scaleV); // Set scale to flip the image
    ctx.drawImage(image, posX, posY, image.width, image.height); // draw the image
    ctx.restore(); // Restore the last saved state
};

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

function GetWoofNoGif() {
    return new Promise((resolve) => {
        function WoofRequest() {
            https.get("https://random.dog/woof.json", (res) => {
                let data = "";
                res.on("data", (chunk) => {
                    data += chunk
                })
                res.on("end", () => {
                    console.log(JSON.parse(data).url.split(".")[2].substring(0, JSON.parse(data).url.split(".")[2].length) )
                    if (JSON.parse(data).url.split(".")[2].substring(0, JSON.parse(data).url.split(".")[2].length).toLowerCase() == "mp4" || JSON.parse(data).url.split(".")[2].substring(0, JSON.parse(data).url.split(".")[2].length).toLowerCase() == "webm" || JSON.parse(data).url.split(".")[2].substring(0, JSON.parse(data).url.split(".")[2].length).toLowerCase() == "gif") {
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
    
                    fs.writeFileSync(`temp/${uuid}.${url.substring(lastindexof(url, ".") + 1, url.length)}`, buffer);

                    var form = new FormData();

                    

                    form.append("upload_file", fs.createReadStream(`temp/${uuid}.${url.substring(lastindexof(url, ".") + 1, url.length)}`));
                    
                    form.submit("https://random.dog/upload", (err, response) => {
                        let chunk = "";
                        response.on("data", (d) => {
                            chunk += d;
                        })


                        response.on("end", () => {
                            fs.unlinkSync(`temp/${uuid}.${url.substring(lastindexof(url, ".") + 1, url.length)}`);
                            resolve(chunk);
                        })
                        
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
    console.log(index);
    console.log(url.substring(index + 1, url.length).toLowerCase())
    if (index != -1) {
        let ft = url.substring(index + 1, url.length).toLowerCase();
        //console.log( ft == "mp4" || ft == "png" || ft == "gif" || ft == "jpg" || ft == "webm" || ft == "jpeg");

        return ft == "mp4" || ft == "png" || ft == "gif" || ft == "jpg" || ft == "webm" || ft == "jpeg";
    } else {
        return false;
    }

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
    })
}



client.on("message", (msg) => {
    if (msg.channel.type === "dm") return;
    if (msg.author.bot === true) return;

    let gc = JSON.parse(fs.readFileSync("GuildsSettings.json", "utf8"));
    let channelf = false;

    console.log(msg.guild.id);

    console.log(gc.hasOwnProperty(msg.guild.id));

    if (gc.hasOwnProperty(msg.guild.id) === false) {
        gc[msg.guild.id] = {deata: "ALL"};
        console.log("hi")
    }

    if (gc[msg.guild.id].deata !== "ALL") {

        for (let i = 0; i < gc[msg.guild.id].deata.length; i++) {
            const element = gc[msg.guild.id].deata[i];
            if (element === msg.channel.name.toLowerCase()) {
                channelf = true
            }
        }

        if (channelf == false && msg.member.hasPermission(["ADMINISTRATOR"]) !== true) {
            return;
        }
    }

    if (msg.content == "!dog help") {
        let embed = new Discord.MessageEmbed();
        embed.title = "DOG bot: find images and gifs of dogs"
        embed.description = "Hi, i am a bot to find images/gif of dogs ([https://random.dog/](https://random.dog/)) :robot: \n\n__**COMMAND LIST**__\n\n`!dog`: gives a gif/image of a random dog\n`!dog help`: This!\n`!dog submit`: Send a video/picture to [random.dog](https://random.dog/). it's add's the video/picture on the website!\n`!dog egg`: list of the secret commands that were found in events.\n\n__**:tools: ADMIN COMMANDS :tools:**__\n\n`!dog channels add [channels]`: Add channel that the commands will work!\n`!dog channels all`: Make the bot works in every channels.\n`!dog channels remove [channels]`: Removes the channels chosen to work in.\n"
        embed.setFooter("Warning! Admin can always uses the dog commands in every channel!")
        embed.setThumbnail("https://i.imgur.com/RzZCdMJ.png");
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

                            console.log(isgood);
                            //fs.writeFileSync("twa", isgood.toString())

                            
                            if (isgood === false) {
                                console.log(`isgood: ${isgood}`);
                                e.send("Only png, jpeg, gif, mp4, and webm doggos allowed");
                                return;
                            }
                            

                            SendWoof(result.attachments.array()[0].url).then((es) => {
                                //e.send("Doggo Sent! :dog:");
                                e.send(es)
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

    if (msg.content == "!dog egg") {
        let embed = new Discord.MessageEmbed();
        embed.setTitle("DOG Bot: Easter eggs ! :egg: ")
        embed.setThumbnail("https://i.imgur.com/RzZCdMJ.png");
        embed.description = "Hi, i am a bot to find images/gif of dogs ([https://random.dog/](https://random.dog/)) :robot:\n\n__**SECRET COMMANDS**__\n\n`!dog -dinnerbone`: Was found by Hatboy128#5830 on 29/5/2021. :tophat: \n\n__**HOW DO YOU FIND THEM?**__\n\nGood question you ask! You can play these event by going to this discord server: ([https://discord.gg/PZKU8gHfzX](https://discord.gg/PZKU8gHfzX))!"
        embed.url = "https://random.dog/";
        embed.color = "#808080";

        msg.channel.send(embed);
    }

    //if (msg.content == "!dog egg") {
    //
    //}

    if (msg.content == "!dog -dinnerbone") {
        if (!fs.existsSync("winner.json")) {
            fs.writeFileSync("winner.json", JSON.stringify([msg.author.tag, msg.author.id]));
            msg.reply("gg you won the event! The command has been transformed into something special :dog:.")
        } else {
            function ReverseWOOF() {
                GetWoofNoGif().then((v) => {
                    console.log(JSON.parse(v).url);
                    CanvasM.loadImage(JSON.parse(v).url).then((r) => {
                        let canvas = CanvasM.createCanvas(r.width, r.height);
                        let context = canvas.getContext("2d")
                        let uuid = create_UUID();

                        flipImage(r, context, false, true);


                        fs.writeFileSync(`temp/${uuid}`, canvas.toBuffer());

                        if (fs.statSync(`temp/${uuid}`).size >= 8388608) {
                            ReverseWOOF()
                            fs.unlinkSync(`temp/${uuid}`);
                        } else {
                            let embed = new Discord.MessageEmbed();
                            embed.attachFiles(new Discord.MessageAttachment(canvas.toBuffer(), 'doggo.png'));
                            embed.setTitle("!uoy rof god modnar A !FOOW :dog:");
                            embed.setImage("attachment://doggo.png");
                            embed.setFooter("Powered by random.dog");
                            embed.color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
                
                            msg.channel.send(embed);
                            fs.unlinkSync(`temp/${uuid}`);
                        }
                    })
                });
            }

            ReverseWOOF()
        }

        

        


    }


    if (msg.member.hasPermission(["ADMINISTRATOR"])) {


        if (msg.content.startsWith("!dog channels add" , 0)) {
            console.log(msg.content.split(" "));
            let g = JSON.parse(fs.readFileSync("GuildsSettings.json", "utf8"))
            if (g[msg.guild.id] === undefined || g[msg.guild.id].deata === "ALL") {
                g[msg.guild.id] = {deata: []};
            }
            for (let i = 3; i < msg.content.split(" ").length; i++){
                //console.log(msg.content.split(" ")[i]);
                if (msg.guild.channels.cache.find(c => c.name.toLowerCase() === msg.content.split(" ")[i].toLowerCase()) !== undefined) {
                    if (g[msg.guild.id].deata.find(c => c === msg.content.split(" ")[i].toLowerCase()) === undefined) {
                        g[msg.guild.id].deata.push(msg.content.split(" ")[i].toLowerCase());
                    }
                } else {
                    console.log(msg.content.split(" ")[i].toLowerCase());
                    
                }
            }

            fs.writeFileSync("GuildsSettings.json", JSON.stringify(g));
        }



        if (msg.content == "!dog channels all") {
            let g = JSON.parse(fs.readFileSync("GuildsSettings.json", "utf8"));
            if (g[msg.guild.id] === undefined || g[msg.guild.id].deata !== "ALL") {
                g[msg.guild.id] = {deata: "ALL"};
            }

            fs.writeFileSync("GuildsSettings.json", JSON.stringify(g));
        }

        if (msg.content.startsWith("!dog channels remove", 0)) {
            let g = JSON.parse(fs.readFileSync("GuildsSettings.json", "utf8"));
            if (g[msg.guild.id] === undefined) {
                g[msg.guild.id] = {deata: "ALL"};
                return;
            }

            for (let i = 3; i < msg.content.split(" ").length; i++) {
                for (let ie = 0; ie < g[msg.guild.id].deata.length; ie++) {
                    const element = g[msg.guild.id].deata[ie];

                    if (element == msg.content.split(" ")[i]) {
                        g[msg.guild.id].deata.splice(ie, 1);
                    }
                    
                }
                
            }

            fs.writeFileSync("GuildsSettings.json", JSON.stringify(g));
        }

        if (msg.content.startsWith("!doggosay ", 0)) {
            console.log(msg.content.substr(10, msg.content.length));

            if (msg.deletable === true) {
                msg.delete()
            }

            msg.channel.send(msg.content.substr(10, msg.content.length));
        }


        /*

        if (msg.content.startsWith("!dog channels add ", 0)) {
            let msgsplit = msg.content.split(" ");
            let Guildsettings = JSON.parse(fs.readFileSync("GuildsSettings.json"));
            console.log("hi")

            for (let ie = 3; ie < msgsplit.length; ie++) {
                if (msg.guild.channels.cache.find(c => c.name.toLowerCase() === msgsplit[ie]) === undefined) {
                    let gf = false;
                    let gs = [];
                    for (let i = 0; i < Guildsettings.length; i++) {
                        if (Guildsettings[i].guild == msg.guild.id) {
                            if (Guildsettings[i].Deta != undefined && Guildsettings[i].Deta != "ALL") {
                                Guildsettings[i].Deta.push(msgsplit[ie]);
                            } else {
                                Guildsettings[i].Deta = [msgsplit[ie]];
                            }
                        }
                    }

                    if (!gf) {
                        Guildsettings.push({guild: msg.guild.id});
                    }

                    console.log("a")
                }
            }


            

            fs.writeFileSync("GuildsSettings.json" ,JSON.stringify(Guildsettings));
        }
        */
    }
    
    
});

console.log(process.ppid);

client.login(fs.readFileSync("Token.txt", "utf8"));
