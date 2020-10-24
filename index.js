const { Client, Util, MessageEmbed, MessageAttachment } = require("discord.js");
const client = new Client({
  disableMentions: "all"
});
require("./server.js");
const figlet = require("figlet");
const settings = require("cluster");
var exito_color = "#1BFF00";
const ms = require("ms");
const moment = require("moment");
require("moment-duration-format");
const soleno = require("solenolyrics");
const ILuck = require("discord.js");
const fetch = require("node-fetch");
const superagent = require("superagent");
const dimgs = require("discordimgs");
const megadb = require("megadb");
let canal_db = new megadb.crearDB("canal_db");
let prohibido = new megadb.crearDB("prohibidos");
let prefixes = new megadb.crearDB("prefix");
let bienvenidas = new megadb.crearDB("bienvenidas");
let randcode = require("rands-codes");
client.snipes = new Map();

/////////////////////////////////////////EVENTO READY////////////////////////////////////////////
client.on("ready", () => {
  console.log(`${client.user.tag} Está listo!`);
  let estados = [
    `t!help | ${client.guilds.cache.size} servers`,
    `t!help | ${client.users.cache.size} usuarios`,
    `t!help | ${
      client.channels.cache.filter(x => x.type !== "category").size
    } canales`
  ];
  let posicion = 0;
  setInterval(() => {
    if (posicion > estados.length - 1) posicion = 0;
    let estado = estados[posicion];
    client.user.setActivity(estado);
    posicion++;
  }, 10000);
});
/////////////////////////////////////////EVENTO MESSAGEDELETE///////////////////////////////////////
client.on("messageDelete", async message => {
  client.snipes.set(message.channel.id, {
    content: message.content,
    delete: message.author,
    canal: message.channel
  });
});
///////////////////////////////////////EVENTO MESSAGE////////////////////////////////////////////////
client.on("message", async message => {
  if (message.author.bot) return;
  if (message.channel.type === "dm")
    return message.channel.send("No uses comandos en MD!");
  let prefix = prefixes.tiene(message.guild.id) //si la db tiene un prefix
    ? await prefixes.obtener(message.guild.id) //lo obtiene
    : "t!";

  let command = message.content.toLowerCase().split(" ")[0];

  command = command.slice(prefix.length);

  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);

  if (message.content === `<@!${client.user.id}>`) {
    const hiembed = new MessageEmbed()
      .setTitle("Hey!")
      .setDescription(
        "Veo que me has mencionado, mi prefix aquí es **" +
          prefix +
          "**\n Usa " +
          prefix +
          "help para ver las categorías!"
      )
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setColor("YELLOW")
      .setTimestamp();
    message.channel.send(hiembed);
  }

  if (!message.content.startsWith(prefix)) return;

  if (command === "tos") {
    const tos = new MessageEmbed()
      .setTitle("Condiciones de servicio")
      .setDescription(
        `1. No spames mis comandos
No hagas spam de serverinfo o comandos que tengan embed largos, inundan el chat.

2. No menciones a mucha gente usando comandos.
Como userinfo, avatar, etc, eso molesta a la gente.

3. No intentes usar comandos que no puedes usar
Como eval, o blacklist, no lo intentes, no te servira.

4. No exageres cuando criticas
Si quieres dar tu opinion del bot, por favor no exageres diciendo que es una p_t_ m__rd_a o algo asi.

5. No spames bugreports
Cada vez que usas el comando **${prefix}bugreport**, le envío un MD a ! PEPE, mi creador, y si eso pasa repetidas veces, le va a molestar (Tenemos un registro de quien reporta)

6. Las sugerencias se aplican con esto ^^^^^^

7. ¿Que pasa si veo que estoy en la blacklist?
Seguro es porque rompiste alguna o más de las condiciones de servicio mencionadas anteriormente, pero, si crees que no fue así, que esperas? Envíale un MD a ! PEPE#0380, o [entra a mi server!](https://discord.gg/ayc6VZu) y mencionalo diciendo tu problema!

Saludos.
! PEPE#0380`
      )
      .setColor("#FF0000")
      .setTimestamp()
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/766376477704192003/768668424888516648/Prohibido.png"
      );
    message.channel.send(tos);
  }

  const ups = new MessageEmbed()
    .setTitle("Ups!")
    .setDescription(
      "Lo siento **" +
        message.author.username +
        "...**\nNo puedes usar mis comandos...\nRazón: Estas en la blacklist"
    )
    .setColor("#ff0000");
  if (prohibido.tiene(message.author.tag)) return message.channel.send(ups);

  ///////////////////////////////////////COMANDO SERVERINFO/////////////////////////////////////////
  if (command === "serverinfo") {
    const emojiList = message.guild.emojis.cache
      .map(emoji => emoji.toString())
      .join(" ");
    var server = message.guild;
    let guild = message.guild;
    let verifLevels = {
        NONE: "Ninguno",
        LOW: "Debe tener un correo verificado en discord",
        MEDIUM: "Debe estar registrado en Discord por más de 5 minutos.",
        HIGH: "Debe llevar en el servidor por más de 10 minutos",
        VERY_HIGH: "Debe tener un teléfono verificado en Discord"
      },
      region = {
        europe: "Europa :flag_eu:",
        brazil: "Brasil :flag_br: ",
        hongkong: "Hong Kong :flag_hk:",
        japan: "Japón :flag_jp:",
        russia: "Rusia :flag_ru:",
        singapore: "Singapur :flag_sg:",
        southafrica: "Sudáfrica :flag_za:",
        sydney: "Sydney :flag_au:",
        "us-central": "EE.UU Central :flag_us:",
        "us-east": " Este de EE.UU:flag_us:",
        "us-south": "Sur de EE.UU :flag_us:",
        "us-west": "Oeste de EE.UU :flag_us:",
        "vip-us-east": "VIP EE.UU Este :flag_us:",
        "eu-central": "Europa Central :flag_eu:",
        "eu-west": "Europa Oeste :flag_eu:",
        london: "London :flag_gb:",
        amsterdam: "Amsterdam :flag_nl:",
        india: "India :flag_in:"
      };
    const embed = new MessageEmbed()
      .setThumbnail(
        message.guild.iconURL({
          format: "png",
          dynamic: true,
          size: 4096
        })
      )
      .setAuthor(server.name, server.iconURL)
      .addField(
        "Creador:",
        "**" +
          server.owner.user.username +
          "#" +
          server.owner.user.discriminator +
          "**",
        true
      )
      .addField(
        "Creación",
        guild.createdAt.toDateString().split(" ")[2] +
          "/" +
          guild.createdAt.toDateString().split(" ")[1] +
          "/" +
          guild.createdAt.toDateString().split(" ")[3],
        true
      )
      .addField("ID:", server.id)
      .addField("Región:", `**${region[guild.region]}**`, true)
      .addField("Total de miembros:", server.memberCount, true)
      .addField(
        "<a:Online:762703254948675615> Conectados:",
        guild.members.cache.filter(o => o.presence.status === "online").size,
        true
      )
      .addField(
        "<:Idle:762703305696608276> Ausentes:",
        guild.members.cache.filter(o => o.presence.status === "idle").size,
        true
      )
      .addField(
        "<a:dnd:762703349907980358> No molestar:",
        guild.members.cache.filter(o => o.presence.status === "dnd").size,
        true
      )
      .addField(
        "<a:Offline:762703399652818965> Desconectados:",
        guild.members.cache.filter(o => o.presence.status === "offline").size,
        true
      )
      .addField(
        ":robot: Bots:",
        `${
          //Los bots
          message.guild.members.cache.filter(m => m.user.bot).size
        }`,
        true
      )
      .addField(
        ":bust_in_silhouette: Usuarios sin contar bots:",
        `${
          //Los usuarios en total.
          message.guild.memberCount -
            message.guild.members.cache.filter(m => m.user.bot).size
        }`,
        true
      )
      .addField(
        `Nivel de verificación`,
        `**${verifLevels[server.verificationLevel]}**`,
        false
      )
      .addField(
        "Canales en total:",
        server.channels.cache.filter(x => x.type !== "category").size,
        true
      )
      .addField(
        "Canales de texto",
        server.channels.cache.filter(x => x.type == "text").size,
        true
      )
      .addField(
        "Canales de voz",
        server.channels.cache.filter(x => x.type == "voice").size,
        true
      )
      .addField(
        "Categorías",
        server.channels.cache.filter(x => x.type == "category").size,
        true
      )
      .addField(`Número de roles`, server.roles.cache.size)
      .addField("Número de emojis", server.emojis.cache.size)
      .addField("Nivel de boost", server.premiumTier.toString(), true)
      .addField("Mejoras totales", server.premiumSubscriptionCount, true)
      .addField(
        "Canal por defecto",
        server.systemChannelID
          ? "<#" + server.systemChannelID + ">"
          : "Ninguno",
        true
      )
      .setColor(0xf7a7ff)
      .setFooter(
        "Tessirve?",
        "https://cdn.discordapp.com/emojis/767792922773946419.png"
      );
    message.channel.send(embed).catch(error => {
      console.error(error);
      message.channel.send("Error: " + error);
    });
  }
  //////////////////////////////////////////////COMANDO EVAL//////////////////////////////////////////////////////
  else if (command === "eval" || command === "e") {
    if (
      !["761404868460019732"] ||
      !["750351208556003409"].includes(message.author.id)
    )
      return message.channel.send("No estas autorizado a usar esto!");

    let limit = 1950;
    try {
      let code = args.slice(1).join(" ");
      let evalued = eval(code);
      if (typeof evalued !== "string")
        evalued = require("util").inspect(evalued);
      let txt = "" + evalued;

      if (txt.length > limit) {
        message.channel.send(txt);
      } else message.channel.send(txt);
    } catch (err) {
      message.channel.send("Error: " + err);
    }
  }

  /////////////////////////////////////////////COMANDO SAY////////////////////////////////////////////////
  else if (command === "say") {
    if (!message.member.permissions.has("MANAGE_MESSAGES"))
      return message.channel.send(
        "No tienes permisos de administrar mensajes!"
      );
    if (!args.slice(1).join(" ")) return message.channel.send("Di algo!");
    message.delete();
    message.channel.send(args.slice(1).join(" "));
  }
  //////////////////////////////////////////////COMANDO BAN////////////////////////////////////////////////
  else if (command === "ban") {
    if (["762599129443467294"].includes(message.guild.id))
      return message.channel.send(
        "Los comandos de moderación están deshabilitados en este server!"
      );
    if (!message.guild.me.permissions.has("BAN_MEMBERS")) {
      return message.channel.send(
        "Necesito el permiso de banear para continuar"
      );
    }

    if (!message.member.permissions.has("BAN_MEMBERS")) {
      return message.channel.send("No tienes el permiso siguiente: `Banear`.");
    }

    let persona =
      message.mentions.members.first() ||
      message.guild.members.resolve(args.slice(2).join(" "));

    if (!persona) {
      return message.channel.send("Debes mencionar a alguien o poner una ID!");
    } else if (!persona.bannable) {
      return message.channel.send(
        "Esa persona tiene un rol igual o más alto que el mío! :sweat:"
      );
    } else if (
      persona.roles.highest.comparePositionTo(message.member.roles.highest) > 0
    ) {
      return message.channel.send(
        "Esta persona esta en la misma o mayor nivel de jerarquia que tu, no puedes banearlo"
      );
    }

    var razon = args.slice(2).join(" ");
    if (!razon) {
      razon = "Razon no especificada";
    }

    var razon2 = `${message.author.tag}: ${razon}`;

    message.guild.members
      .ban(persona, {
        reason: razon2
      })
      .catch(e =>
        message.reply("Ocurrio un **error** desconocido, error: " + e)
      )
      .then(() => {
        message.channel.send({
          embed: {
            title: "Baneado con éxito! ✅",
            color: exito_color,
            fields: [
              {
                name: "Baneado:",
                value: `${persona.user.username}`,
                inline: true
              },
              {
                name: "Moderador:",
                value: `<@${message.author.id}>`,
                inline: true
              },
              {
                name: "Razón:",
                value: razon,
                inline: true
              }
            ]
          }
        });
      });
  }
  ///////////////////////////////////////////////////////////////COMANDO STATS//////////////////////////////////////
  else if (command === "stats") {
    const actividad = moment
      .duration(client.uptime)
      .format(" D [dias], H [horas], m [mins], s [segundos]");

    const statsembed = new MessageEmbed()
      .setColor(0x66ff66)

      .setAuthor(`Stats del bot`, client.user.displayAvatarURL())
      .addField(`Dueño`, `! PEPE#0380`, true)
      .addField(`Version`, `Beta 0.8.0`, true)
      .addField(`Libreria`, `Discord.js ^12.3.1`, true)
      .addField(
        `Memoria`,
        `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        true
      )
      .addField(`Tiempo en línea`, actividad, false)
      .addField(`Servidores`, client.guilds.cache.size, true)

      .addField(`Usuarios`, client.users.cache.size, true)
      .addField(
        `Canales`,
        client.channels.cache.filter(x => x.type !== "category").size,
        true
      )
      .addField("Ping:", Date.now() - message.createdTimestamp + "ms", true)
      .addField("Conecciones a voz", client.voice.connections.size, true);

    message.channel.send(statsembed);
  }
  ////////////////////////////////////////////////////////COMANDO HELP/////////////////////////////////////
  else if (command === "help") {
    if (args.slice(1).join(" ")) return;
    message.channel.send({
      embed: {
        title: "Hey " + message.author.username + "! Estos son mis comandos:",
        fields: [
          {
            name: prefix + "help",
            value: "Esto!",
            inline: true
          },
          {
            name: prefix + "moderation",
            value: ":no_entry: Muestra comandos de moderación",
            inline: true
          },
          {
            name: prefix + "fun",
            value: ":rofl: Muestra comandos divertidos",
            inline: true
          },
          {
            name: prefix + "info",
            value: ":information_source: Muestra comandos de info",
            inline: true
          },
          {
            name: prefix + "support",
            value: ":question: Muestra comandos de soporte",
            inline: true
          },
          {
            name: prefix + "music",
            value: ":musical_note: Muestra comandos de música.",
            inline: true
          },
          {
            name: prefix + "notes",
            value:
              ":pencil2: Soy un bot de texto, no? Pues aquí están las notas!",
            inline: true
          },
          {
            name: "IMPORTANTE",
            value:
              "Usa **" +
              prefix +
              "tos** para ver las condiciones de servicio, esto puede servirte si estas en la blacklist.",
            inline: false
          }
        ],
        color: exito_color
      }
    });
  }
  ////////////////////////////////////////////////COMANDO ASCII//////////////////////////////////////////////
  else if (command === "ascii") {
    let data = args.slice(1).join(" ");
    if (data.length > 15)
      return message.reply("Solo se permite hasta 15 carácteres.");
    if (!args.slice(1).join(" ")) return message.reply("Escribe algo.");
    figlet(args.slice(1).join(" "), (err, data) =>
      message.channel.send("``" + "`" + data + "`" + "``")
    );
  }
  ///////////////////////////////////////////////COMANDO HOWGAY//////////////////////////////////////////////
  else if (command === "howgay") {
    const gayembed = new MessageEmbed()
      .addField(
        `Porcentaje gay de ${message.author.username}`,
        `${message.author.username} Es **${Math.floor(
          100 * Math.random()
        )}%** gay :rainbow_flag:`
      )
      .setColor("#FF00FF");
    message.channel.send(gayembed);
  }
  /////////////////////////////////////////////////COMANDO 8BALL//////////////////////////////////////////
  else if (command === "8ball") {
    let rpts = [
      "Sí",
      "No",
      "Tal vez",
      "No sé",
      "No voy a responder eso",
      "Por supuesto",
      "Por supuesto que no",
      "No lo creo",
      "E?",
      "No estoy muy seguro"
    ];

    if (!args.slice(1).join(" ")) return message.reply(`Escriba una pregunta.`);
    message.channel.send({
      embed: {
        title: "8ball! :8ball:",
        description:
          "**Pregunta:** ```" +
          args.slice(1).join(" ") +
          "```\n Respuesta: ```" +
          rpts[Math.floor(Math.random() * rpts.length)] +
          "```",
        footer: `Pedido por ${message.author.username}`
      }
    });
  }
  ////////////////////////////////////////////COMANDO PING//////////////////////////////////////////////////////
  else if (command === "ping") {
    message.channel.send({
      embed: {
        title: "Pong!:ping_pong: ",
        description: `:speech_balloon: Ping Mensaje: **${Math.floor(
          Date.now() - message.createdTimestamp
        )}ms**
        :satellite: Ping DiscordAPI: **${client.ws.ping}ms**`,
        color: "RED"
      }
    });
  } else if (command === "invite") {
    message.channel.send({
      embed: {
        title: "Invitación",
        fields: [
          {
            name: ":inbox_tray: Invitarme",
            value:
              "Puedes invitarme usando [este enlace](https://discord.com/oauth2/authorize?client_id=763042495655313479&scope=bot&permissions=37088326)"
          }
        ],
        color: exito_color
      }
    });
  }
  ///////////////////////////////////////////////////////COMANDO SERVERICON/////////////////////////////////////////////////////////////
  else if (command === "servericon") {
    const thumb = message.guild.iconURL({
      format: "png",
      dynamic: true,
      size: 4096
    });
    if (!thumb) return message.channel.send("Este servidor no tiene ícono!");
    const serverembed = new MessageEmbed()
      .setColor("RANDOM")
      .setAuthor("Server icon: " + message.guild.name + "")
      .setImage(
        message.guild.iconURL({ format: "png", dynamic: true, size: 4096 })
      )
      .setDescription(
        `[Icono URL](${message.guild.iconURL({
          format: "png",
          dynamic: true,
          size: 4096
        })})`
      )
      .setTimestamp();

    message.channel.send(serverembed);
  }
  ///////////////////////////////////////////////////////COMANDO AVATAR/////////////////////////////////////////////////////////////////
  else if (command === "avatar") {
    let mention = message.mentions.members.first();
    const id = client.users.resolve(args[1]);

    const avatarembed = new MessageEmbed()
      .setColor(message.member.displayColor)
      .setAuthor("Avatar de " + message.member.displayName + "")
      .setDescription(
        `[Avatar URL](${message.author.displayAvatarURL({
          format: "png",
          dynamic: true,
          size: 4096
        })})`
      )
      .setImage(
        message.author.displayAvatarURL({
          format: "png",
          dynamic: true,
          size: 4096
        })
      )
      .setTimestamp();
    if (!mention) return message.channel.send(avatarembed);

    const embed1 = new MessageEmbed()
      .setColor("RANDOM")
      .setAuthor("Avatar de " + mention.displayName)
      .setImage(
        mention.user.displayAvatarURL({
          format: "png",
          dynamic: true,
          size: 4096
        })
      )
      .setDescription(
        `[Avatar URL](${mention.user.displayAvatarURL({
          format: "png",
          dynamic: true,
          size: 4096
        })})`
      )
      .setTimestamp()
      .setFooter(
        "Pedido por: " + message.member.displayName,
        message.author.displayAvatarURL()
      );
    return message.channel.send(embed1);
  }
  ////////////////////////////////////////////////////////////COMANDO EMBEDSAY//////////////////////////////////////////////////////////////////////////////
  else if (command === "embedsay") {
    if (!message.member.permissions.has("MANAGE_MESSAGES"))
      return message.channel.send("No tienes permisos de admnistrar mensajes!");
    if (!args.slice(1).join(" ")) return message.reply("Escribe algo!");
    message.delete();
    const sayembed = new MessageEmbed()
      .setDescription(args.slice(1).join(" "))
      .setFooter(message.author.username, message.author.displayAvatarURL())
      .setColor("RANDOM")
      .setTimestamp();
    message.channel.send(sayembed);

    /////////////////////////////////////////////////////////COMANDO SUGGEST/////////////////////////////////////////////////////////////////////
  } else if (command === "suggest") {
    if (!args.slice(1).join(" "))
      return message.reply("Escribe algo para sugerir!");
    const sugembed = new MessageEmbed()
      .setTitle("Nueva sugerencia")
      .setDescription(args.slice(1).join(" "))
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setColor("BLUE")
      .setFooter("⬆️ | Me gusta! ⬇️ | No me gusta");
    const m = await client.channels.cache
      .get("765344012965773342")
      .send(sugembed);
    m.react("⬆️");
    m.react("⬇️");
    message.channel.send("Sugerencia enviada ! :white_check_mark:");
  }
  /////////////////////////////////////////////////////////////////COMANDO SUPPORT////////////////////////////////////////////////////////////////
  else if (command === "discord") {
    const embed2 = new MessageEmbed()
      .setTitle("Soporte")
      .addField(
        "Hey! Necesitas ayuda? o quieres unirte a mi server? Aquí esta!",
        "[Usa este enlace!](https://discord.gg/ayc6VZu)"
      )
      .setTimestamp()
      .setFooter(client.user.username, client.user.displayAvatarURL())
      .setColor("YELLOW");
    message.channel.send(embed2);
  }
  //////////////////////////////////////////////////////////////////COMANDO MODERATION///////////////////////////////////////////////////////////////
  else if (command === "moderation") {
    if (!message.member.permissions.has("MANAGE_GUILD"))
      return message.channel.send(
        ":no_entry: No puedes ver los comandos de moderación"
      );
    const modembed = new MessageEmbed()
      .setTitle("Comandos de moderación")
      .addField(prefix + "ban (@usuario) (razón)", "Banea a a alguien")
      .addField(prefix + "say (texto)", "El bot dirá algo por ti")
      .addField(
        prefix + "embedsay (texto)",
        "El bot hará un embed con tu texto."
      )
      .addField(prefix + "kick (@usuario) (razón)", "Expulsa a alguien.")
      .addField(prefix + "clear (1/100)", "Borra mensajes")
      .addField(prefix + "prefix (nuevo prefix)", "Cambia el prefix del bot!")
      .addField(
        prefix + "setwelcome (#canal)",
        "Configura el canal de bienvenidas."
      )
      .addField(
        prefix + "setcooldown (tiempo)",
        "Establece un modo pausado para el canal. [s => segundos/m => minutos/h => horas]"
      )
      .setColor("#ff0000");
    message.channel.send(modembed);
  }
  ////////////////////////////////////////////////////////////////////COMANDO FUN/////////////////////////////////////////////////////////////////
  else if (command === "fun") {
    const funembed = new MessageEmbed()
      .setTitle("Comandos divertidos :zany_face:")
      .addField(prefix + "howgay", "Mira qué tan gay eres", true)
      .addField(prefix + "ascii", "Convierte tu texto a texto ascii", true)
      .addField(
        prefix + "8ball",
        "Pregunta algo y te contestaré con algo random",
        true
      )
      .addField(
        prefix + "slap (@usuario)",
        "Le das una cachetada a alguien",
        true
      )
      .addField(
        prefix + "chat (texto)",
        "Chateas con el bot en todos los lenguajes!",
        true
      )
      .addField(prefix + "meme", "Meme random", true)
      .addField(
        prefix + "ppt [piedra/papel/tijera]",
        "Juega a piedra papel o tijera",
        true
      )
      .setColor(exito_color);
    message.channel.send(funembed);
  }
  ////////////////////////////////////////////////////////////////////COMANDO INFO///////////////////////////////////////////////////////////////
  else if (command === "info") {
    const infoembed = new MessageEmbed()
      .setTitle("Comandos de info")
      .addField(prefix + "serverinfo", "Muestra info del servidor")
      .addField(prefix + "avatar", "Muestra el avatar tuyo o el de otro")
      .addField(prefix + "servericon", "Muestra el ícono del server")
      .addField(prefix + "ping", "Muestra la latencia del bot")
      .addField(prefix + "stats", "Mira las estadísticas del bot")
      .addField(prefix + "lyrics (canción)", "Mira la letra de una canción.")
      .addField(prefix + "invite", "Muestra la invitación del bot")
      .addField(
        prefix + "calculate (operación)",
        "Calcula algo, los simbolos son + - * /"
      )
      .addField(
        prefix + "covid (pais)",
        "Muestra la información del ~~Covid-19~~ de un país (debe ser en ingles)"
      )
      .addField(
        prefix + "playstore (app)",
        "Obtiene información de una aplicación o un juego."
      )
      .addField(prefix + "rolelist", "Mira los roles del servidor")
      .addField(prefix + "emojilist", "Mira los emojis del servidor")
      .setColor("BLUE");
    message.channel.send(infoembed);
  }

  /////////////////////////////////////////////////////////////////////COMANDO SUPPORT/////////////////////////////////////////////////////////////
  else if (command === "support") {
    const support = new MessageEmbed()
      .setTitle("Comandos de soporte")
      .addField(prefix + "discord", "Link de invitación a mi server")
      .addField(prefix + "suggest", "Sugiere algo para el bot")
      .addField(prefix + "bugreport", "Reporta un bug")
      .setColor("#ff0000");
    message.channel.send(support);
  }
  /////////////////////////////////////////////////////////////////COMANDO BUGREPORT///////////////////////////////////////////////////////////////
  else if (command === "bugreport") {
    if (!args.slice(1).join(" ")) return message.reply("Que bug tengo?");
    const bugembed = new MessageEmbed()
      .setTitle("Nuevo bug")
      .addField("Error:", args.slice(1).join(" "))
      .addField("Reportero:", message.author.tag)
      .setColor("#ff0000")
      .setTimestamp();
    client.users.resolve("761404868460019732").send(bugembed);
    message.channel.send(
      "Gracias por tu reporte, ! PEPE#0380 lo verá lo antes posible!"
    );
  }
  ///////////////////////////////////////////////////////////////COMANDO MUSIC///////////////////////////////////////////////////////////////////////////
  else if (command === "music") {
    const hmusic = new MessageEmbed()
      .setTitle("Comandos de música :musical_note:")
      .addField(prefix + "play / p", "Empieza a reproducir", true)
      .addField(prefix + "skip", "Saltea la canción actual", true)
      .addField(prefix + "stop", "Para la canción y borra la lista", true)
      .addField(prefix + "pause", "Pone en pausa la canción actual", true)
      .addField(prefix + "resume", "Reanuda la canción actual", true)
      .addField(
        prefix + "nowplaying / np",
        "Muestra lo que se está reproduciendo ahora mismo",
        true
      )
      .addField(prefix + "queue / q", "Muestra toda la lista", true)
      .addField(prefix + "volume / vol [1/100]", "Establece un volumen", true)
      .setColor("BLUE");
    message.channel.send(hmusic);
  }
  /////////////////////////////////////////////////////////////COMANDO CREATOR///////////////////////////////////////////////////////////////////////
  else if (command === "creator") {
    if (!["761404868460019732"].includes(message.author.id))
      return message.channel.send("No puedes ver los comandos de creador!");
    const creatorembed = new MessageEmbed()
      .setTitle("Comandos de creador")
      .addField(prefix + "eval (code)", "Evalúa un codigo", true)
      .addField(
        prefix + "blacklist (@usuario)",
        "Pone a alguien en la lista negra."
      );
    message.channel.send(creatorembed);
  }
  /////////////////////////////////////////////////////////////COMANDO SLAP///////////////////////////////////////////////////////////////////////
  else if (command === "slap") {
    let memes = [
      "https://i.imgur.com/YA7g7h7.gif",
      "https://i.imgur.com/4MQkDKm.gif",
      "https://i.imgur.com/fm49srQ.gif",
      "https://cdn.zerotwo.dev/SLAP/cf972400-4ce4-4a3a-8fbf-33d1bc5f142f.gif",
      "https://cdn.nekos.life/slap/slap_012.gif",
      "https://cdn.nekos.life/slap/slap_010.gif",
      "https://media1.tenor.com/images/b6d8a83eb652a30b95e87cf96a21e007/tenor.gif?itemid=10426943",
      "https://i.imgur.com/o2SJYUS.gif",
      "https://media1.tenor.com/images/0720ffb69ab479d3a00f2d4ac7e0510c/tenor.gif"
    ];
    let math = memes[Math.floor(Math.Random() * memes.length)];

    let miembro = message.mentions.members.first();
    if (!miembro)
      return message.channel.send(
        "Menciona a alguien para darle una cachetada."
      );
    const slapembed = new MessageEmbed()
      .setTitle(
        `${message.author.username} le dio una cachetada a ${miembro.user.username} :0`
      )
      .setImage(math)
      .setFooter("XD")
      .setColor("RANDOM");
    message.channel.send(slapembed);
  }
  ///////////////////////////////////////////////////////////COMANDO LYRICS//////////////////////////////////////////////////////////////////////
  else if (command === "lyrics") {
    const search = args.slice(1).join(" ");

    if (!search) return message.channel.send("Escribe alguna canción!");
    message.channel.startTyping();
    const [lyrics, icon, title, author] = await Promise.all([
      // array de promesas a resolver
      soleno.requestLyricsFor(search),
      soleno.requestIconFor(search),
      soleno.requestTitleFor(search),
      soleno.requestAuthorFor(search)
    ]);
    // créamos el embed básico
    const embed4 = new MessageEmbed()
      .setTitle(title)
      .setAuthor(author, icon)
      .setColor("BLUE");

    // Util.splitMessage() nos permitirá no superar el límite de caracteres de Discord
    // (ésta función la dá Discord.js)
    // iteramos sobre el array de mensajes a enviar
    for (const song of Util.splitMessage(lyrics)) {
      // ponemos en el footer el resultado y enviamos el embed
      embed4.setFooter(song);

      message.channel.send(embed4);
      // ésto por si la canción es muy larga :(
      message.channel.stopTyping();
    }
  } else if (command === "kick") {
    if (["762599129443467294"].includes(message.guild.id))
      return message.channel.send(
        "Los comandos de moderación están deshabilitados en este server!"
      );
    if (!message.guild.me.permissions.has("KICK_MEMBERS")) {
      return message.channel.send(
        "Necesito el permiso de expulsar para continuar"
      );
    }

    if (!message.member.permissions.has("KICK_MEMBERS")) {
      return message.channel.send(
        "No tienes el permiso siguiente: `Expulsar`."
      );
    }

    let persona =
      message.mentions.members.first() ||
      message.guild.members.resolve(args[0]);

    if (!persona) {
      return message.channel.send("Debes mencionar a alguien");
    } else if (!persona.kickable) {
      return message.channel.send("No puedo expulsar a esta persona");
    } else if (
      persona.roles.highest.comparePositionTo(message.member.roles.highest) > 0
    ) {
      return message.channel.send(
        "Esta persona esta en la misma o mayor nivel de jerarquia que tu, no puedes expulsarlo"
      );
    }

    var razon = args.slice(2).join(" ");
    if (!razon) {
      razon = "Razon no especificada";
    }

    message.guild
      .member(persona)
      .kick(razon)

      .catch(err =>
        message.reply("Ocurrio un **error** desconocido, error: `" + err + "`")
      )
      .then(() => {
        message.channel.send({
          embed: {
            title: "Expulsado con éxito! ✅",
            color: exito_color,
            fields: [
              {
                name: "Expulsado:",
                value: `${persona.user.username}`,
                inline: true
              },
              {
                name: "Expulsador:",
                value: `<@${message.author.id}>`,
                inline: true
              },
              {
                name: "Razón:",
                value: `${razon}`,
                inline: true
              }
            ]
          }
        });
      });
  } else if (command === "user") {
    let estado = {
      online: "<a:Online:762703254948675615> En línea",
      idle: "<:Idle:762703305696608276> Ausente",
      dnd: "<a:dnd:762703349907980358> No molestar",
      offline: "<a:Offline:762703399652818965> Desconectado"
    };
    let userm = message.mentions.members.first();
    if (!userm) {
      var user = message.author;

      const embedz = new MessageEmbed()
        .setThumbnail(user.displayAvatarURL)
        .setAuthor(
          user.username + "#" + user.discriminator,
          user.displayAvatarURL()
        )
        .addField(
          "Jugando a: ",
          user.presence.game != null ? user.presence.game.name : "Nada",
          true
        )
        .addField("ID: ", user.id, true)
        .addField("Estado: ", estado[user.presence.status], true)
        .addField(
          "Apodo: ",
          user.nickname != null ? message.member.nickname : "Ninguno",
          true
        )
        .addField(
          "Creación de cuenta: ",
          user.createdAt.toDateString().split(" ")[2] +
            "/" +
            user.createdAt.toDateString().split(" ")[1] +
            "/" +
            user.createdAt.toDateString().split(" ")[3],
          true
        )
        .addField(
          "Se unió al servidor el: ",
          message.member.joinedAt.toDateString().split(" ")[2] +
            "/" +
            message.member.joinedAt.toDateString().split(" ")[1] +
            "/" +
            message.member.joinedAt.toDateString().split(" ")[3],
          true
        )
        .addField(
          "Roles del usuario",
          message.member.roles.cache.map(role => role.toString()).join(", "),
          true
        )
        .setColor(0x66b3ff);

      message.channel.send(embedz);
    } else {
      const embeda = new MessageEmbed()
        .setThumbnail(userm.user.displayAvatarURL())
        .setAuthor(userm.user.tag, userm.user.displayAvatarURL())
        .addField(
          "Jugando a: ",
          userm.presence.game != null ? userm.presence.game.name : "Nada",
          true
        )
        .addField("ID: ", userm.id, true)
        .addField("Estado: ", estado[userm.presence.status], true)
        .addField(
          "Apodo: ",
          userm.nickname != null ? userm.nickname : "Ninguno",
          true
        )
        .addField(
          "Creación de cuenta:",
          userm.user.createdAt.toLocaleDateString("es-pe"),
          true
        )
        .addField(
          "Fecha de ingreso:",
          userm.joinedAt.toLocaleDateString("es-pe"),
          true
        )
        .addField(
          "Roles del usuario",
          userm.roles.cache.map(role => role.toString()).join(", "),
          true
        )
        .setColor(0x66b3ff);

      message.channel.send(embeda);
    }
  }
  ///////////////////////////////////////////////////////////COMANDO CALC///////////////////////////////////////////
  else if (command === "calculate") {
    const math = require("math-expression-evaluator"); // Este NPM es con el que se podrá hacer los calculos

    const embedl = new MessageEmbed().setColor(`RANDOM`);

    if (!args.slice(1).join(" ")) {
      embedl.setDescription(
        "Escribe alguna **expresión**! ej: 1+1 | 1-1 | 1/1 | 1*1"
      );
      return await message.channel.send(embedl); // Devuelve un mensaje si es que ejecuta el comando sin nada
    }
    let resultado;
    try {
      resultado = math.eval(args.slice(1).join(" ")); // El Args toma el calculo
    } catch (err) {
      resultado = "Error: Entrada Invalida";
    }
    embedl
      .addField("Entrada:", `\`\`\`js\n${args.slice(1).join(" ")}\`\`\``, false) // Te da el calculo
      .setTitle("📊 Calculadora")
      .addField("Salida", `\`\`\`js\n${resultado}\`\`\``, false);
    await message.channel.send(embedl);
  } else if (command === "chat") {
    if (!args.slice(1).join(" ")) return message.reply("Escribe algo!");

    message.channel.startTyping();

    const response = await fetch(
      `https://some-random-api.ml/chatbot?message=${encodeURIComponent(
        args.slice(1).join(" ")
      )}`
    );

    const json = await response.json();

    message.channel.send(json.response);

    return message.channel.stopTyping(true);
  } else if (command === "covid") {
    let pais = args.slice(1).join(" "); // Es dÃ³nde escribiremos el Nombre del pais a buscar
    if (!pais)
      return message.channel.send(
        "¡Escribe el nombre de un país! Debe ser en inglés."
      );

    superagent
      .get(`https://corona.lmao.ninja/v2/countries/${pais}`) // Con el NPM, "superagent", buscamos en la pÃ¡gina, la informaciÃ³n del pais sobre el covid-19.
      .end((err, res) => {
        let body = res.body;

        if (body.message)
          return message.channel.send(
            "¡El nombre del pais es invalido! Recuerda que el nombre debe ser en ingles."
          ); // Si no encuentra el nombre retorna mensaje que no lo encontro.

        const embed = new MessageEmbed()
          .setAuthor("Casos del pais " + pais)
          .addField("**Casos Totales**", `${body.cases}`, true) // Casos totales de ese pais
          .addField("**Casos Críticos**", `${body.critical}`, true) // Casos criticos de ese pais
          .addField("**Casos Hoy**", `${body.todayCases}`, true) // Casos de "HOY" de ese pais
          .addField("**Muertes Totales**", `${body.deaths}`, true) // Muertes por el COVID-19 de ese pais
          .addField("**Muertes Hoy**", `${body.todayDeaths}`, true) // Muertes de hoy por el COVID-19 ese pais
          .addField("**Recuperados**", `${body.recovered}`, true) // Recuperados del COVID-19
          .addField(
            "**Medidas de Prevención**",
            `🧼👏 Lavarse las manos frecuentemente 
            🧴 Usar Alcohol
            🤧 Para Toser o estornudar usar un pañuelo 
            🧍↔️🧍 Evitar contacto directo de personas con sintoma de Tos y Gripe
            😷 Usar  Barbijo en público
            🔬 Intenta hacerte el test
            🏠 Quedarse en Casa`,
            true
          )
          .setTimestamp()
          .setColor("#ff0000")
          .setFooter(
            "#QuedateEnCasa",
            "https://fems-microbiology.org/wp-content/uploads/2020/03/2019-nCoV-CDC-23312_without_background-pubic-domain.png"
          )
          .setThumbnail(
            `https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSAxhpv5t94TvcZcKjDUlAsQvnubWFSoXKjsA&usqp=CAU`
          );
        message.channel.send(embed); // Envia toda la informaciÃ³n del COVID-19, del pais buscado en un EMBED.
      });
  } else if (command === "setchannel") {
    if (!message.member.permissions.has("MANAGE_CHANNELS"))
      return message.reply(
        "No tienes los permisos para ejecutar este comando!"
      );

    let channel = message.mentions.channels.first();

    if (!channel) return message.reply("Menciona un canal!");

    const existe_canal = message.guild.channels.cache.find(
      c => c.name == channel.name
    );
    if (!existe_canal) return message.reply("Canal no encontrado");

    canal_db.establecer(`${message.guild.id}`, channel.id); //  Aqui guardamos el canal seleccionado junto a la ID del servidor cual se ha ejecutado
    message.channel.send("El canal se ha establecido a <#" + channel.id + ">");
  } else if (command === "testchannel") {
    if (!canal_db.tiene(`${message.guild.id}`))
      return message.chanenl.send(
        "El canal no ha sido establecido! Establezcalo con " +
          prefix +
          "setchannel!"
      );

    let canal = await canal_db.obtener(`${message.guild.id}`);

    let canal_guardado = message.guild.channels.cache.find(c => c.id == canal);

    if (!canal_guardado) return message.reply("El canal no ha sido guardado!");

    canal_guardado.send(
      "Hola, este canal ha sido guardado y estoy enviando mensaje solo aqui con el comando."
    );
  } else if (command === "blacklist") {
    if (
      !["761404868460019732"] ||
      !["750351208556003409"].includes(message.author.id)
    )
      return message.channel.send("No estas autorizado a usar esto!");

    let usuario = message.mentions.users.first();

    if (!usuario) return message.reply("Menciona a alguien!");

    const existe_usuario = client.users.resolve(usuario.id);

    if (!existe_usuario) return message.reply("El usuario no fue encontrado");

    prohibido.establecer(usuario.tag, "Blacklisteado");

    message.channel.send(
      "El usuario " + usuario.tag + " Se ha blacklisteado correctamente"
    );
  } else if (command === "prefix") {
    const nuevo = args[1];

    if (!nuevo)
      return message.reply(
        `El prefijo aqui es **${prefix}**\nUsa **${prefix}help** para los comandos`
      );

    if (!message.member.permissions.has("MANAGE_GUILD"))
      return message.reply("No tienes permisos para ejecutar este comando!");

    prefixes.establecer(message.guild.id, nuevo);

    message.channel.send({
      embed: {
        title: "Exito!",
        description: "El prefix de este servidor ahora es " + nuevo,
        color: "#00ff00"
      }
    });
  } else if (command === "clear") {
    const monto = args.slice(1).join(" ");

    if (!message.member.permissions.has("MANAGE_MESSAGES"))
      return message.reply("No tienes permisos para ejecutar este comando!");

    if (!monto)
      return message.reply("Selecciona el número de mensajes a borrar.");

    if (monto > 100)
      return message.reply("No puedes borrar más de 100 mensajes.");

    if (monto < 1) return message.reply("No puedes borrar menos de 1 mensaje");

    if (isNaN(monto)) return message.reply("Ese no es un número!");

    message.channel.bulkDelete(monto).then(() => {
      message.channel.send(`Borrados ${monto} mensajes!`);
    });
  } else if (command === "notas") {
    const MeowDB = require("meowdb");
    const notes = new MeowDB({
      dir: __dirname,
      name: "notes"
    });

    //Formato: notes [<add> <note>]
    //notes [<remove/update> <id/all (sólo remove)>]
    //Argumentos. Si no hay argumentos, mostrar las notas
    if (args[1] === "añadir") {
      //Con esto podemos añadir nuevas notas a nuestro espacio en la DB.
      if (!args[2]) return message.channel.send("Escribe alguna nota!");
      //Si existe, actualizar los nuevos datos, sino, crearlo...
      if (notes.exists(message.author.id)) {
        const arr = notes.get(message.author.id);
        arr.push(
          args
            .slice(2)
            .join(" ")
            .replace(/(\r\n|\n|\r)/gm, " ")
        );
        notes.set(message.author.id, arr);
        message.channel.send(
          "He añadido la nota con éxito! Mírala con **" + prefix + "notas** !!!"
        );
      } else {
        notes.create(message.author.id, [args.slice(2).join(" ")]);
        message.channel.send(
          "He añadido la nota con éxito! Mírala con **" + prefix + "notas** !!!"
        );
      }
    } else if (args[1] === "quitar") {
      //Remover nuestras notas
      if (notes.exists(message.author.id)) {
        if (!args[2])
          return message.channel.send(
            "Escribe la ID de la nota o escribe **" + prefix + "quitar all**"
          );
        if (args[2] === "all") {
          //En caso de querer remover todo....
          notes.delete(message.author.id);
          message.channel.send(
            "He quitado **todas** tus notas con éxito! Para escribir otra escribe **" +
              prefix +
              "notas añadir (texto)**"
          );
        } else {
          //Un número
          const arr = notes.get(message.author.id);
          let o = parseInt(args[2]);
          if (!o) return message.channel.send("ID inválida!");
          let i = o - 1;
          if (!arr[i])
            return message.channel.send("Esa ID de nota no existe ._ .");
          arr.splice(i, 1);
          notes.set(message.author.id, arr);
          message.channel.send(
            "He eliminado esa nota con éxito! Para escribir otra escribe **" +
              prefix +
              "notas añadir (texto)**"
          );
        }
      } else return message.channel.send("No tienes ninguna nota!");
    } else if (args[1] === "editar") {
      //Actualizar una nota
      if (notes.exists(message.author.id)) {
        if (!args[2])
          return message.channel.send(
            "Escribe la ID de la nota que quieras editar!"
          );
        else {
          //Hay que ver si la ID de esa nota existe..
          const arr = notes.get(message.author.id);
          let o = parseInt(args[2]);
          if (!o) return message.channel.send("ID Inválida!");
          let i = o - 1;
          if (!arr[i]) return message.channel.send("Esa ID de nota no existe!");
          if (!args[3]) return message.channel.send("Escribe la nueva nota!");
          arr[i] = args
            .slice(3)
            .join(" ")
            .replace(/(\r\n|\n|\r)/gm, " ");
          notes.set(message.author.id, arr);
          message.channel.send("La nota fue editada!");
        }
      } else
        return message.channel.send(
          "No tienes ninguna nota! Para escribir una escribe **" +
            prefix +
            "notas añadir (texto)**"
        );
    } else {
      if (notes.exists(message.author.id)) {
        const arr = notes.get(message.author.id);
        if (!arr[0])
          return message.channel.send(
            "No tienes ninguna nota! Para escribir una escribe **" +
              prefix +
              "notas añadir (texto)**"
          );
        let text = "";
        let i = 0;
        arr.forEach(r => {
          i++;
          text += i + ". " + r + "\n";
        });
        const embed = new MessageEmbed()
          .setTitle("Notas de: " + message.author.username)
          .setDescription(text)
          .setColor("BLUE")
          .setFooter(
            "Para añadir una nota escribe " + prefix + "notas añadir (texto)!"
          )
          .setTimestamp();
        message.channel.send(embed);
      } else
        return message.channel.send(
          "No tienes ninguna nota! Para escribir una escribe **" +
            prefix +
            "notas añadir (texto)**"
        );
    }
  } else if (command === "notes") {
    const n = new MessageEmbed()
      .setTitle("Notas! :pencil2:")
      .addField(prefix + "notas", "Mira tus notas", true)
      .addField(prefix + "notas añadir (texto)", "Añade una nota", true)
      .addField(
        prefix + "notas quitar (ID/all)",
        "Quita una nota con la ID",
        true
      )
      .addField(
        prefix + "notas editar (ID) (nuevo texto)",
        "Edita una nota",
        true
      )
      .setThumbnail(client.user.displayAvatarURL())
      .setColor("YELLOW")
      .setFooter(
        "Pedido por " + message.author.username + ".",
        message.author.displayAvatarURL()
      );
    message.channel.send(n);
  } else if (command === "setwelcome") {
    if (!message.member.permissions.has("MANAGE_CHANNELS"))
      return message.reply(
        "No tienes los suficientes permisos para ejecutar este comando!"
      );
    const mencion = message.mentions.channels.first();
    if (!mencion) return message.channel.send("Menciona un canal!");

    const existe_canal = message.guild.channels.cache.find(
      c => c.name == mencion.name
    );
    if (!existe_canal) return message.channel.send("Canal no encontrado.");

    bienvenidas.establecer(message.guild.id, mencion.id);

    message.channel.send(
      "El canal establecido para las bienvenidas ahora es: <#" +
        mencion.id +
        "> !!!"
    );
  } else if (command === "meme") {
    const meme = new MessageEmbed()
      .setTitle("MEME")
      .setImage(dimgs.randomMemeImagen())
      .setColor("RANDOM");
    message.channel.send(meme).then(async function(message) {
      message.react("🤣");
      message.react("😑");
      message.react("🤬");
    });
  } else if (command === "snipe") {
    const channel = message.mentions.channels.first() || message.channel;

    //en esta constante definimos un canal mencionado y si no el canal donde se ejecuto el cmd

    const msg = client.snipes.get(channel.id);
    //en esta constante definimos nuestro client.snipes que es nuestro objeto Map, con el metodo .get() tratamos de ver si channel.id(id del canal) esta dentro del Map
    if (!msg) {
      message.channel
        .send("No se ha borrado recientemente ningun mensaje")
        .then(m => m.delete({ timeout: 5000 }));
      //Si no lo esta mandamos este mensaje ^
    } else {
      const main = new MessageEmbed()
        .setColor("#FF0000")
        .setAuthor(
          `Mensaje Escrito de ${msg.delete.tag}`,
          msg.delete.displayAvatarURL()
        )
        .setDescription(msg.content);
      message.channel.send(main);
    }
    /* 
Cada Valor esta en el evento messageDelete del cual en el comando los vas a obtener.
*/
  } else if (command === "ppt") {
    if (!args[1])
      return message.channel
        .send("Opciones: `piedra`, `papel` o `tijera`")
        .then(m => m.delete({ timeout: 10000 }));

    if (args[1].toLowerCase() == "piedra") {
      let random = [
        `Elejiste: **Piedra**, Yo elejí: **Piedra**\nHas **empatado**`,
        `Elejiste: **Piedra**, Yo elejí: **Papel**\nHas **perdido**`,
        `Elejiste: **Piedra**, Yo elejí: **Tijera**\nHas **ganado**`
      ];
      const piedra = new MessageEmbed()
        .setTitle("Piedra, Papel o Tijera!")
        .setDescription(random[Math.floor(Math.random() * random.length)])
        .setColor("RANDOM");
      message.channel.send(piedra);
    } else if (args[1].toLowerCase() == "papel") {
      let random = [
        `Elejiste: **Papel**, Yo elejí: **Piedra**\nHas **ganado**`,
        `Elejiste: **Papel**, Yo elejí: **Papel**\nHas **empatado**`,
        `Elejiste: **Papel**, Yo elejí: **Tijera**\nHas **perdido**`
      ];
      const papel = new MessageEmbed()
        .setTitle("Piedra, Papel o Tijera!")
        .setDescription(random[Math.floor(Math.random() * random.length)])
        .setColor("RANDOM");
      message.channel.send(papel);
    } else if (args[1].toLowerCase() == "tijera") {
      let random = [
        `Elejiste: **Tijera**, Yo elejí: **Papel**\nHas **ganado**`,
        `Elejiste: **Tijera**, Yo elejí: **Piedra**\nHas **perdido**`,
        `Elejiste: **Tijera**, Yo elejí: **Tijera**\nHas **empatado**`
      ];
      const tijera = new MessageEmbed()
        .setTitle("Piedra, Papel o Tijera!")
        .setDescription(random[Math.floor(Math.random() * random.length)])
        .setColor("RANDOM");
      message.channel.send(tijera);
    } else
      return message.channel
        .send(":x: **|** Debes elejir `piedra`, `papel`, o `tijera`.")
        .catch(error => {
          console.error(error);
          message.channel.send("Ocurrio un error: " + error);
        });
  } else if (command === "setcooldown") {
    if (!message.member.permissions.has("MANAGE_CHANNELS"))
      return message.reply(
        "No tienes los suficientes permisos para ejecutar este comando!"
      );

    if (!message.guild.me.permissions.has("MANAGE_CHANNELS"))
      return message.reply(
        "Por favor, necesito el permiso de administrar canales! Añadamelo!"
      );

    let tiempo = args[1];

    let conversion = ms(tiempo); // Esto dará como resultado milisegundos.
    let segundos = Math.floor(conversion / 1000);

    if (args[1] === "off") {
      // usaremos esto en caso de que queramos desactivar el cooldown
      message.channel.setRateLimitPerUser(0); // lo establecemos en 0 (osea, normal xd)
      return message.channel.send(
        `Modo pausado deshabilitado! :white_check_mark:`
      ); // mandamos el mensaje que se desactivó
    } else if (!tiempo) {
      message.channel.send("Incluye el formato de hora.");
    }

    if (segundos > 21600)
      return message.channel.send(
        "El temporizador debe ser menor o igual a 6 horas."
      );
    else if (segundos < 1)
      return message.channel.send(
        "El temporizador debe ser mayor o igual a 1 segundo."
      );
    else if (isNaN(segundos) || segundos === "undefinied")
      return message.reply("Por favor ingrese un formato válido!");
    await message.channel.setRateLimitPerUser(segundos); // estableceremos el cooldown marcado.

    return message.channel
      .send(`Modo pausado habilitado! :white_check_mark:`)
      .catch(error => {
        console.error(error);
        message.channel.send("Ocurrio un error: " + error);
      });
  }
  //////////////////////////////////////////////////////////////////COMANDO PLAYSTORE//////////////////////////////////////////////////////////////////////////////
  else if (command === "playstore") {
    var play = require("google-play-scraper"); //para primero crearemos una variable play que sera el npm que descargamos
    var busqueda = args.slice(1).join(" "); //creamos una variable busqueda que son los argumentos
    console.log(busqueda);
    if (message.author.bot) {
      //para primero si el author del mensaje es un bot
      return; //returnamos nada
    } //y cerramos
    if (!busqueda) {
      //haora le decimos si no hay busqueda que ya lo definimos mas arriga
      return message.channel.send("Que quieres que busque ?"); //returnamos un mensaje
    } //y cerramos
    play
      .search({
        //haora con nuestra variable play iniciamos una busqueda
        term: busqueda, //buscamos nuestra busqueda
        num: 1 //y el primer resultado
      })
      .then(as => {
        //haora lo optenemos
        play
          .app({ appId: as[0].appId })
          .then(res => {
            //play app saca completamente todos los datos pero nesecitamos buscarlo por id por eso isimos lo anterior haora que ya tenemos su id hacemos la busqueda
            const embed = new MessageEmbed() //creamos una constante embed donde crearemos un nuevo mensaje embed
              .setColor("RANDOM") //le agregamos un color al embed en este caso un color random
              .setThumbnail(res.icon) //haora le agregamos un thumbnail en la que sacaremos el icon de nuestra busqueda
              .addField("Nombre", res.title) //le agregamos un field al embed en la que entramos a la res y sacamos el titulo de la app
              .addField("Descripción", res.summary) //agregamos otro field al embed en la que entraremos a la res y sacaremos sumary que es como la descripcion de lo que hace la app
              .addField("Descargas", res.installs) //le agregamos otro field en la que sacaremos los installs (descargas) que tiene la app
              .addField("Calificaciones", res.ratings) //le agregamos otro field en la que sacaremos en cuanto ranting esta esa app
              .addField(
                "Precio",
                res.priceText != "Free" ? res.priceText : "Gratis"
              ) //le agregamos otro field en la que sacaremos el precio de la app si es gratis devolvera free
              .addField("ID", res.appId) //agregamos otro field en la que entraremos a los datos y sacaremos la id de la cancion
              .addField("Género", res.genre) //agregamos otro field en la que pondremos el genero de la app
              .addField("App URL", "[Aquí](" + res.url + ")") //agregamos otro field en la que sacaremos el link directo a la app
              .addField(
                "Creador",
                "Nombre: " +
                  res.developer +
                  "\n" +
                  "Gmail: " +
                  res.developerEmail +
                  "\n" +
                  "Sitio Web: " +
                  res.developerWebsite +
                  "\n" +
                  "Dirección: " +
                  res.developerAddress +
                  "ID: " +
                  res.developerId
              ) //haora agregamos otro field pero en este sacaremos todos los datos de desarrollador
              .addField("Cambios recientes", res.recentChanges) //agregamos otro field en la que pondremos la descripcion de la app
              .setTimestamp(); //y agregamos un timestamp que sera el tiempo en el que se solicito el embed
            message.channel.send(embed); //por ultimo enviamos al canal donde se solicito el comando el embed
          })
          .catch(error => {
            //si da error en la busqueda porque no encontro la app
            message.channel.send(
              "Hmm... Seguro que buscaste bien **" + busqueda + "**? :thinking:"
            ); //returnamos un mensaje disiendole que no encontro la app
          }); //cerramos esa funcion
      });
  } else if (command === "rolelist") {
    const roles = new MessageEmbed()
      .setTitle("Lista de roles de: " + message.guild.name)
      .setDescription(
        message.guild.roles.cache.map(e => e.toString()).join(" | ")
      )
      .setColor(exito_color);
    message.channel.send(roles);
  } else if (command === "emojilist") {
    const emojis = new MessageEmbed()
      .setTitle("Lista de emojis de: " + message.guild.name)
      .setDescription(
        message.guild.emojis.cache.map(emoji => emoji.toString()).join(" ")
      )
      .setColor("#00FF00");
    message.channel.send(emojis);
  }
});

client.on("guildCreate", guild => {
  const ilucklogs = client.channels.cache.get("766062185720971265");
  let verifLevels = {
      NONE: "Ninguno",
      LOW: "Debe tener un correo verificado en discord",
      MEDIUM: "Debe estar registrado en Discord por más de 5 minutos.",
      HIGH: "Debe llevar en el servidor por más de 10 minutos",
      VERY_HIGH: "Debe tener un teléfono verificado en Discord"
    },
    region = {
      europe: "Europa :flag_eu:",
      brazil: "Brasil :flag_br: ",
      hongkong: "Hong Kong :flag_hk:",
      japan: "Japón :flag_jp:",
      russia: "Rusia :flag_ru:",
      singapore: "Singapur :flag_sg:",
      southafrica: "Sudáfrica :flag_za:",
      sydney: "Sydney :flag_au:",
      "us-central": "EE.UU Central :flag_us:",
      "us-east": " Este de EE.UU:flag_us:",
      "us-south": "Sur de EE.UU :flag_us:",
      "us-west": "Oeste de EE.UU :flag_us:",
      "vip-us-east": "VIP EE.UU Este :flag_us:",
      "eu-central": "Europa Central :flag_eu:",
      "eu-west": "Europa Oeste :flag_eu:",
      london: "London :flag_gb:",
      amsterdam: "Amsterdam :flag_nl:",
      india: "India :flag_in:"
    };
  const iluckembed = new ILuck.MessageEmbed()
    .setTitle("Estoy en un nuevo server: " + guild.name)
    .setDescription(
      `Usuarios: ${guild.members.cache.size}

 Creador: ${guild.owner.user.tag}
 
 Región: ${region[guild.region]}
 
 Nivel de verificación: ${verifLevels[guild.verificationLevel]}
 
 ID: ${guild.id}
 
 Emojis: ${guild.emojis.cache.size}

 Roles: ${guild.roles.cache.size}

 Canales: ${guild.channels.cache.filter(x => x.type !== "category").size}

 Gracias a este server estoy en ${client.guilds.cache.size} servers!`
    ) // Descripcion
    .setColor(exito_color);
  ilucklogs.send(iluckembed); // Enviamos el embed
});

client.on("guildDelete", guild => {
  let verifLevels = {
      NONE: "Ninguno",
      LOW: "Debe tener un correo verificado en discord",
      MEDIUM: "Debe estar registrado en Discord por más de 5 minutos.",
      HIGH: "Debe llevar en el servidor por más de 10 minutos",
      VERY_HIGH: "Debe tener un teléfono verificado en Discord"
    },
    region = {
      europe: "Europa :flag_eu:",
      brazil: "Brasil :flag_br: ",
      hongkong: "Hong Kong :flag_hk:",
      japan: "Japón :flag_jp:",
      russia: "Rusia :flag_ru:",
      singapore: "Singapur :flag_sg:",
      southafrica: "Sudáfrica :flag_za:",
      sydney: "Sydney :flag_au:",
      "us-central": "EE.UU Central :flag_us:",
      "us-east": " Este de EE.UU:flag_us:",
      "us-south": "Sur de EE.UU :flag_us:",
      "us-west": "Oeste de EE.UU :flag_us:",
      "vip-us-east": "VIP EE.UU Este :flag_us:",
      "eu-central": "Europa Central :flag_eu:",
      "eu-west": "Europa Oeste :flag_eu:",
      london: "London :flag_gb:",
      amsterdam: "Amsterdam :flag_nl:",
      india: "India :flag_in:"
    };
  const ilucklogs = client.channels.cache.get("766062185720971265");
  const iluckembed2 = new ILuck.MessageEmbed()
    .setTitle("Me quitaron de un server: " + guild.name)
    .setDescription(
      `Usuarios: ${guild.members.cache.size}

 Creador: ${guild.owner.user.tag}
 
 Región: ${region[guild.region]}
 
 Nivel de verificación: ${verifLevels[guild.verificationLevel]}
 
 ID: ${guild.id}
 
 Emojis: ${guild.emojis.cache.size}

 Roles: ${guild.roles.cache.size}

 Canales: ${guild.channels.cache.filter(x => x.type !== "category").size}

 Ahora estoy en ${client.guilds.cache.size} servers`
    ) // Descripcion
    .setColor(exito_color); // Color random
  ilucklogs.send(iluckembed2); // Enviamos el embed
});

client.on("guildMemberAdd", async member => {
  let canal = await bienvenidas.obtener(member.guild.id);

  let canal_guardado = member.guild.channels.cache.find(c => c.id == canal);

  if (!canal_guardado) return;

  const hola = new MessageEmbed()
    .setTitle("Nuevo usuario!")
    .setDescription(
      `Hola! Bienvenido ${member.user.username}!!!
Has llegado por fin a ${member.guild.name}!!!
Esperamos que la pases muyyyyyy bien!!!!
Contigo somos: ${member.guild.members.cache.size}!!!`
    )

    .setThumbnail(member.user.displayAvatarURL())

    .setImage(
      "https://cdn.discordapp.com/attachments/751798058907467820/767749257129230336/Bienvenido.png"
    )

    .setTimestamp()

    .setColor(exito_color);

  canal_guardado.send(hola);
});

client.login(process.env.BOT_TOKEN);
