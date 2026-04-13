const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ChannelType, InteractionContextType } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const token = process.env.BOT_TOKEN;
const clientId = '1430415744318967818';

const messages = ["LEFTWARD HUNGRY","LEFTWARD SAD","LEFTWARD ANGRY","LEFTWARD SICK","LEFTWARD THIRSTY","LEFTWARD FINE","LEFTWARD EATING","LEFTWARD DRINKING","LEFTWARD SITTING","LEFTWARD BORED","LEFTWARD QUESTIONING","LEFTWARD BUSY","LEFTWARD RUNNING","LEFTWARD STATIONARY","LEFTWARD POOPING","LEFTWARD PEEING","LEFTWARD HATING DELTARUNE","LEFTWARD HANGING OUT","LEFTWARD FRUSTRATED","LEFTWARD TEMPERED","LEFTWARD UPSET","LEFTWARD EVIL","LEFTWARD GOOD","LEFTWARD NEUTRAL","LEFTWARD SEXY","LEFTWARD QUIRKY","LEFTWARD HANDSOME","LEFTWARD RELAXING","LEFTWARD LISTENING","LEFTWARD PHASE 1","LEFTWARD PHASE 2","LEFTWARD PHASE 3","LEFTWARD PHASE 4","LEFTWARD DANGER","LEFTWARD HAPPY","LEFTWARD JOYFUL","LEFTWARD MYSTERIOUS","LEFTWARD GOOPY","LEFTWARD READING","LEFTWARD TALKING","LEFTWARD THINKING","LEFTWARD NAKED","LEFTWARD SHOPPING","LEFTWARD WORKING","LEFTWARD JOBLESS","LEFTWARD MAKING GOOD MUSIC","LEFTWARD HEISENBERG","LEFTWARD FURY","LEFTWARD SUS","LEFTWARD GOOPING","LEFTWARD RUN","LEFTWARD WALKING","LEFTWARD BREATHING","LEFTWARD FACE","LEFTWARD","LEFTWARD APP","ILEFTWARD","LEFTWARD SMART","LEFTWARD GENIUS","LEFTWARD KNOWLEDGEABLE"];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const rest = new REST({ version: '10' }).setToken(token);
(async () => {
  await rest.put(Routes.applicationCommands(clientId), { body: [] });
  await rest.put(Routes.applicationCommands(clientId), { body: [
    new SlashCommandBuilder().setName('leftward').setDescription('RESPONCE').setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel]).toJSON()
  ]});
  console.log('Commands registered.');
})();

client.on('ready', () => {
  console.log(`${client.user.tag} is online!`);
  client.user.setPresence({ status: 'online', activities: [{ name: 'YOU', type: 3 }] });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === 'leftward') await interaction.reply(pick(messages));
});

client.login(token);