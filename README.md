# Media Team Twitch Bot

The goal of this project is to build out a robust discord bot that utilizes both the Twitch and Youtube API to be able to detect when a list of configurable stream team members go live.

Since this is just an onboarding project, get as far as you can. If you wish to limit the scope of this bot to just Twitch streams, or just Youtube streams, you may do so.

Please use the rest of this readme as documentation outlining the features we are looking for.



## Bot Features:

- Send an embed when a live-stream goes live - Done
  - Once the live stream ends, if the bot has the message_id of the live notification embed, update that embed to say that the live stream has ended. - Done

- Configuration should be "limitless" meaning that it accepts any number of streamers to recieve notifications on. - Done
  - If this gets tedious or a bit complicated, feel free to just implement one for the onboarding project, and we'll work with you afterwards to update it accordingly.

- Embeds should have all relevant information, including time updated/posted, link to the stream, and any information given from the API about the stream (tags, description, title, etc) - Done

- Optional:
  - Have each streamer tie their twitch/youtube stream to their discord ID, and give them a given role (discord role id) when they are live (subsequently take it away when they stop being live) 
  - Accept multiple channel ids so we can support multiple guilds at once (don't think you'll need to work with sharding) - Done
  - Pull individual streamer profiles (profile picture, etc) to make the embeds look more customized.- In progress
  - After x amount of time (should be async) remove the embed after the stream is no longer live. 



## Configuration

This project (especially since node.js supports dotenv so well) should use an environmental variable file (.env) to store all secrets and most configurable options.

If when you are implementing some of the optional features (especially unlimited streams, ids, etc), you might need to move away from the .env file for storage. Anything past credentials/secrets is up to you how they are stored. The only requirement is that all secrets (API keys, tokens, etc) should be stored in the .env file.

Once you have gotten some grounds into development you should update the below section to correspond to serve as documentation for the .env file. Additionally please provide a sample .env file (sample.env or something similar). Your local development .env file should be included in the .gitignore file so no one ever accidentally commits secrets.

Discord Secrets:

`d_token` The discord bot token.

`d_clientId` The discord bot's client ID.

`d_logChannelId` The ID of the Discord Channel in which logs will be sent. Used for error logging.

Twitch Secrets:

`t_clientId` The twitch developer application client id.

`t_clientSecret` The twitch developer application client secret

`t_accessToken` The twitch API access token. Obtained from a call to Twitch API. Must be renewed roughly every month.

Database Secrets: 

`databaseToken` The connection token provided by the database. Note, this project uses MongoDB.

## API References

### Twitch API

```http
  https://dev.twitch.tv/docs/api/
```

| Environment Variable | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `TWITCH_ACCESS_TOKEN` | `string` | **Required**. Twitch API access token. See https://dev.twitch.tv/docs/authentication/ |

### Youtube API

```http
  https://developers.google.com/youtube/v3/live/getting-started
```

| Environment Variable | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `YOUTUBE_API_KEY`      | `string` | **Required**. Youtube API key to retrieve public information. See https://developers.google.com/youtube/v3/live/registering_an_application. Note, you do not need to worry about OAuth since we are retrieving public information. |


## Color Reference

| Color             | Hex                                                                |
| ----------------- | ------------------------------------------------------------------ |
| "Success" Embed Color | ![#3D408F](https://via.placeholder.com/10/3D408F?text=+) #3D408F |
| "Error" Embed Color | ![#FF0000](https://via.placeholder.com/10/FF0000?text=+) #FF0000 |


## Local Development

Change the readme below as you develop the bot for instructions on how to build the bot locally for development purposes.

**Note:** This doesn't have to be anything fancy, no docker needed (although it may be easier), etc.

### Starting the Bot:

First clone this repository to your directory.

Replace the .sampleenv with your .env file.

Either using a previous Discord Bot Application, or by creating a new one, replace the Discord Secrets in the .env file with ones from your discord bot.

Add the ID of the channel in which you wish to use for logging in the .env file.

Create a new Twitch Developer Application, and use the tokens below as needed.

Copy the following curl command, replacing the client_id and client_secret areas with the proper tokens from the Twitch Developer Application.

(Note, this is for linux. Ensure that it is changed for the proper OS.)


```
curl -X POST 'https://id.twitch.tv/oauth2/token' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'client_id=<your client id goes here>&client_secret=<your client secret goes here>&grant_type=client_credentials'
```

Now, using the access token provided, along with the client ID and client Secret, input them into the .env file.

This project uses MongoDB. You will need to create an initial database, and then copy the connection URL provided by MongoDB and paste it into the databaseToken env variable.

Run the following commands using docker:

```
  docker compose up --build -d -t bot

```

The bot should start then start up. To test if the bot is running, use the /ping command.

Run the /init command. This will set you as a admin, and allow you to add new admins. 


