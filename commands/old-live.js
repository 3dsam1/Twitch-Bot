// Discord Constants
const { SlashCommandBuilder, EmbedBuilder, Embed } = require('discord.js');

// Database Constants
const profileModel = require('../schemas/add_user_schema')
const embedModel = require('../schemas/sent_embed_schema')

const dotenv = require('dotenv')
dotenv.config();



module.exports = { // Builds the slash command. 

    data: new SlashCommandBuilder()
        .setName('old-live')
        .setDescription('Will check if a user that was live is no longer live'),


    async execute(client) {

        try {


            const ClientID = process.env.T_CLIENT_ID
            const accessToken = process.env.T_ACCESS_TOKEN


            const liveUsers = await profileModel.find({ live_status: true });


            for (const num in liveUsers) { // Loops through for all the live users that are currently listed. 

                let user = liveUsers[num];
                let userName = user.name
                await fetch(`https://api.twitch.tv/helix/streams/?user_login=${userName}`, { // Fetches each users stream information from twitch API.
                    method: 'GET',
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Client-Id": ClientID
                    }

                })

                    .then(response => response.json())
                    .then(async response => {


                        if (response.error != undefined) {   // Checks to see if the fetch failed. 


                            const error = new Error
                            error.message = response.message;
                            error.name = response.error;
                            error.code = 'Status ' + response.status;
                            error.full = response;
                            error.path = 'on user: ' + user

                            logError(error, client)
                        }


                        else if (response.data[0] === undefined) { // Twitch API will return a empty data field if the user isn't online. This checks for it.


                            await user.updateOne({ live_status: false }); // Updates the file to show they are no longer live. Then saves it.

                            await user.save()


                            let sentMessages = await embedModel.findOne({ name: userName })

                            let channelList = sentMessages.channels;
                            let embedList = sentMessages.embeds


                            for (const num in channelList) { // Loops through each channel listed. 

                                const channel = channelList[num];
                                const message = embedList[num]

                                const messageChannel = await client.channels.fetch(`${channel}`)

                                messageChannel.messages.fetch(`${message}`)

                                    .then(message => {

                                        let oldEmbed = message.embeds[0]; // The message's first embed. 

                                        let field1_name = `${oldEmbed.fields[0].name}` // The first field of the embed, and the name value. 

                                        field1_name = field1_name.split(" ") // Split's the name by spaces. Used to actually get the streamers name


                                        const newEmbed = new EmbedBuilder() // Builds the new embed. 

                                            .setTitle(`${oldEmbed.title}`)
                                            .setThumbnail(`${oldEmbed.thumbnail.url}`)
                                            .addFields(
                                                { name: `${field1_name[0]} was previously live`, value: `${oldEmbed.fields[0].value}`, inline: false },
                                                { name: `This stream has ended`, value: 'Thank you for joining!', inline: true },
                                                { name: 'Stream Link: ', value: `${oldEmbed.fields[2].value}`, inline: true }
                                            )
                                            .setImage(oldEmbed.image.url)
                                            .setColor(oldEmbed.color)
                                            .setTimestamp()
                                            .setFooter({ text: `Stream Team`, iconURL: 'https://i.imgur.com/N4IRIbH.gif' });

                                        message.edit({ embeds: [newEmbed] }) // Edit's the previous message with the new embed. 


                                    })

                            }

                            await embedModel.deleteOne({ name: userName }) // Deletes the embed file. 

                        }


                    });

            }



        }

        catch (err) { // In the event of an error -> Log in console, and to the log channel that the error has occured



            logError(err, client)
        }


    },

}


async function logError(error, client) { // Error Logging function
    let err = new Error



    switch (error.name) {
        case 'TypeError':
            err.name = `Type Error`
            err.message = error.message
            err.code = `1000-E`
            err.full = error.stack
            break;

        case 'Manual Error':

            err.name = error.name
            err.message = error.message
            err.code = error.code
            err.full = error

            break;

        default:
            err = error
            break;
    }

    console.log(`[Warning]: Error ${err.code} occured`)

    let logChannel = await client.channels.fetch(`${process.env.D_LOG_CHANNEL}`)

    const errEmbed = new EmbedBuilder()
        .setTitle(`**[New Error]**: \`\`\`${err.name}\`\`\``)
        .setColor('Red')
        .addFields(
            { name: `Error Code`, value: `${err.code}` },
            { name: `Error Method`, value: `${err.method}`, inline: true },
            { name: `Error Path`, value: `${err.path}`, inline: true },
            { name: `Error Message`, value: `${err.message}` },
            { name: `Attempted Command`, value: `old-live`, inline: true },
            { name: `\u200b`, value: '\u200b' },
            { name: 'Full Error', value: `\`\`\`${err.full}\`\`\`` }
        )
        .setTimestamp()

    logChannel.send({ embeds: [errEmbed] })
}
