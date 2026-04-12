const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ChannelType, InteractionContextType } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const token = process.env.BOT_TOKEN;
const clientId = '1430415744318967818';
const INACTIVE_MS = 3 * 24 * 60 * 60 * 1000;
const lastSeen = new Map();

const messages = ["LEFTWARD HUNGRY","LEFTWARD SAD","LEFTWARD ANGRY","LEFTWARD SICK","LEFTWARD THIRSTY","LEFTWARD FINE","LEFTWARD EATING","LEFTWARD DRINKING","LEFTWARD SITTING","LEFTWARD BORED","LEFTWARD QUESTIONING","LEFTWARD BUSY","LEFTWARD RUNNING","LEFTWARD STATIONARY","LEFTWARD POOPING","LEFTWARD PEEING","LEFTWARD HATING DELTARUNE","LEFTWARD HANGING OUT","LEFTWARD FRUSTRATED","LEFTWARD TEMPERED","LEFTWARD UPSET","LEFTWARD EVIL","LEFTWARD GOOD","LEFTWARD NEUTRAL","LEFTWARD SEXY","LEFTWARD QUIRKY","LEFTWARD HANDSOME","LEFTWARD RELAXING","LEFTWARD LISTENING","LEFTWARD PHASE 1","LEFTWARD PHASE 2","LEFTWARD PHASE 3","LEFTWARD PHASE 4","LEFTWARD DANGER","LEFTWARD HAPPY","LEFTWARD JOYFUL","LEFTWARD MYSTERIOUS","LEFTWARD GOOPY","LEFTWARD READING","LEFTWARD TALKING","LEFTWARD THINKING","LEFTWARD NAKED","LEFTWARD SHOPPING","LEFTWARD WORKING","LEFTWARD JOBLESS","LEFTWARD MAKING GOOD MUSIC","LEFTWARD HEISENBERG","LEFTWARD FURY","LEFTWARD SUS","LEFTWARD GOOPING","LEFTWARD RUN","LEFTWARD WALKING","LEFTWARD BREATHING","LEFTWARD FACE"];

const inactiveMessages = ["WHERE ARE YOU","COME BACK","WE MISS YOU","HELLO","I NEED YOU","STOP IGNORING US","GET BACK HERE","WHY ARE YOU GONE","RETURN IMMEDIATELY","YOUR PRESENCE IS REQUIRED","SEND A MESSAGE NOW","YOUR DUTY IS TO BE HERE","SPEAK NOW","TALK NOW","ITS BEEN TO LONG"];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function setLastSeen(guildId, userId, timestamp = Date.now()) {
  if (!lastSeen.has(guildId)) lastSeen.set(guildId, new Map());
  lastSeen.get(guildId).set(userId, timestamp);
}

function getLastSeen(guildId, userId) {
  return lastSeen.get(guildId)?.get(userId) ?? null;
}

async function seedHistory(guild) {
  for (const channel of guild.channels.cache.values()) {
    if (channel.type !== ChannelType.GuildText) continue;
    if (!channel.permissionsFor(guild.members.me)?.has('ReadMessageHistory')) continue;
    let lastId = null;
    while (true) {
      const opts = { limit: 100 };
      if (lastId) opts.before = lastId;
      const fetched = await channel.messages.fetch(opts).catch(() => null);
      if (!fetched || fetched.size === 0) break;
      for (const msg of fetched.values()) {
        if (msg.author.bot) continue;
        const existing = getLastSeen(guild.id, msg.author.id) ?? 0;
        if (msg.createdTimestamp > existing) {
          setLastSeen(guild.id, msg.author.id, msg.createdTimestamp);
          console.log(`[Seed] ${msg.author.tag} last seen ${new Date(msg.createdTimestamp).toLocaleDateString()}`);
        }
      }
      lastId = fetched.last().id;
    }
  }
}

async function checkInactive(guild) {
  const channel = guild.channels.cache.find(c => c.type === ChannelType.GuildText && c.permissionsFor(guild.members.me).has('SendMessages'));
  if (!channel) return;
  const members = await guild.members.fetch().catch(() => null);
  if (!members) return;
  const now = Date.now();
  for (const member of members.values()) {
    if (member.user.bot) continue;
    const seen = getLastSeen(guild.id, member.id);
    if (!seen) { setLastSeen(guild.id, member.id, member.joinedTimestamp ?? now); continue; }
    if (now - seen > INACTIVE_MS) {
      await channel.send(`${member} ${pick(inactiveMessages)}`).catch(() => {});
      console.log(`[Ping] ${member.user.tag}`);
    }
  }
}

const rest = new REST({ version: '10' }).setToken(token);
(async () => {
  await rest.put(Routes.applicationCommands(clientId), { body: [] });
  await rest.put(Routes.applicationCommands(clientId), { body: [
    new SlashCommandBuilder().setName('leftward').setDescription('RESPONCE').setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel]).toJSON()
  ]});
  console.log('Commands registered.');
})();

client.on('ready', async () => {
  console.log(`${client.user.tag} is online!`);
  client.user.setPresence({ status: 'online', activities: [{ name: 'YOU', type: 3 }] });
  for (const guild of client.guilds.cache.values()) await seedHistory(guild);
  setTimeout(() => { for (const guild of client.guilds.cache.values()) checkInactive(guild); }, 10_000);
  setInterval(() => { for (const guild of client.guilds.cache.values()) checkInactive(guild); }, 24 * 60 * 60 * 1000);
});

client.on('messageCreate', (msg) => {
  if (msg.author.bot || !msg.guild) return;
  setLastSeen(msg.guild.id, msg.author.id);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === 'leftward') await interaction.reply(pick(messages));
});

client.login(token);