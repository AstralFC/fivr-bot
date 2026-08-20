const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");

const { commands, handleCommand } = require("./commands");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const DB_FILE = "./database.json";

function loadDB() {
    if (!fs.existsSync(DB_FILE)) {
        return {
            teams: {},
            players: {},
            games: {},
            stats: {},
            pendingOffers: {},
            settings: { season: 1 }
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

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

// ==========================================
// REGISTER COMMANDS
// ==========================================

async function registerCommands() {

    if (!TOKEN) {
        throw new Error("TOKEN is missing.");
    }

    if (!CLIENT_ID) {
        throw new Error("CLIENT_ID is missing.");
    }

    if (!GUILD_ID) {
        throw new Error("GUILD_ID is missing.");
    }

    const rest = new REST({
        version: "10"
    }).setToken(TOKEN);

    console.log("🧹 Removing old global commands...");

    try {
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: [] }
        );

        console.log("✅ Old global commands removed.");
    } catch (error) {
        console.log(
            "⚠️ Global command cleanup failed:",
            error.message
        );
    }

    console.log("🧹 Removing old server commands...");

    await rest.put(
        Routes.applicationGuildCommands(
            CLIENT_ID,
            GUILD_ID
        ),
        { body: [] }
    );

    console.log("✅ Old server commands removed.");

    console.log("📋 Registering new VVLL commands...");

    await rest.put(
        Routes.applicationGuildCommands(
            CLIENT_ID,
            GUILD_ID
        ),
        {
            body: commands.map(command =>
                command.toJSON()
            )
        }
    );

    console.log(
        `✅ Registered ${commands.length} VVLL commands.`
    );
}

// ==========================================
// BOT READY
// ==========================================

client.once("ready", () => {

    console.log(
        `✅ VVLL Bot is online as ${client.user.tag}`
    );

    console.log(
        `🏆 VVLL is connected to server: ${GUILD_ID}`
    );
});

// ==========================================
// INTERACTIONS
// ==========================================

client.on("interactionCreate", async interaction => {

    try {

        // ======================================
        // SLASH COMMANDS
        // ======================================

        if (interaction.isChatInputCommand()) {

            await handleCommand(interaction);

            return;
        }

        // ======================================
        // BUTTONS
        // ======================================

        if (!interaction.isButton()) {
            return;
        }

        const customId = interaction.customId;

        const isAccept =
            customId.startsWith("contract_accept_");

        const isDecline =
            customId.startsWith("contract_decline_");

        if (!isAccept && !isDecline) {
            return;
        }

        const prefix = isAccept
            ? "contract_accept_"
            : "contract_decline_";

        const offerId =
            customId.substring(prefix.length);

        const db = loadDB();

        // ======================================
        // FIND CONTRACT
        // ======================================

        let offer = null;
        let playerId = null;

        for (const id of Object.keys(db.pendingOffers)) {

            const possible =
                db.pendingOffers[id];

            if (
                possible &&
                possible.offerId === offerId
            ) {
                offer = possible;
                playerId = id;
                break;
            }
        }

        if (!offer) {

            await interaction.reply({
                content:
                    "❌ This contract offer is no longer valid.",
                ephemeral: true
            });

            return;
        }

        // ======================================
        // MAKE SURE CORRECT PLAYER CLICKED
        // ======================================

        if (interaction.user.id !== playerId) {

            await interaction.reply({
                content:
                    "❌ This contract isn't for you.",
                ephemeral: true
            });

            return;
        }

        // ======================================
        // DECLINE
        // ======================================

        if (isDecline) {

            delete db.pendingOffers[playerId];

            saveDB(db);

            const embed =
                new EmbedBuilder()
                    .setTitle("❌ Contract Declined")
                    .setDescription(
                        `You declined the contract offer from **${offer.teamName}**.`
                    )
                    .setTimestamp();

            await interaction.update({
                embeds: [embed],
                components: []
            });

            try {

                const manager =
                    await client.users.fetch(
                        offer.offeredBy
                    );

                await manager.send(
                    `❌ <@${playerId}> declined your contract offer for **${offer.teamName}**.`
                );

            } catch (error) {

                console.log(
                    "⚠️ Could not DM manager."
                );
            }

            return;
        }

        // ======================================
        // ACCEPT
        // ======================================

        const team =
            db.teams[offer.teamId];

        if (!team) {

            delete db.pendingOffers[playerId];

            saveDB(db);

            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("❌ Contract Expired")
                        .setDescription(
                            "That team no longer exists."
                        )
                        .setTimestamp()
                ],
                components: []
            });

            return;
        }

        // ======================================
        // CHECK IF PLAYER JOINED ANOTHER TEAM
        // ======================================

        let existingTeam = null;

        for (const teamId of Object.keys(db.teams)) {

            const otherTeam =
                db.teams[teamId];

            if (
                otherTeam.players.includes(
                    playerId
                )
            ) {
                existingTeam = otherTeam;
                break;
            }
        }

        if (existingTeam) {

            delete db.pendingOffers[playerId];

            saveDB(db);

            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("❌ Contract Failed")
                        .setDescription(
                            `You are already signed to **${existingTeam.name}**.`
                        )
                        .setTimestamp()
                ],
                components: []
            });

            return;
        }

        // ======================================
        // ADD PLAYER
        // ======================================

        if (!team.players.includes(playerId)) {
            team.players.push(playerId);
        }
// Give the player the team's Discord role
try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(playerId);
    const teamRole = await guild.roles.fetch(team.roleId);

    if (teamRole && !member.roles.cache.has(teamRole.id)) {
        await member.roles.add(teamRole);
        console.log(
            `✅ Gave ${playerId} the ${team.name} role.`
        );
    }
} catch (error) {
    console.error(
        "❌ Could not give team role:",
        error.message
    );
}
        db.players[playerId] = {
            id: playerId,
            teamId: team.roleId
        };

        delete db.pendingOffers[playerId];

        saveDB(db);

        // ======================================
        // PLAYER CONFIRMATION
        // ======================================

        await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle("✅ Contract Accepted")
                    .setDescription(
                        `You have officially joined **${team.name}**!`
                    )
                    .addFields({
                        name: "🏆 Team",
                        value: team.name
                    })
                    .setTimestamp()
            ],
            components: []
        });

        // ======================================
        // MANAGER NOTIFICATION
        // ======================================

        try {

            const manager =
                await client.users.fetch(
                    offer.offeredBy
                );

            await manager.send(
                `✅ <@${playerId}> accepted your contract offer and joined **${team.name}**!`
            );

        } catch (error) {

            console.log(
                "⚠️ Could not DM manager."
            );
        }

    } catch (error) {

        console.error(
            "❌ Interaction error:"
        );

        console.error(error);

        try {

            if (
                interaction.replied ||
                interaction.deferred
            ) {

                await interaction.followUp({
                    content:
                        "❌ Something went wrong.",
                    ephemeral: true
                });

            } else {

                await interaction.reply({
                    content:
                        "❌ Something went wrong.",
                    ephemeral: true
                });
            }

        } catch (replyError) {

            console.error(
                "❌ Could not send error response."
            );
        }
    }
});

// ==========================================
// START
// ==========================================

async function startBot() {

    console.log("🚀 Starting VVLL Bot...");

    await registerCommands();

    console.log("🔌 Connecting to Discord...");

    await client.login(TOKEN);
}

startBot().catch(error => {

    console.error(
        "❌ VVLL Bot failed to start:"
    );

    console.error(error);

    process.exit(1);
});