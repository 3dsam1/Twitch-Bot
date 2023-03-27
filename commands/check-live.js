//Discord Constants
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');


// Database constants.
const profileModel = require('../schemas/add_user_schema')
const channelModel = require('../schemas/add_channel_schema')
const embedModel = require('../schemas/sent_embed_schema')

const dotenv = require('dotenv')

dotenv.config();


module.exports = { // Builds the slash command. 

    data: new SlashCommandBuilder()
        .setName('check-live')
        .setDescription('Will check if a user is live. Runs automatically but can be manually ran if needed.'),

    async execute(client) {

        try {

            const ClientID = process.env.T_CLIENT_ID
            const accessToken = process.env.T_ACCESS_TOKEN

            const userList = await profileModel.find();


            for (const num in userList) { // This loops through for each user in the stream team list. 


                let user = userList[num]
                let userName = user.name


                await fetch(`https://api.twitch.tv/helix/streams/?user_login=${userName}`, { // Fetches each users stream information from twitch API.
                    method: 'GET',
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Client-Id": ClientID
                    }

                })

                    .then(response => response.json()) // Parses to json.
                    .then(async response => {


                        if (response.error != undefined) { // Checks if the fetch failed. 



                            const error = new Error
                            error.message = response.message;
                            error.name = response.error;
                            error.code = 'Status ' + response.status;
                            error.full = response;
                            error.path = 'on user: ' + user



                            logError(error, client)
                        }


                        else if (response.data[0] !== undefined) {  // Twitch API will return a empty data field if the user isn't online. This checks for it.



                            if (user.live_status == true) { // If the user is already listed live, ignore them.

                                return;

                            }

                            await user.updateOne({ live_status: true }); // Update the user to list them as live.

                            await user.save() // Saves the updated user.


                            const gameImage = response.data[0].thumbnail_url.split("{")[0] + "375x250.jpg" // Formatting from twitch's stream image.


                            let profilePicture;

                            await fetch(`https://api.twitch.tv/helix/users?login=${userName}`, { // Fetch the user's information from twitch api.
                                method: 'GET',
                                headers: {
                                    "Authorization": `Bearer ${accessToken}`,
                                    "Client-Id": ClientID
                                }

                            })
                                .then(userResponse => userResponse.json()) // Parses the response into json.
                                .then(userResponse => {

                                    profilePicture = userResponse.data[0].profile_image_url;
                                })



                            const embed = new EmbedBuilder() // Builds the embed to send. 

                                .setTitle(`${response.data[0].title}`)
                                .setThumbnail(`${profilePicture}`)
                                .setColor(`#3D408F`)
                                .addFields(
                                    { name: `**${response.data[0].user_name}** is live!`, value: `Playing ${response.data[0].game_name}` },
                                    { name: `Viewers: `, value: `${response.data[0].viewer_count}`, inline: true },
                                    { name: `Stream Link: `, value: `[__Click Me!__](https://twitch.tv/${response.data[0].user_name} 'hovertext')`, inline: true }

                                )
                                .setImage(gameImage)
                                .setTimestamp()
                                .setFooter({ text: `Stream Team`, iconURL: 'https://i.imgur.com/N4IRIbH.gif' });



                            let id;
                            var messageChannel;


                            let channelList = await channelModel.find();

                            // Reset's the file to a blank state.

                            let doc = await embedModel.deleteOne({ name: userName });

                            doc = await embedModel.create({
                                name: userName,
                                channels: [],
                                embeds: []
                            })

                            for (const channel in channelList) { // loops for every channel in the list.


                                let channelId = channelList[channel].channel_id;


                                await doc.channels.push(channelId);

                                doc.save().catch(console.error);

                                messageChannel = await client.channels.fetch(`${channelId}`)


                                const sent = messageChannel.send({ embeds: [embed] }) // Send's the embed.
                                    .then(async sentMessage => { // Stores the embed's message ID for deleting it in the future. 


                                        id = sentMessage.id


                                        await doc.embeds.push(id);


                                        doc.save().catch(console.error);

                                    });

                            }

                        }

                    });
            }


        }
        catch (err) { // In the event of an error -> Log in console, and to the log channel that the error has pccired

            logError(err, client)
        }

    },

}



async function logError(error, client) {

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
            err.path = error.path
            break;

        default:

            err.code = error.code || 404
            break;
    }


    console.log(`[Warning]: Error ${err.code} occured`)


    let logChannel = await client.channels.fetch(`${process.env.D_LOG_CHANNEL}`)

    const errEmbed = new EmbedBuilder()
        .setTitle(`**[New Error]**: \`\`\`${err.name}\`\`\``)
        .setColor('Red')
        .addFields(
            { name: `Error Code`, value: `${err.code || 'Not Found'}` },
            { name: `Error Method`, value: `${err.method}`, inline: true },
            { name: `Error Path`, value: `${err.path}`, inline: true },
            { name: `Error Message`, value: `${err.message}` },
            { name: `Attempted Command`, value: `check-live`, inline: true },
            { name: `\u200b`, value: '\u200b' },
            { name: 'Full Error', value: `\`\`\`${err.full}\`\`\`` }
        )
        .setTimestamp()

    logChannel.send({ embeds: [errEmbed] })
}
