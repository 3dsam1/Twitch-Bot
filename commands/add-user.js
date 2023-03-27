// Discord Constants
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// DB Constants
const profileModel = require('../schemas/add_user_schema')
const adminModel = require('../schemas/admin_schema')

const dotenv = require('dotenv')

dotenv.config();


module.exports = {
    data: new SlashCommandBuilder() // Builds the slash command.
        .setName('add-user')
        .setDescription('Adds a user to the stream team.')
        .addStringOption(option => // Allows the user to enter in a string for a username. 
            option.setName('username')
                .setDescription('The user to add - Using twitch Login')
                .setRequired(true)
        )
        .addUserOption(option => // Allows the user to enter in a discord user. 
            option.setName('user_id')
                .setDescription('The discord ID of the user you are wanting to add.')
        ),


    async execute(interaction) {

        const client = interaction.client

       await interaction.deferReply({ephemeral: true})

       try {


            const user = interaction.options.getString('username');
            
            let userID = interaction.options.getUser('user_id') ?? 'None Provided' // If there isn't a user ID, set it as None Provided.

            

            if (userID !== "None Provided") { // If the user is specified, we get the actual discord ID from it.
                userID = userID.id
            }

            let admin = await adminModel.findOne({ discord_id: `${interaction.user.id}` }) // Searches the database to find if the user is not an admin.
            let adminRole = await adminModel.findOne({name: 'Admin_Role'});
            
            if (!admin && !interaction.member.roles.cache.has(adminRole.discord_id)) { // If the user is not listed as an admin, deny permission to use this command.
                interaction.editReply({ content: 'You do not have the required permissions to use this.', ephemeral: true });
                return;
            }



            let member = await profileModel.findOne({ name: user }) // Searches for the member in the list.

            if (member) { // If it's found, the user has already been added. 
                interaction.editReply({ content: 'This user has already been added. Please try again.', ephemeral: true })
                return;
            }

            const ClientID = process.env.T_CLIENT_ID
            const accessToken = process.env.T_ACCESS_TOKEN;
            let valid = 1;

            await fetch(`https://api.twitch.tv/helix/streams/?user_login=${user}`, { 
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Client-Id": ClientID
            }

        })
                .then(response => response.json()) 
                .then(response => {

                    if(response.error != undefined && response.message == 'Malformed query params.'){ // Checks if the API can't find the user.
                        interaction.editReply({content: `Failed to add ${user} to the stream team. Please ensure the username is spelt correctly.`})
                        valid = 0;
                        return;
                    }
                });

                if(valid == 0){
                    return;
                }
            let profile = await profileModel.create({ // Creates a new file.


                discord_id: `${userID}`,
                name: user

            })
            profile.save().catch(console.error) // Saves file.

            interaction.editReply({ content: `Adding ${user} to the stream team!`, ephemeral: true })


        }

        catch (err) { // In the event of an error -> Log in console, and to the log channel that the error has pccired

            logError(err, client)
            try {
                interaction.followUp({ content: 'Unfortunately an error occured. Please try again.', content: ephemeral })
            }
            catch (err) {
                logError(err, client)
            }
        }



        async function logError(error, client) { // Error Log Function.
          
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
        

            if(!err.code){
                err.code = 'Error'
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
                    { name: `Attempted Command`, value: `add-user`, inline: true },
                    { name: `\u200b`, value: '\u200b' },
                    { name: 'Full Error', value: `\`\`\`${err.full}\`\`\`` }
                )
                .setTimestamp()
        
            logChannel.send({ embeds: [errEmbed] })
        }


    },

}
