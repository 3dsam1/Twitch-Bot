// Discord Constants
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Database constants.
const channelModel = require('../schemas/add_channel_schema')
const adminModel = require('../schemas/admin_schema')


const dotenv = require('dotenv')

dotenv.config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-channel')
        .setDescription('Adds a channel to send embeds too.')
        .addChannelOption(option => option

            .setName('channel')
            .setDescription('The ID of the channel you wish to add.')
            .setRequired(true)

        ),

    async execute(interaction) {

        const client = interaction.client
        await interaction.deferReply({ephemeral: true})
        try{
   


            const channel = interaction.options.getChannel('channel'); // Get the channel the user input. 


            let admin = await adminModel.findOne({ discord_id: `${interaction.user.id}` }) // Searches the database to find if the user is not an admin.
            let adminRole = await adminModel.findOne({name: 'Admin_Role'});

            if (!admin && !interaction.member.roles.cache.has(adminRole.discord_id)) { // If the user is not listed as an admin, deny permission to use this command.
                interaction.editReply({ content: 'You do not have the required permissions to use this.', ephemeral: true });
                return;
            }

            if (channel.type != 0) { // Checks to see if the channel they added is a text channel.
                await interaction.followUp({ content: 'Failed to add this channel. Please ensure it is a valid text channel and try again.', ephemeral: true });
                return;
            }

            let channelList = await channelModel.findOne({ channel_id: `${channel.id}` }) // Searches to see if the channel is already added.


            if (channelList) { // If it has been added, don't add it again.
                interaction.followUp('That channel is already recieving embeds for live users.')
                return;
            }

            interaction.followUp({ content: `Adding ${channel} to the list of channels.`, ephemeral: true })


            let profile = await channelModel.create({ // Creates a new file in the DB. 

                channel_id: `${channel.id}`,

            })

            profile.save().catch(console.error) // Saves the file to the DB and catches any errors. 



        }
        catch(err){
            logError(err, client);
        }


    },
}



async function logError(error, client) { // Log error function. Takes any error, and submits it to the log channel.
   
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
            err = error;

    

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
            { name: `Attempted Command`, value: `add-channel`, inline: true },
            { name: `\u200b`, value: '\u200b' },
            { name: 'Full Error', value: `\`\`\`${err.full}\`\`\`` }
        )
        .setTimestamp()
        

    logChannel.send({ embeds: [errEmbed] })
}
