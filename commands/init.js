const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const adminProfile = require('../schemas/admin_schema');

const dotenv = require('dotenv')

dotenv.config();
module.exports = {
	data: new SlashCommandBuilder()
		.setName('init')
		.setDescription('Initializes the discord bot.')
        .addRoleOption(option =>
        option.setName('admin_role')
        .setDescription('The role you wish to use as a base admin role.')
        .setRequired(true)
        ),
	async execute(interaction) {

        let client = interaction.client
try{
    
    let adminRole = interaction.options.getRole('admin_role') // Grabs the role the user specified.

    let adminId = adminRole.id;

    let used = await adminProfile.findOne() // Checks to see if some role/user has already been added.

    

    if(!used){ // If it hasnt, then create an admin role and a admin user.
        let adminRole = await adminProfile.create({discord_id: adminId, name: 'Admin_Role'})
         let initUser = await adminProfile.create({discord_id: interaction.user.id, name: interaction.user.username});

    
    interaction.reply({content: `The bot has been setup with <#${adminId}> as the admin role. `, ephemeral: true})
    }

    else{
        interaction.reply({content: 'You are not able to use this command.', ephemeral: true});
        return;
    }
    
}

catch(err){ // In the event of an error -> Log in console, and to the log channel that the error has pccired

logError(err, client)


        
}
	},
};



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
                         let logChannel = await client.channels.fetch(`${process.env.D_LOG_CHANNEL}`)       
                    
                                const errEmbed = new EmbedBuilder()
                                    .setTitle(`**[New Error]**: \`\`\`${err.name}\`\`\``)
                                    .setColor('Red')
                                    .addFields(
                                        { name: `Error Code`, value: `${err.code}` },
                                        { name: `Error Method`, value: `${err.method}`, inline: true },
                                        { name: `Error Path`, value: `${err.path}`, inline: true },
                                        { name: `Error Message`, value: `${err.message}` },
                                        { name: `Attempted Command`, value: `init`, inline: true },
                                        {name: `\u200b`, value: '\u200b' },
                                        {name: 'Full Error', value: `\`\`\`${err.full}\`\`\``}
                                    )
                                    .setTimestamp()
                    
                                logChannel.send({ embeds: [errEmbed] })
}
