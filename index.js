const {
    Client,
    GatewayIntentBits,
    REST,
    Routes
} = require("discord.js");

const {
    commands,
    handleCommand,
    handleButton
} = require("./commands");

// ===============================
// RAILWAY VARIABLES
// ===============================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// ===============================
// CHECK VARIABLES
// ===============================

if (!TOKEN) {
    console.error("❌ DISCORD_TOKEN is missing!");
    process.exit(1);
}

if (!CLIENT_ID) {
    console.error("❌ CLIENT_ID is missing!");
    process.exit(1);
}

if (!GUILD_ID) {
    console.error("❌ GUILD_ID is missing!");
    process.exit(1);
}

// ===============================
// DISCORD CLIENT
// ===============================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

// ===============================
// REGISTER COMMANDS
// ===============================

async function registerCommands() {
    try {
        console.log("🧹 Registering commands...");

        const rest = new REST({
            version: "10"
        }).setToken(TOKEN);

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

        console.log("✅ Commands registered!");
    } catch (error) {
        console.error(
            "❌ Command registration failed:",
            error
        );
    }
}

// ===============================
// INTERACTIONS
// ===============================

client.on("interactionCreate", async interaction => {
    try {

        if (interaction.isChatInputCommand()) {
            await handleCommand(interaction);
            return;
        }

        if (interaction.isButton()) {
            await handleButton(interaction);
            return;
        }

    } catch (error) {

        console.error(
            "❌ Interaction error:",
            error
        );

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
                "❌ Error sending response:",
                replyError
            );
        }
    }
});

// ===============================
// BOT READY
// ===============================

client.once("clientReady", () => {

    console.log(
        `✅ ${client.user.tag} is online!`
    );

    const guild =
        client.guilds.cache.get(GUILD_ID);

    if (guild) {
        console.log(
            `🏆 Connected to: ${guild.name}`
        );
    } else {
        console.log(
            "⚠️ Bot is not in the configured server."
        );
    }
});

// ===============================
// START
// ===============================

async function startBot() {

    console.log("🚀 Starting bot...");

    await registerCommands();

    console.log("🔌 Connecting to Discord...");

    await client.login(TOKEN);
}

startBot();