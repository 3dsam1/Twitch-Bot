const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs')
const dotenv = require('dotenv')

dotenv.config();



module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('Gets the User Info for a specific Twitch username!')
        .addStringOption(option => option.setName('input').setDescription('The input for the user')),
    async execute(interaction) {

        const client = interaction.client
        try {
            let user = interaction.options.getString('input') ?? `${interaction.user.username}`


            const ClientID = process.env.T_CLIENT_ID
            const accessToken = process.env.T_ACCESS_TOKEN;



            fetch(`https://api.twitch.tv/helix/users?login=${user}`, { // Fetch the user's information from twitch api.
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Client-Id": ClientID
                }

            }
            )
                .then(response => response.json()) // Parses the response into json.
                .then(response => {

                    if(response.data[0] == undefined){
                        interaction.reply({content: 'Failed to find the specified user. Please try again.', ephermeral: true})
                        return;
                    }

                    const ResultsEmbed = new EmbedBuilder() // Builds a new embed with the specified information.
                        .setTitle('Twitch User Information')
                         .setColor('#3D408F')
                        .addFields(
                            { name: 'Twitch Login name', value: `${response.data[0].login}`, inline: true },
                            { name: 'Twitch Display Name', value: `${response.data[0].display_name}`, inline: true },
                            { name: 'Twitch Description', value: `${response.data[0].description || "\n"}` },
                            { name: 'Twitch ID', value: `${response.data[0].id}`, inline: true },
                            { name: 'Viewcount', value: `${response.data[0].view_count}`, inline: true }
                        )
                        .setTimestamp()
                        .setFooter({ text: `Stream Team`, iconURL: 'https://i.imgur.com/N4IRIbH.gif' });

                    interaction.reply({ embeds: [ResultsEmbed] }) // Reply's with the embed. 

                })
        }

        catch (err) {
            logError(err, client)
            try {
                interaction.followUp({ content: 'Unfortunately an error occured. Please try again.', ephermeral: true })
            }
            catch (err) {
                logError(err, client)
            }
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
            { name: `Attempted Command`, value: `user-info`, inline: true },
            { name: `\u200b`, value: '\u200b' },
            { name: 'Full Error', value: `\`\`\`${err.full}\`\`\`` }
        )
        .setTimestamp()

    logChannel.send({ embeds: [errEmbed] })
}
