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

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    console.error("❌ Missing Railway variables!");
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

client.once("clientReady", async () => {

    console.log(`✅ ${client.user.tag} is online!`);

    const guild = client.guilds.cache.get(GUILD_ID);

    if (!guild) {
        console.error("❌ Bot is NOT in the GUILD_ID server!");
        return;
    }

    console.log(`🏆 Connected to: ${guild.name}`);

    try {

        const rest = new REST({
            version: "10"
        }).setToken(TOKEN);

        console.log(
            `🧹 Registering ${commands.length} commands...`
        );

        const registered = await rest.put(
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
            `✅ Discord registered ${registered.length} commands!`
        );

        console.log(
            "📋 Commands:"
        );

        for (const command of registered) {
            console.log(`   /${command.name}`);
        }

    } catch (error) {

        console.error(
            "❌ COMMAND REGISTRATION ERROR:"
        );

        console.error(error);
    }
});

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

        console.error("❌ Interaction error:", error);

        try {

            if (
                interaction.replied ||
                interaction.deferred
            ) {
                await interaction.followUp({
                    content: "❌ Something went wrong.",
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: "❌ Something went wrong.",
                    ephemeral: true
                });
            }

        } catch {}
    }
});

console.log("🚀 Starting bot...");

client.login(TOKEN).catch(error => {
    console.error("❌ Discord login failed:");
    console.error(error);
});