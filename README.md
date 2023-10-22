# About

This is a Twitch chat bot to reply to commands (!np, !skin and etc) and to send osu status updates (pp, rank and map rank)

Intial idea and code base from [Ceiling Waffle's osu-np](https://bitbucket.org/ceilingwaffle/osu-np/src/master), feel free to help the project improving the code or contacting me in discord: `reklawnella`

# Requirements
- NodeJS from https://nodejs.org/en/download/

# Installation
- Download zip from this [repository](https://github.com/reklaWnellA/Twitch-Osu-Stats/archive/refs/heads/master.zip)
- Extract the zip file to a folder somewhere
- Press win+R to open the run window
- type: cmd
- In the console window, type:
```
cd <folder path where you extracted the zip file>
```
- Install the required NodeJS modules:
```
npm install
```
- Rename the file .env.example to .env
- Open .env in notepad and modify the Twitch username, channel, twitch oauth password, osu stream companion txt file location, osu oauth client id and secret (Get your [twitch oauth password here](https://twitchapps.com/tmi), for osu oauth id and secret you will need to [register an OAuth application](https://osu.ppy.sh/home/account/edit#new-oauth-application))
```
TWITCH_BOT_USERNAME=my_twitch_username
TWITCH_TARGET_CHANNEL=my_twitch_channel_name
TWITCH_BOT_OAUTH_PASSWORD=oauth:x1Yz
OSU_NP_TEXT_FILE_PATH=C:\Program Files (x86)\StreamCompanion\Files\np.txt
OSU_USER_ID=123
OSU_OAUTH_CLIENT_ID=0000
OSU_OAUTH_CLIENT_SECRET=xyz
```

# Running
- Start the bot by launching `start.bat` file or typing this in the cmd window:
```
npm start
```

# TODO:
- [ ] check if theres an event (websocket) that can be used instead of getting osu status everytime
