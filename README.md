
# Bot Overview #

## Synopsis ##

This is a bot for <http://turntable.fm/>

## Dependencies ##
- [Alain Gilbert's turntable API] (https://github.com/alaingilbert/Turntable-API)
- [xml2js] (https://github.com/Leonidas-from-XIV/node-xml2js)

## Commands for the bot\* ##
| **Command**                       | **Effect**                                 |
| --------------------------------- | ------------------------------------------ |
|  leave                            |  Leave the room                            |
|  say _\[something\]_              |  Speak the phrase _\[something\]_ in chat  |
|  awesome                          |  Upvote                                    | 
|  up                               |  Become a DJ                               |
|  down                             |  Stop Dj-ing                               |
|  toggle _\[mode\]_                |  Toggle the mode _\[mode\]_                |
|  fan _\[user\]_                   |  Fan the user _\[user\]_                   |
|  fan me\*\*                       |  Fan the speaker                           |
|  print _\[setting\]_\*\*\*        |  Output _\[setting\]_ to the console       |
|  register _\[roomid\]_\*\*\*      |  Join the room _\[roomid\]_                |
|  exit\*\*\*                       |  Close the console                         |

\*Commands in the chat must be prefaced with \#

\*\*Turntable chat only

\*\*\*TCP only

## Features ##
- A TCP command line at localhost:5001
- A TCP log at localhost:5002
- Multiple modes to change the bot's behavior
- A blacklist
- Tracking of room statistics
- Interactive chatting through the bot

## Modes ##
| **Name**  | **Effect**                                |
| --------- | ----------------------------------------- |
|  meme     |  Enable the bot's meme-related responses  |
|  hostile  |  Enable the blacklist                     |

## Settings and environment variables ##
| **Name**     | **Data**                               |
| ------------ | -------------------------------------- |
|  modes       |  the current state of the bot's modes  |
|  users       |  the current users in the room         |
|  moderators  |  the room's moderators                 |
|  blacklist   |  the bot's blacklist                   |
|  votes       |  the count of upvotes and downvotes    |
|  has_voted   |  whether the bot has voted             |
|  is_dj       |  whether the bot is a DJ               |
|  room_id     |  the current room id                   |

## Notes and warnings ##

This bot was designed for a room that does not allow downvoting, and thus will issue warnings for downvoting.
