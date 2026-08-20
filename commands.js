const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const fs = require("fs");

const DB_FILE = "./database.json";

// ==========================================
// FRIEND'S LEAGUE CONFIG
// ==========================================

const POC_ID = "1410380405089239115";

const TEAM_OWNER_ROLE_ID =
    "1539809139394478121";

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
            pendingOffers: {}
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

    return db;
}

function saveDB(db) {
    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(db, null, 2)
    );
}

function isPOC(userId) {
    return userId === POC_ID;
}

// ==========================================
// TEAM OWNER ROLE
// ==========================================

async function giveOwnerRole(interaction, userId) {
    try {
        const member =
            await interaction.guild.members.fetch(userId);

        const role =
            interaction.guild.roles.cache.get(
                TEAM_OWNER_ROLE_ID
            );

        if (!role) {
            console.log(
                "⚠️ Team Owner role was not found."
            );
            return;
        }

        if (!member.roles.cache.has(role.id)) {
            await member.roles.add(role);
        }

    } catch (error) {
        console.error(
            "❌ Could not give Team Owner role:",
            error.message
        );
    }
}

async function removeOwnerRole(interaction, userId) {
    if (!userId) return;

    try {
        const member =
            await interaction.guild.members.fetch(userId);

        const role =
            interaction.guild.roles.cache.get(
                TEAM_OWNER_ROLE_ID
            );

        if (
            role &&
            member.roles.cache.has(role.id)
        ) {
            await member.roles.remove(role);
        }

    } catch (error) {
        console.error(
            "❌ Could not remove Team Owner role:",
            error.message
        );
    }
}

// ==========================================
// COMMANDS
// ==========================================

const commands = [

    // ======================================
    // CREATE
    // ======================================

    new SlashCommandBuilder()
        .setName("create")
        .setDescription("Create league information")

        .addSubcommand(sub =>
            sub
                .setName("team")
                .setDescription("Create a team")

                .addRoleOption(option =>
                    option
                        .setName("role")
                        .setDescription("Team role")
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
                .setDescription("Create a game")

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
                        .setDescription("Tournament standing")
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

    // ======================================
    // SIGN
    // ======================================

    new SlashCommandBuilder()
        .setName("sign")
        .setDescription("Send a contract to a player")

        .addUserOption(option =>
            option
                .setName("player")
                .setDescription("Player to sign")
                .setRequired(true)
        ),

    // ======================================
    // RELEASE
    // ======================================

    new SlashCommandBuilder()
        .setName("release")
        .setDescription("Release a player")

        .addSubcommand(sub =>
            sub
                .setName("player")
                .setDescription("Release a player from your team")

                .addUserOption(option =>
                    option
                        .setName("player")
                        .setDescription("Player")
                        .setRequired(true)
                )
        ),

    // ======================================
    // VIEW
    // ======================================

    new SlashCommandBuilder()
        .setName("view")
        .setDescription("View league information")

        .addSubcommand(sub =>
            sub
                .setName("roster")
                .setDescription("View a team roster")

                .addRoleOption(option =>
                    option
                        .setName("team")
                        .setDescription("Team")
                        .setRequired(true)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName("league")
                .setDescription("View all teams")
        ),

    // ======================================
    // GIVE STATS
    // ======================================

    new SlashCommandBuilder()
        .setName("give")
        .setDescription("Give player statistics")

        .addSubcommand(sub =>
            sub
                .setName("stats")
                .setDescription("Give stats")

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

    // ======================================
    // CHECK STATS
    // ======================================

    new SlashCommandBuilder()
        .setName("check")
        .setDescription("Check information")

        .addSubcommand(sub =>
            sub
                .setName("stats")
                .setDescription("Check player stats")

                .addUserOption(option =>
                    option
                        .setName("player")
                        .setDescription("Optional player")
                        .setRequired(false)
                )
        ),

    // ======================================
    // CHANGE MANAGER
    // ======================================

    new SlashCommandBuilder()
        .setName("change")
        .setDescription("Change team management")

        .addSubcommand(sub =>
            sub
                .setName("manager")
                .setDescription("Change manager")

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

    // ======================================
    // DELETE TEAM
    // ======================================

    new SlashCommandBuilder()
        .setName("delete")
        .setDescription("Delete league information")

        .addSubcommand(sub =>
            sub
                .setName("team")
                .setDescription("Delete a team")

                .addRoleOption(option =>
                    option
                        .setName("team")
                        .setDescription("Team")
                        .setRequired(true)
                )
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

    // ======================================
    // CREATE TEAM
    // ======================================

    if (
        command === "create" &&
        subcommand === "team"
    ) {

        if (!isPOC(interaction.user.id)) {
            return interaction.reply({
                content:
                    "❌ Only the POC can create teams.",
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
                    "❌ That team already exists.",
                ephemeral: true
            });
        }

        db.teams[role.id] = {
            roleId: role.id,
            name: role.name,
            managerId: manager.id,
            coManagerId:
                coManager?.id || null,
            players: []
        };

        saveDB(db);

        await giveOwnerRole(
            interaction,
            manager.id
        );

        if (coManager) {
            await giveOwnerRole(
                interaction,
                coManager.id
            );
        }

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🏆 Team Created")
                    .setDescription(
                        `${role}\n\n` +
                        `👑 Manager: <@${manager.id}>\n` +
                        `⭐ Co-Manager: ${
                            coManager
                                ? `<@${coManager.id}>`
                                : "None"
                        }\n\n` +
                        `The Team Owner role was automatically assigned.`
                    )
                    .setTimestamp()
            ]
        });
    }

    // ======================================
    // SIGN
    // ======================================

    if (command === "sign") {

        const player =
            interaction.options.getUser("player");

        let team = null;

        for (const teamId of Object.keys(db.teams)) {

            const current =
                db.teams[teamId];

            if (
                current.managerId === interaction.user.id ||
                current.coManagerId === interaction.user.id
            ) {
                team = current;
                break;
            }
        }

        if (!team) {
            return interaction.reply({
                content:
                    "❌ You are not a manager or co-manager.",
                ephemeral: true
            });
        }

        for (const teamId of Object.keys(db.teams)) {

            if (
                db.teams[teamId].players
                    .includes(player.id)
            ) {
                return interaction.reply({
                    content:
                        "❌ That player is already signed to a team.",
                    ephemeral: true
                });
            }
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
            teamId: team.roleId,
            teamName: team.name
        };

        saveDB(db);

        try {

            const dm =
                await player.createDM();

            const embed =
                new EmbedBuilder()
                    .setTitle("📝 Contract Offer")
                    .setDescription(
                        `**${team.name}** wants to sign you.\n\n` +
                        `Do you accept this contract?`
                    )
                    .addFields({
                        name: "🏆 Team",
                        value: team.name
                    })
                    .setTimestamp();

            const buttons =
                new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId(
                                `accept_${offerId}`
                            )
                            .setLabel("Accept")
                            .setEmoji("✅")
                            .setStyle(
                                ButtonStyle.Success
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `decline_${offerId}`
                            )
                            .setLabel("Decline")
                            .setEmoji("❌")
                            .setStyle(
                                ButtonStyle.Danger
                            )
                    );

            await dm.send({
                embeds: [embed],
                components: [buttons]
            });

        } catch (error) {

            delete db.pendingOffers[player.id];

            saveDB(db);

            return interaction.reply({
                content:
                    "❌ I couldn't DM that player.",
                ephemeral: true
            });
        }

        return interaction.reply({
            content:
                `📨 Contract sent to <@${player.id}> for **${team.name}**.`
        });
    }

    // ======================================
    // RELEASE PLAYER
    // ======================================

    if (
        command === "release" &&
        subcommand === "player"
    ) {

        const player =
            interaction.options.getUser("player");

        let team = null;

        for (const teamId of Object.keys(db.teams)) {

            const current =
                db.teams[teamId];

            if (
                current.players.includes(player.id)
            ) {
                team = current;
                break;
            }
        }

        if (!team) {
            return interaction.reply({
                content:
                    "❌ That player is not on a team.",
                ephemeral: true
            });
        }

        if (
            interaction.user.id !== team.managerId &&
            interaction.user.id !== team.coManagerId
        ) {
            return interaction.reply({
                content:
                    "❌ You can only release players from your own team.",
                ephemeral: true
            });
        }

        team.players =
            team.players.filter(
                id => id !== player.id
            );

        delete db.players[player.id];

        saveDB(db);

        try {

            const member =
                await interaction.guild.members.fetch(
                    player.id
                );

            const role =
                interaction.guild.roles.cache.get(
                    team.roleId
                );

            if (
                role &&
                member.roles.cache.has(role.id)
            ) {
                await member.roles.remove(role);
            }

        } catch (error) {
            console.error(
                "❌ Could not remove team role:",
                error.message
            );
        }

        return interaction.reply({
            content:
                `📤 <@${player.id}> was released from **${team.name}**.`
        });
    }

    // ======================================
    // VIEW ROSTER
    // ======================================

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
                    "❌ That team does not exist.",
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
                                `<@${team.managerId}>`
                        },
                        {
                            name: "⭐ Co-Manager",
                            value:
                                team.coManagerId
                                    ? `<@${team.coManagerId}>`
                                    : "None"
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

    // ======================================
    // VIEW LEAGUE
    // ======================================

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
                .setTitle("🏆 League")
                .setDescription(
                    `${teams.length} teams registered`
                )
                .setTimestamp();

        for (const team of teams) {

            embed.addFields({
                name:
                    `🏟️ ${team.name}`,

                value:
                    `👑 Manager: <@${team.managerId}>\n` +
                    `⭐ Co-Manager: ${
                        team.coManagerId
                            ? `<@${team.coManagerId}>`
                            : "None"
                    }\n` +
                    `👥 Players: ${team.players.length}`
            });
        }

        return interaction.reply({
            embeds: [embed]
        });
    }

    // ======================================
    // CREATE GAME
    // ======================================

    if (
        command === "create" &&
        subcommand === "game"
    ) {

        if (!isPOC(interaction.user.id)) {
            return interaction.reply({
                content:
                    "❌ Only the POC can create games.",
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
                    "❌ Both teams must already exist.",
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
                    .setTitle("⚽ Game Created")
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

    // ======================================
    // GIVE STATS
    // ======================================

    if (
        command === "give" &&
        subcommand === "stats"
    ) {

        if (!isPOC(interaction.user.id)) {
            return interaction.reply({
                content:
                    "❌ Only the POC can give stats.",
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
            content:
                `📊 Stats updated for <@${player.id}>!\n` +
                `⚽ Goals: +${goals}\n` +
                `🎯 Assists: +${assists}\n` +
                `🧤 Saves: +${saves}`
        });
    }

    // ======================================
    // CHECK STATS
    // ======================================

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
                            value:
                                `${stats.goals}`,
                            inline: true
                        },
                        {
                            name: "🎯 Assists",
                            value:
                                `${stats.assists}`,
                            inline: true
                        },
                        {
                            name: "🧤 Saves",
                            value:
                                `${stats.saves}`,
                            inline: true
                        }
                    )
                    .setTimestamp()
            ]
        });
    }

    // ======================================
    // CHANGE MANAGER
    // ======================================

    if (
        command === "change" &&
        subcommand === "manager"
    ) {

        if (!isPOC(interaction.user.id)) {
            return interaction.reply({
                content:
                    "❌ Only the POC can change managers.",
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
                    "❌ That team does not exist.",
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
            await removeOwnerRole(
                interaction,
                oldManager
            );
        }

        if (
            oldCoManager &&
            oldCoManager !== newManager.id &&
            oldCoManager !== newCoManager?.id
        ) {
            await removeOwnerRole(
                interaction,
                oldCoManager
            );
        }

        team.managerId =
            newManager.id;

        team.coManagerId =
            newCoManager?.id || null;

        saveDB(db);

        await giveOwnerRole(
            interaction,
            newManager.id
        );

        if (newCoManager) {
            await giveOwnerRole(
                interaction,
                newCoManager.id
            );
        }

        return interaction.reply({
            content:
                `👑 **${team.name}** management updated!\n\n` +
                `Manager: <@${newManager.id}>\n` +
                `Co-Manager: ${
                    newCoManager
                        ? `<@${newCoManager.id}>`
                        : "None"
                }`
        });
    }

    // ======================================
    // DELETE TEAM
    // ======================================

    if (
        command === "delete" &&
        subcommand === "team"
    ) {

        if (!isPOC(interaction.user.id)) {
            return interaction.reply({
                content:
                    "❌ Only the POC can delete teams.",
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

        await removeOwnerRole(
            interaction,
            team.managerId
        );

        if (
            team.coManagerId &&
            team.coManagerId !== team.managerId
        ) {
            await removeOwnerRole(
                interaction,
                team.coManagerId
            );
        }

        delete db.teams[role.id];

        saveDB(db);

        return interaction.reply({
            content:
                `🗑️ **${team.name}** has been deleted.`
        });
    }
}

// ==========================================
// BUTTON HANDLER
// ==========================================

async function handleButton(interaction) {

    const db = loadDB();

    const customId =
        interaction.customId;

    // ======================================
    // ACCEPT CONTRACT
    // ======================================

    if (customId.startsWith("accept_")) {

        const offerId =
            customId.replace("accept_", "");

        const playerId =
            interaction.user.id;

        const offer =
            db.pendingOffers[playerId];

        if (
            !offer ||
            offer.offerId !== offerId
        ) {
            return interaction.reply({
                content:
                    "❌ This contract is no longer valid.",
                ephemeral: true
            });
        }

        const team =
            db.teams[offer.teamId];

        if (!team) {

            delete db.pendingOffers[playerId];

            saveDB(db);

            return interaction.reply({
                content:
                    "❌ This team no longer exists.",
                ephemeral: true
            });
        }

        // Make sure player isn't already signed
        for (const teamId of Object.keys(db.teams)) {

            if (
                db.teams[teamId].players
                    .includes(playerId)
            ) {

                delete db.pendingOffers[playerId];

                saveDB(db);

                return interaction.reply({
                    content:
                        "❌ You are already signed to a team.",
                    ephemeral: true
                });
            }
        }

        team.players.push(playerId);

        db.players[playerId] = {
            teamId: team.roleId
        };

        delete db.pendingOffers[playerId];

        saveDB(db);

        // Give team role
        try {

            const guild =
                interaction.client.guilds.cache.first();

            const member =
                await guild.members.fetch(
                    playerId
                );

            const role =
                guild.roles.cache.get(
                    team.roleId
                );

            if (role) {
                await member.roles.add(role);
            }

        } catch (error) {

            console.error(
                "❌ Could not give team role:",
                error.message
            );
        }

        await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle("✅ Contract Accepted")
                    .setDescription(
                        `You are now signed to **${team.name}**!`
                    )
                    .setTimestamp()
            ],
            components: []
        });

        return;
    }

    // ======================================
    // DECLINE CONTRACT
    // ======================================

    if (customId.startsWith("decline_")) {

        const offerId =
            customId.replace("decline_", "");

        const playerId =
            interaction.user.id;

        const offer =
            db.pendingOffers[playerId];

        if (
            !offer ||
            offer.offerId !== offerId
        ) {
            return interaction.reply({
                content:
                    "❌ This contract is no longer valid.",
                ephemeral: true
            });
        }

        delete db.pendingOffers[playerId];

        saveDB(db);

        await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle("❌ Contract Declined")
                    .setDescription(
                        "You declined the contract offer."
                    )
                    .setTimestamp()
            ],
            components: []
        });

        return;
    }
}

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    commands,
    handleCommand,
    handleButton
};