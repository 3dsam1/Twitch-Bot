const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const dotenv = require('dotenv')

dotenv.config();
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {

        const client = interaction.client;


try{


        const exampleEmbed = new EmbedBuilder()
        .setColor('#3D408F')
        .setTitle("Latency :ping_pong:")
        .setDescription('Pinging.. Please wait.')  
        .setTimestamp()
        .setFooter({ text: `Stream Team`, iconURL: 'https://i.imgur.com/N4IRIbH.gif' });


    
 const sent = await interaction.reply({embeds: [exampleEmbed], fetchReply: true});

 await interaction.fetchReply()

    var ping = sent.createdTimestamp - interaction.createdTimestamp;

   const finalEmbed = new EmbedBuilder()
        .setColor('#3D408F')
        .setTitle("Latency :ping_pong:")
        .setDescription(`Bot: ${ping} ms\nAPI: ${interaction.client.ws.ping} ms`)
        .setTimestamp()
        .setFooter({ text: `Stream Team`, iconURL: 'https://i.imgur.com/N4IRIbH.gif' });


    interaction.editReply({ embeds: [finalEmbed]});

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
                                        { name: `Attempted Command`, value: `ping`, inline: true },
                                        {name: `\u200b`, value: '\u200b' },
                                        {name: 'Full Error', value: `\`\`\`${err.full}\`\`\``}
                                    )
                                    .setTimestamp()
                    
                                logChannel.send({ embeds: [errEmbed] })
}
