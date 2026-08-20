const {
SlashCommandBuilder,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
PermissionsBitField
} = require("discord.js");

const fs = require("fs");

const DB_FILE = "./database.json";

const POC_ID = "1410380405089239115";

const TEAM_OWNER_ROLE_ID = "1539809139394478121";

// ==========================================
// DATABASE
// ==========================================

function loadDB() {
if (!fs.existsSync(DB_FILE)) {
return {
teams: {},
players: {},
games: {},
stats: {},
pendingOffers: {},
settings: {
season: 1
}
};
}

const db = JSON.parse(
fs.readFileSync(DB_FILE, "utf8")
);

db.teams ??= {};
db.players ??= {};
db.games ??= {};
db.stats ??= {};
db.pendingOffers ??= {};
db.settings ??= { season: 1 };

return db;
}

function saveDB(db) {
fs.writeFileSync(
DB_FILE,
JSON.stringify(db, null, 2)
);
}

// ==========================================
// POC CHECK
// ==========================================

function isPOC(userId) {
return (
userId === POC_ID 
);
}

// ==========================================
// TEAM OWNER ROLE
// ==========================================

async function giveTeamOwnerRole(interaction, userId) {
try {
const member =
await interaction.guild.members.fetch(userId);

if (!member.roles.cache.has(TEAM_OWNER_ROLE_ID)) {
await member.roles.add(TEAM_OWNER_ROLE_ID);
}

return true;

} catch (error) {
console.error(
`Could not give Team Owner role to ${userId}:`,
error.message
);

return false;
}
}

// ==========================================
// REMOVE TEAM OWNER ROLE
// ==========================================

async function removeTeamOwnerRole(interaction, userId) {
if (!userId) return;

try {
const member =
await interaction.guild.members.fetch(userId);

if (member.roles.cache.has(TEAM_OWNER_ROLE_ID)) {
await member.roles.remove(TEAM_OWNER_ROLE_ID);
}

} catch (error) {
console.error(
`Could not remove Team Owner role from ${userId}:`,
error.message
);
}
}

// ==========================================
// COMMANDS
// ==========================================

const commands = [

// ========================================
// CREATE
// ========================================

new SlashCommandBuilder()
.setName("create")
.setDescription("VVLL creation commands")

.addSubcommand(sub =>
sub
.setName("team")
.setDescription("Create a VVLL team")

.addRoleOption(option =>
option
.setName("role")
.setDescription("Team Discord role")
.setRequired(true)
)

.addUserOption(option =>
option
.setName("manager")
.setDescription("Team manager")
.setRequired(true)
)

.addUserOption(option =>
option
.setName("comanager")
.setDescription("Team co-manager")
.setRequired(false)
)
)

.addSubcommand(sub =>
sub
.setName("game")
.setDescription("Create a VVLL game")

.addRoleOption(option =>
option
.setName("team1")
.setDescription("First team")
.setRequired(true)
)

.addRoleOption(option =>
option
.setName("team2")
.setDescription("Second team")
.setRequired(true)
)

.addStringOption(option =>
option
.setName("time")
.setDescription("Game time")
.setRequired(true)
)

.addStringOption(option =>
option
.setName("standing")
.setDescription("Tournament stage")
.setRequired(true)

.addChoices(
{
name: "16-Stand",
value: "16-stand"
},
{
name: "8-Stand",
value: "8-stand"
},
{
name: "4-Quarter",
value: "4-quarter"
},
{
name: "2-Semi",
value: "2-semi"
}
)
)

.addStringOption(option =>
option
.setName("format")
.setDescription("Game format")
.setRequired(true)

.addChoices(
{ name: "4v4", value: "4v4" },
{ name: "5v5", value: "5v5" },
{ name: "6v6", value: "6v6" },
{ name: "7v7", value: "7v7" },
{ name: "8v8", value: "8v8" },
{ name: "9v9", value: "9v9" },
{ name: "10v10", value: "10v10" },
{ name: "11v11", value: "11v11" }
)
)
),

// ========================================
// SIGN
// ========================================

new SlashCommandBuilder()
.setName("sign")
.setDescription("Send a contract offer")

.addUserOption(option =>
option
.setName("player")
.setDescription("Player to sign")
.setRequired(true)
),

// ========================================
// RELEASE
// ========================================

new SlashCommandBuilder()
.setName("release")
.setDescription("Release VVLL players")

.addSubcommand(sub =>
sub
.setName("player")
.setDescription("Release a player")

.addUserOption(option =>
option
.setName("player")
.setDescription("Player to release")
.setRequired(true)
)
),

// ========================================
// VIEW
// ========================================

new SlashCommandBuilder()
.setName("view")
.setDescription("View VVLL information")

.addSubcommand(sub =>
sub
.setName("roster")
.setDescription("View a team roster")

.addRoleOption(option =>
option
.setName("team")
.setDescription("Team to view")
.setRequired(true)
)
)

.addSubcommand(sub =>
sub
.setName("league")
.setDescription("View every VVLL team")
),

// ========================================
// GIVE STATS
// ========================================

new SlashCommandBuilder()
.setName("give")
.setDescription("Give player statistics")

.addSubcommand(sub =>
sub
.setName("stats")
.setDescription("Give stats to a player")

.addUserOption(option =>
option
.setName("player")
.setDescription("Player")
.setRequired(true)
)

.addIntegerOption(option =>
option
.setName("goals")
.setDescription("Goals")
.setRequired(true)
.setMinValue(0)
)

.addIntegerOption(option =>
option
.setName("assists")
.setDescription("Assists")
.setRequired(true)
.setMinValue(0)
)

.addIntegerOption(option =>
option
.setName("saves")
.setDescription("Saves")
.setRequired(true)
.setMinValue(0)
)
),

// ========================================
// CHECK STATS
// ========================================

new SlashCommandBuilder()
.setName("check")
.setDescription("Check VVLL information")

.addSubcommand(sub =>
sub
.setName("stats")
.setDescription("Check player statistics")

.addUserOption(option =>
option
.setName("player")
.setDescription("Optional player")
.setRequired(false)
)
),

// ========================================
// CHANGE MANAGER
// ========================================

new SlashCommandBuilder()
.setName("change")
.setDescription("Change VVLL management")

.addSubcommand(sub =>
sub
.setName("manager")
.setDescription("Change team management")

.addRoleOption(option =>
option
.setName("team")
.setDescription("Team")
.setRequired(true)
)

.addUserOption(option =>
option
.setName("manager")
.setDescription("New manager")
.setRequired(true)
)

.addUserOption(option =>
option
.setName("comanager")
.setDescription("New co-manager")
.setRequired(false)
)
),

// ========================================
// DELETE TEAM
// ========================================

new SlashCommandBuilder()
.setName("delete")
.setDescription("Delete VVLL information")

.addSubcommand(sub =>
sub
.setName("team")
.setDescription("Delete a team")

.addRoleOption(option =>
option
.setName("team")
.setDescription("Team to delete")
.setRequired(true)
)
),

// ========================================
// KICK
// ========================================

new SlashCommandBuilder()
.setName("kick")
.setDescription("Kick a member")

.addUserOption(option =>
option
.setName("user")
.setDescription("Member to kick")
.setRequired(true)
)

.addStringOption(option =>
option
.setName("reason")
.setDescription("Reason for kick")
.setRequired(false)
),

// ========================================
// BAN
// ========================================

new SlashCommandBuilder()
.setName("ban")
.setDescription("Ban a member")

.addUserOption(option =>
option
.setName("user")
.setDescription("Member to ban")
.setRequired(true)
)

.addStringOption(option =>
option
.setName("reason")
.setDescription("Reason for ban")
.setRequired(false)
),

// ========================================
// TIMEOUT
// ========================================

new SlashCommandBuilder()
.setName("timeout")
.setDescription("Timeout a member")

.addUserOption(option =>
option
.setName("user")
.setDescription("Member to timeout")
.setRequired(true)
)

.addIntegerOption(option =>
option
.setName("minutes")
.setDescription("Timeout duration in minutes")
.setRequired(true)
.setMinValue(1)
.setMaxValue(40320)
)

.addStringOption(option =>
option
.setName("reason")
.setDescription("Reason for timeout")
.setRequired(false)
)
];

// ==========================================
// COMMAND HANDLER
// ==========================================

async function handleCommand(interaction) {

const db = loadDB();

const command =
interaction.commandName;

const subcommand =
interaction.options.getSubcommand(false);

// ========================================
// KICK
// ========================================

if (command === "kick") {

if (
!interaction.member.permissions.has(
PermissionsBitField.Flags.KickMembers
)
) {
return interaction.reply({
content:
"❌ You need the Kick Members permission.",
ephemeral: true
});
}

const member =
interaction.options.getMember("user");

const reason =
interaction.options.getString("reason") ||
"No reason provided";

if (!member) {
return interaction.reply({
content:
"❌ That member isn't in the server.",
ephemeral: true
});
}

if (member.id === interaction.user.id) {
return interaction.reply({
content:
"❌ You can't kick yourself.",
ephemeral: true
});
}

if (!member.kickable) {
return interaction.reply({
content:
"❌ I can't kick that member. My role needs to be above theirs.",
ephemeral: true
});
}

await member.kick(reason);

return interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("👢 Member Kicked")
.setDescription(
`<@${member.id}> was kicked from the server.`
)
.addFields({
name: "Reason",
value: reason
})
.setTimestamp()
]
});
}

// ========================================
// BAN
// ========================================

if (command === "ban") {

if (
!interaction.member.permissions.has(
PermissionsBitField.Flags.BanMembers
)
) {
return interaction.reply({
content:
"❌ You need the Ban Members permission.",
ephemeral: true
});
}

const member =
interaction.options.getMember("user");

const reason =
interaction.options.getString("reason") ||
"No reason provided";

if (!member) {
return interaction.reply({
content:
"❌ That member isn't in the server.",
ephemeral: true
});
}

if (member.id === interaction.user.id) {
return interaction.reply({
content:
"❌ You can't ban yourself.",
ephemeral: true
});
}

if (!member.bannable) {
return interaction.reply({
content:
"❌ I can't ban that member. My role needs to be above theirs.",
ephemeral: true
});
}

await member.ban({
reason: reason
});

return interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("🔨 Member Banned")
.setDescription(
`<@${member.id}> was banned from the server.`
)
.addFields({
name: "Reason",
value: reason
})
.setTimestamp()
]
});
}

// ========================================
// TIMEOUT
// ========================================

if (command === "timeout") {

if (
!interaction.member.permissions.has(
PermissionsBitField.Flags.ModerateMembers
)
) {
return interaction.reply({
content:
"❌ You need the Moderate Members permission.",
ephemeral: true
});
}

const member =
interaction.options.getMember("user");

const minutes =
interaction.options.getInteger("minutes");

const reason =
interaction.options.getString("reason") ||
"No reason provided";

if (!member) {
return interaction.reply({
content:
"❌ That member isn't in the server.",
ephemeral: true
});
}

if (member.id === interaction.user.id) {
return interaction.reply({
content:
"❌ You can't timeout yourself.",
ephemeral: true
});
}

if (!member.moderatable) {
return interaction.reply({
content:
"❌ I can't timeout that member. My role needs to be above theirs.",
ephemeral: true
});
}

await member.timeout(
minutes * 60 * 1000,
reason
);

return interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("⏱️ Member Timed Out")
.setDescription(
`<@${member.id}> was timed out.`
)
.addFields(
{
name: "Duration",
value: `${minutes} minute(s)`,
inline: true
},
{
name: "Reason",
value: reason,
inline: true
}
)
.setTimestamp()
]
});
}

// ========================================
// CREATE TEAM
// ========================================

if (
command === "create" &&
subcommand === "team"
) {

if (!isPOC(interaction.user.id)) {
return interaction.reply({
content:
"❌ Only the POC or Co-POC can create teams.",
ephemeral: true
});
}

const role =
interaction.options.getRole("role");

const manager =
interaction.options.getUser("manager");

const coManager =
interaction.options.getUser("comanager");

if (db.teams[role.id]) {
return interaction.reply({
content:
"❌ That team has already been created.",
ephemeral: true
});
}

db.teams[role.id] = {
roleId: role.id,
name: role.name,
managerId: manager.id,
coManagerId:
coManager ? coManager.id : null,
players: []
};

saveDB(db);

await giveTeamOwnerRole(
interaction,
manager.id
);

if (coManager) {
await giveTeamOwnerRole(
interaction,
coManager.id
);
}

return interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("🏆 Team Created")
.setDescription(
`**Team:** ${role}\n` +
`**Manager:** <@${manager.id}>\n` +
`**Co-Manager:** ${
coManager
? `<@${coManager.id}>`
: "None"
}\n\n` +
`👑 Team Owner role assigned automatically.`
)
.setTimestamp()
]
});
}

// ========================================
// SIGN
// ========================================

if (command === "sign") {

const player =
interaction.options.getUser("player");

let managerTeam = null;

for (
const teamId of Object.keys(db.teams)
) {

const team =
db.teams[teamId];

if (
team.managerId === interaction.user.id ||
team.coManagerId === interaction.user.id
) {
managerTeam = team;
break;
}
}

if (!managerTeam) {
return interaction.reply({
content:
"❌ You are not a manager or co-manager of a VVLL team.",
ephemeral: true
});
}

let currentTeam = null;

for (
const teamId of Object.keys(db.teams)
) {

const team =
db.teams[teamId];

if (
team.players.includes(player.id)
) {
currentTeam = team;
break;
}
}

if (currentTeam) {
return interaction.reply({
content:
`❌ <@${player.id}> is already signed to **${currentTeam.name}**.`,
ephemeral: true
});
}

if (db.pendingOffers[player.id]) {
return interaction.reply({
content:
"❌ That player already has a pending contract.",
ephemeral: true
});
}

const offerId =
`${interaction.user.id}-${player.id}-${Date.now()}`;

db.pendingOffers[player.id] = {
offerId,
playerId: player.id,
teamId: managerTeam.roleId,
teamName: managerTeam.name,
offeredBy: interaction.user.id
};

saveDB(db);

try {

const dm =
await player.createDM();

const embed =
new EmbedBuilder()
.setTitle("📝 VVLL Contract Offer")
.setDescription(
`**${managerTeam.name}** wants to sign you.\n\nDo you accept this contract?`
)
.addFields({
name: "🏆 Team",
value: managerTeam.name
})
.setTimestamp();

const row =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId(
`contract_accept_${offerId}`
)
.setLabel("Accept")
.setEmoji("✅")
.setStyle(
ButtonStyle.Success
),

new ButtonBuilder()
.setCustomId(
`contract_decline_${offerId}`
)
.setLabel("Decline")
.setEmoji("❌")
.setStyle(
ButtonStyle.Danger
)
);

await dm.send({
embeds: [embed],
components: [row]
});

} catch (error) {

delete db.pendingOffers[player.id];

saveDB(db);

return interaction.reply({
content:
`❌ I couldn't DM <@${player.id}>.`,
ephemeral: true
});
}

return interaction.reply({
content:
`📨 Contract sent to <@${player.id}> for **${managerTeam.name}**.`
});
}

// ========================================
// RELEASE PLAYER
// ========================================

if (
command === "release" &&
subcommand === "player"
) {

const player =
interaction.options.getUser("player");

let teamFound = null;

for (
const teamId of Object.keys(db.teams)
) {

const team =
db.teams[teamId];

if (
team.players.includes(player.id)
) {
teamFound = team;
break;
}
}

if (!teamFound) {
return interaction.reply({
content:
"❌ That player is not on a VVLL team.",
ephemeral: true
});
}

if (
interaction.user.id !== teamFound.managerId &&
interaction.user.id !== teamFound.coManagerId
) {
return interaction.reply({
content:
"❌ You can only release players from your own team.",
ephemeral: true
});
}

teamFound.players =
teamFound.players.filter(
id => id !== player.id
);

delete db.players[player.id];

saveDB(db);

try {

const member =
await interaction.guild.members.fetch(
player.id
);

if (
member.roles.cache.has(
teamFound.roleId
)
) {
await member.roles.remove(
teamFound.roleId
);
}

} catch (error) {

console.error(
"Could not remove team role:",
error.message
);
}

return interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("📤 Player Released")
.setDescription(
`<@${player.id}> has been released from **${teamFound.name}**.`
)
.setTimestamp()
]
});
}

// ========================================
// VIEW ROSTER
// ========================================

if (
command === "view" &&
subcommand === "roster"
) {

const role =
interaction.options.getRole("team");

const team =
db.teams[role.id];

if (!team) {
return interaction.reply({
content:
"❌ That team has not been created.",
ephemeral: true
});
}

const players =
team.players.length
? team.players
.map(
(id, index) =>
`${index + 1}. <@${id}>`
)
.join("\n")
: "No players signed.";

return interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle(
`🏆 ${team.name} Roster`
)
.addFields(
{
name: "👑 Manager",
value:
`<@${team.managerId}>`,
inline: true
},
{
name: "⭐ Co-Manager",
value:
team.coManagerId
? `<@${team.coManagerId}>`
: "None",
inline: true
},
{
name:
`👥 Players (${team.players.length})`,
value: players
}
)
.setTimestamp()
]
});
}

// ========================================
// VIEW LEAGUE
// ========================================

if (
command === "view" &&
subcommand === "league"
) {

const teams =
Object.values(db.teams);

if (!teams.length) {
return interaction.reply({
content:
"🏆 No teams have been created yet."
});
}

const embed =
new EmbedBuilder()
.setTitle("🏆 VVLL League")
.setDescription(
`**${teams.length} teams registered**`
)
.setTimestamp();

for (const team of teams) {

embed.addFields({
name:
`🏟️ ${team.name}`,

value:
`👑 **Manager:** <@${team.managerId}>\n` +
`⭐ **Co-Manager:** ${
team.coManagerId
? `<@${team.coManagerId}>`
: "None"
}\n` +
`👥 **Players:** ${team.players.length}`
});
}

return interaction.reply({
embeds: [embed]
});
}

// ========================================
// CREATE GAME
// ========================================

if (
command === "create" &&
subcommand === "game"
) {

if (!isPOC(interaction.user.id)) {
return interaction.reply({
content:
"❌ Only the POC or Co-POC can create games.",
ephemeral: true
});
}

const team1 =
interaction.options.getRole("team1");

const team2 =
interaction.options.getRole("team2");

const time =
interaction.options.getString("time");

const standing =
interaction.options.getString("standing");

const format =
interaction.options.getString("format");

if (
!db.teams[team1.id] ||
!db.teams[team2.id]
) {
return interaction.reply({
content:
"❌ Both teams must already be created.",
ephemeral: true
});
}

if (team1.id === team2.id) {
return interaction.reply({
content:
"❌ A team cannot play itself.",
ephemeral: true
});
}

const gameId =
Date.now().toString();

db.games[gameId] = {
team1: team1.id,
team2: team2.id,
time,
standing,
format
};

saveDB(db);

return interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("⚽ VVLL Game Created")
.addFields(
{
name: "Teams",
value:
`${team1} vs ${team2}`
},
{
name: "🕐 Time",
value: time,
inline: true
},
{
name: "🏆 Standing",
value: standing,
inline: true
},
{
name: "📋 Format",
value: format,
inline: true
}
)
.setTimestamp()
]
});
}

// ========================================
// GIVE STATS
// ========================================

if (
command === "give" &&
subcommand === "stats"
) {

if (!isPOC(interaction.user.id)) {
return interaction.reply({
content:
"❌ Only the POC or Co-POC can give stats.",
ephemeral: true
});
}

const player =
interaction.options.getUser("player");

const goals =
interaction.options.getInteger("goals");

const assists =
interaction.options.getInteger("assists");

const saves =
interaction.options.getInteger("saves");

if (!db.stats[player.id]) {
db.stats[player.id] = {
goals: 0,
assists: 0,
saves: 0
};
}

db.stats[player.id].goals += goals;
db.stats[player.id].assists += assists;
db.stats[player.id].saves += saves;

saveDB(db);

return interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("📊 Stats Updated")
.setDescription(
`<@${player.id}>`
)
.addFields(
{
name: "⚽ Goals",
value: `+${goals}`,
inline: true
},
{
name: "🎯 Assists",
value: `+${assists}`,
inline: true
},
{
name: "🧤 Saves",
value: `+${saves}`,
inline: true
}
)
.setTimestamp()
]
});
}

// ========================================
// CHECK STATS
// ========================================

if (
command === "check" &&
subcommand === "stats"
) {

const selected =
interaction.options.getUser("player");

const player =
selected || interaction.user;

const stats =
db.stats[player.id] || {
goals: 0,
assists: 0,
saves: 0
};

return interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("📊 Player Stats")
.setDescription(
`<@${player.id}>`
)
.addFields(
{
name: "⚽ Goals",
value: `${stats.goals}`,
inline: true
},
{
name: "🎯 Assists",
value: `${stats.assists}`,
inline: true
},
{
name: "🧤 Saves",
value: `${stats.saves}`,
inline: true
}
)
.setTimestamp()
]
});
}

// ========================================
// CHANGE MANAGER
// ========================================

if (
command === "change" &&
subcommand === "manager"
) {

if (!isPOC(interaction.user.id)) {
return interaction.reply({
content:
"❌ Only the POC or Co-POC can change managers.",
ephemeral: true
});
}

const role =
interaction.options.getRole("team");

const newManager =
interaction.options.getUser("manager");

const newCoManager =
interaction.options.getUser("comanager");

const team =
db.teams[role.id];

if (!team) {
return interaction.reply({
content:
"❌ That team has not been created.",
ephemeral: true
});
}

const oldManager =
team.managerId;

const oldCoManager =
team.coManagerId;

if (
oldManager &&
oldManager !== newManager.id &&
oldManager !== newCoManager?.id
) {
await removeTeamOwnerRole(
interaction,
oldManager
);
}

if (
oldCoManager &&
oldCoManager !== newManager.id &&
oldCoManager !== newCoManager?.id &&
oldCoManager !== oldManager
) {
await removeTeamOwnerRole(
interaction,
oldCoManager
);
}

team.managerId =
newManager.id;

team.coManagerId =
newCoManager
? newCoManager.id
: null;

saveDB(db);

await giveTeamOwnerRole(
interaction,
newManager.id
);

if (newCoManager) {
await giveTeamOwnerRole(
interaction,
newCoManager.id
);
}

return interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle(
"👑 Management Updated"
)
.setDescription(
`**Team:** ${role}\n\n` +
`👑 **Manager:** <@${newManager.id}>\n` +
`⭐ **Co-Manager:** ${
newCoManager
? `<@${newCoManager.id}>`
: "None"
}\n\n` +
`The Team Owner role has been updated automatically.`
)
.setTimestamp()
]
});
}

// ========================================
// DELETE TEAM
// ========================================

if (
command === "delete" &&
subcommand === "team"
) {

if (!isPOC(interaction.user.id)) {
return interaction.reply({
content:
"❌ Only the POC or Co-POC can delete teams.",
ephemeral: true
});
}

const role =
interaction.options.getRole("team");

const team =
db.teams[role.id];

if (!team) {
return interaction.reply({
content:
"❌ That team does not exist.",
ephemeral: true
});
}

if (team.managerId) {
await removeTeamOwnerRole(
interaction,
team.managerId
);
}

if (
team.coManagerId &&
team.coManagerId !== team.managerId
) {
await removeTeamOwnerRole(
interaction,
team.coManagerId
);
}

delete db.teams[role.id];

saveDB(db);

return interaction.reply({
embeds: [
new EmbedBuilder()
.setTitle("🗑️ Team Deleted")
.setDescription(
`${role} has been removed from VVLL.`
)
.setTimestamp()
]
});
}
}

// ==========================================
// EXPORT
// ==========================================

module.exports = {
commands,
handleCommand
};

