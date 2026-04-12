const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChannelType,
} = require('discord.js');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const clientId = '1430415744318967818';

const INACTIVE_DAYS = 3;
const CHECK_INTERVAL_MS = 60 * 60 * 1000;
const INACTIVE_MS = INACTIVE_DAYS * 24 * 60 * 60 * 1000;

const lastSeen = new Map();
const alreadyPinged = new Set();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
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
  "LEFTWARD HATING DELTARUNE",
  "LEFTWARD HANGING OUT",
  "LEFTWARD FRUSTRATED",
  "LEFTWARD TEMPERED",
  "LEFTWARD UPSET",
  "LEFTWARD EVIL",
  "LEFTWARD GOOD",
  "LEFTWARD NEUTRAL",
  "LEFTWARD SEXY",
  "LEFTWARD QUIRKY",
  "LEFTWARD HANDSOME",
  "LEFTWARD RELAXING",
  "LEFTWARD LISTENING",
  "LEFTWARD PHASE 1",
  "LEFTWARD PHASE 2",
  "LEFTWARD PHASE 3",
  "LEFTWARD PHASE 4",
  "LEFTWARD DANGER",
  "LEFTWARD HAPPY",
  "LEFTWARD JOYFUL",
  "LEFTWARD MYSTERIOUS",
  "LEFTWARD GOOPY",
  "LEFTWARD READING",
  "LEFTWARD TALKING",
  "LEFTWARD THINKING",
  "LEFTWARD NAKED",
  "LEFTWARD SHOPPING",
  "LEFTWARD WORKING",
  "LEFTWARD JOBLESS",
  "LEFTWARD MAKING GOOD MUSIC",
  "LEFTWARD HEISENBERG",
  "LEFTWARD FURY",
  "LEFTWARD SUS",
  "LEFTWARD GOOPING",
  "LEFTWARD RUN",
  "LEFTWARD WALKING",
  "LEFTWARD BREATHING",
  "LEFTWARD FACE"
];

const inactiveMessages = [
  "WHERE ARE YOU",
  "COME BACK",
  "WE MISS YOU",
  "HELLO",
  "I NEED YOU",
  "STOP IGNORING US",
  "GET BACK HERE",
  "WHY ARE YOU GONE",
  "RETURN IMMEDIATELY",
  "YOUR PRESENCE IS REQUIRED",
  "SEND A MESSAGE NOW",
  "YOUR DUTY IS TO BE HERE",
  "SPEAK NOW",
  "TALK NOW",
  "ITS BEEN TO LONG"
];

function randomMessage() {
  return messages[Math.floor(Math.random() * messages.length)];
}

function randomInactiveMessage() {
  return inactiveMessages[Math.floor(Math.random() * inactiveMessages.length)];
}

function getPingChannel(guild) {
  return guild.channels.cache.find(
    (c) =>
      c.type === ChannelType.GuildText &&
      c.permissionsFor(guild.members.me).has('SendMessages')
  );
}

function updateLastSeen(guildId, userId) {
  if (!lastSeen.has(guildId)) lastSeen.set(guildId, new Map());
  lastSeen.get(guildId).set(userId, Date.now());
  alreadyPinged.delete(`${guildId}-${userId}`);
}

async function checkInactiveUsers() {
  console.log('[Inactivity Check] Running...');
  const now = Date.now();

  for (const guild of client.guilds.cache.values()) {
    let members;
    try {
      members = await guild.members.fetch();
    } catch (err) {
      console.error(`[${guild.name}] Failed to fetch members:`, err.message);
      continue;
    }

    const guildLastSeen = lastSeen.get(guild.id) ?? new Map();
    const pingChannel = getPingChannel(guild);

    if (!pingChannel) {
      console.warn(`[${guild.name}] No pingable channel found, skipping.`);
      continue;
    }

    for (const [memberId, member] of members) {
      if (member.user.bot) continue;

      const key = `${guild.id}-${memberId}`;
      const lastSeenAt = guildLastSeen.get(memberId);

      if (!lastSeenAt) {
        const joinedAt = member.joinedTimestamp ?? now;
        guildLastSeen.set(memberId, joinedAt);
        if (!lastSeen.has(guild.id)) lastSeen.set(guild.id, new Map());
        lastSeen.get(guild.id).set(memberId, joinedAt);
        continue;
      }

      const inactive = now - lastSeenAt > INACTIVE_MS;

      if (inactive && !alreadyPinged.has(key)) {
        try {
          await pingChannel.send(`${member} ${randomInactiveMessage()}`);
          alreadyPinged.add(key);
          console.log(`[${guild.name}] Pinged inactive user: ${member.user.tag}`);
        } catch (err) {
          console.error(`[${guild.name}] Failed to ping ${member.user.tag}:`, err.message);
        }
      }
    }
  }
}

const commands = [
  new SlashCommandBuilder()
    .setName('leftward')
    .setDescription('RESPONCE')
    .setContexts(['BotDM', 'PrivateChannel', 'Guild']),
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(clientId), { body: [] });
    console.log('Cleared all old global commands.');
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('Registered /leftward command.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('ready', () => {
  console.log(`${client.user.tag} is online!`);

  client.user.setPresence({
    status: 'online',
    activities: [{ name: 'YOU', type: 3 }],
  });

  seedLastSeenFromHistory();

  setInterval(checkInactiveUsers, CHECK_INTERVAL_MS);
  setTimeout(checkInactiveUsers, 10_000);
});

async function seedLastSeenFromHistory() {
  console.log('[Seed] Scanning recent message history...');
  for (const guild of client.guilds.cache.values()) {
    const textChannels = guild.channels.cache.filter(
      (c) =>
        c.type === ChannelType.GuildText &&
        c.permissionsFor(guild.members.me)?.has('ReadMessageHistory')
    );

    for (const [, channel] of textChannels) {
      try {
        const fetched = await channel.messages.fetch({ limit: 100 });
        for (const msg of fetched.values()) {
          if (msg.author.bot) continue;
          const existing = lastSeen.get(guild.id)?.get(msg.author.id) ?? 0;
          if (msg.createdTimestamp > existing) {
            updateLastSeen(guild.id, msg.author.id);
            lastSeen.get(guild.id).set(msg.author.id, msg.createdTimestamp);
          }
        }
      } catch {}
    }
  }
  console.log('[Seed] Done.');
}

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  updateLastSeen(message.guild.id, message.author.id);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === 'leftward') {
    await interaction.reply(randomMessage());
  }
});

client.login(token);