const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs')
const dotenv = require('dotenv')

const profileModel = require('../schemas/add_user_schema')
const adminModel = require('../schemas/admin_schema')

dotenv.config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-user')
        .setDescription('removes a user from stream team.')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('The user to remove - Using twitch Login')
                .setRequired(true)
        ),

    async execute(interaction) {
        const client = interaction.client

        try{

        const userName = interaction.options.getString('user');

       let admin = await adminModel.findOne({discord_id: interaction.user.id})
       let adminRole = await adminModel.findOne({name: 'Admin_Role'});
            
       if (!admin && !interaction.member.roles.cache.has(adminRole.discord_id)) { // If the user is not listed as an admin, deny permission to use this command.
        interaction.editReply({ content: 'You do not have the required permissions to use this.', ephemeral: true });
           return;
       }

       await interaction.reply({ content: `Attempting to remove ${userName} from the stream team.`, ephemeral: true })


        
        let member = await profileModel.findOne({name: userName});

        
       if(member){
      
        await profileModel.deleteOne({name: userName});


        interaction.editReply({content: `Succesfully removed ${userName} from the stream team.`, ephemeral: true});


       }

        if (!member) { // If they aren't in the list, reply. 

            interaction.editReply({ content: `Failed to find the specified user. Please try again.`, ephemeral: true });
            return;

        }
        
    }
    

    catch(err){ // In the event of an error -> Log in console, and to the log channel that the error has pccired

        logError(err, client)
        
}
    },

}



async function logError(error, client)  {
    let err =   new Error


   
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
            err.name = error.name
            err.message = error.message
            err.code = error.code
            err.full = error
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
                                        { name: `Attempted Command`, value: `remove-user`, inline: true },
                                        {name: `\u200b`, value: '\u200b' },
                                        {name: 'Full Error', value: `\`\`\`${err.full}\`\`\``}
                                    )
                                    .setTimestamp()
                    
                                logChannel.send({ embeds: [errEmbed] })
}
