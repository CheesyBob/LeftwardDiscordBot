const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const token = 'MTQzMDQxNTc0NDMxODk2NzgxOA.GmuRXd.UQ593Uul-L6vGVnOE44xLtK_xZMcdeKxezQAHM';
const clientId = '1430415744318967818';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const messages = [
  "LEFTWARD HUNGRY",
  "LEFTWARD SAD",
  "LEFTWARD ANGRY",
  "LEFTWARD SICK",
  "LEFTWARD THIRSTY",
  "LEFTWARD FINE",
  "LEFTWARD EATING",
  "LEFTWARD DRINKING",
  "LEFTWARD SITTING",
  "LEFTWARD BORED",
  "LEFTWARD QUESTIONING",
  "LEFTWARD BUSY",
  "LEFTWARD RUNNING",
  "LEFTWARD STATIONARY",
  "LEFTWARD POOPING",
  "LEFTWARD PEEING",
  "LEFTWARD SPEWING DIRREAH",
  "LEFTWARD KILLING DELTARUNE",
  "LEFTWARD PLAYING RED DEAD REDEMPTION 2",
  "LEFTWARD HANGING OUT",
  "LEFTWARD FRUSTRATED",
  "LEFTWARD TEMPERED",
  "LEFTWARD UPSET",
  "LEFTWARD EVIL",
  "LEFTWARD GOOD",
  "LEFTWARD NEUTRAL",
  "LEFTWARD SEXY",
  "LEFTWARD QUIRKY",
  "LEFTWARD HANDSOME"
];

const commands = [
  new SlashCommandBuilder()
    .setName('leftward')
    .setDescription('RESPONCE')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(clientId), { body: [] });
    console.log('Cleared all old global commands.');

    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('Registered single global /leftward command.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'leftward') {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    await interaction.reply(randomMessage);
  }
});

client.on('ready', () => {
  console.log(`${client.user.tag} is online!`);
  client.user.setPresence({
    status: 'online',
    activities: [{
      name: 'YOU',
      type: 3
    }]
  });
});

client.login(token);