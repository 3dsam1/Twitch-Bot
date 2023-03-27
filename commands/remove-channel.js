// Discord Constants
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Database constants.
const channelModel = require('../schemas/add_channel_schema')
const adminModel = require('../schemas/admin_schema')


const dotenv = require('dotenv')

dotenv.config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-channel')
        .setDescription(`remove's a channel to send embeds too.`)
        .addChannelOption(option => option

            .setName('channel')
            .setDescription('The ID of the channel you wish to remove.')
            .setRequired(true)

        ),

    async execute(interaction) {

        const client = interaction.client

       await interaction.deferReply({ephemeral: true});

        try {


            const channel = interaction.options.getChannel('channel'); // Get the channel the user input. 

            
            
            
            let admin = await adminModel.findOne({ discord_id: `${interaction.user.id}` }) // Searches the database to find if the user is not an admin.
            let adminRole = await adminModel.findOne({name: 'Admin_Role'});
            
            if (!admin && !interaction.member.roles.cache.has(adminRole.discord_id)) { // If the user is not listed as an admin, deny permission to use this command.
                interaction.editReply({ content: 'You do not have the required permissions to use this.', ephemeral: true });
                return;
            }



            if (channel.type != 0) { // Checks to see if the channel they added is a text channel.
               await interaction.editReply({ content: 'Failed to remove this channel. Please ensure it is a valid text channel and try again.'});
                return;
            }

            let channelList = await channelModel.findOne({ channel_id: `${channel.id}` }) // Searches to see if the channel is already added.



            if (!channelList) { // If it hasn't been added, dont try to remove it.
                await interaction.editReply('That channel is already not recieving embeds for live users.')
                return;
            }

           await interaction.editReply({ content: `Removing ${channel} from the list of channels.`, ephemeral: true })

          
            await channelModel.deleteOne({channel_id: `${channel.id}`})
        
            let channelCheck = await channelModel.findOne()

            if(!channelCheck){
                interaction.followUp(`You have tried to remove the last channel. Please add a new channel, and try again.`);
            }
        }

        catch (err) { // In the event of an error -> Log in console, and to the log channel that the error has occured
            logError(err, client)

            

        }



    },
}



async function logError(error, client)  {
    let err =  new Error


   
    switch(error.name){
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
            break;
    }

    console.log(`[Warning]: Error ${err.code} occured`)
                         let logChannel = await client.channels.fetch(`${process.env.d_logChannelId}`)       
                    
                                const errEmbed = new EmbedBuilder()
                                    .setTitle(`**[New Error]**: \`\`\`${err.name}\`\`\``)
                                    .setColor('Red')
                                    .addFields(
                                        { name: `Error Code`, value: `${err.code}` },
                                        { name: `Error Method`, value: `${err.method}`, inline: true },
                                        { name: `Error Path`, value: `${err.path}`, inline: true },
                                        { name: `Error Message`, value: `${err.message}` },
                                        { name: `Attempted Command`, value: `remove-channel`, inline: true },
                                        {name: `\u200b`, value: '\u200b' },
                                        {name: 'Full Error', value: `\`\`\`${err.full}\`\`\``}
                                    )
                                    .setTimestamp()
                    
                                logChannel.send({ embeds: [errEmbed] })
}
