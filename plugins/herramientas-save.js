// Código elaborado por: https://github.com/elrebelde21

import uploadFile from '../lib/uploadFile.js';
import fs from 'fs';
import path from 'path';

const globalContentFile = path.join(process.cwd(), './database/globalContent.json');
const localContentFile = path.join(process.cwd(), './database/localContent.json');

function loadGlobalContent() {
try {
if (fs.existsSync(globalContentFile)) {
const data = fs.readFileSync(globalContentFile, 'utf8');
return JSON.parse(data);
}
return {};
} catch (e) {
console.error(`Error al cargar globalContent.json: ${e}`);
return {};
}}

function saveGlobalContent(data) {
try {
fs.writeFileSync(globalContentFile, JSON.stringify(data, null, 2), 'utf8');
} catch (e) {
console.error(`Error al guardar globalContent.json: ${e}`);
}}

function loadLocalContent() {
try {
if (fs.existsSync(localContentFile)) {
const data = fs.readFileSync(localContentFile, 'utf8');
return JSON.parse(data);
}
return {};
} catch (e) {
console.error(`Error al cargar localContent.json: ${e}`);
return {};
}}

function saveLocalContent(data) {
try {
fs.writeFileSync(localContentFile, JSON.stringify(data, null, 2), 'utf8');
} catch (e) {
console.error(`Error al guardar localContent.json: ${e}`);
}}

let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
global.db.data = global.db.data || {};
global.db.data.sticker = global.db.data.sticker || {};

const localContent = loadLocalContent();
if (!localContent[m.chat]) localContent[m.chat] = { savedContent: {} };
const chat = localContent[m.chat];

if (!text) throw `${lenguajeGB['smsAvisoMG']()} 𝙐𝙎𝘼 𝘿𝙀 𝙀𝙎𝙏𝘼 𝙈𝘼𝙉𝙀𝙍𝘼:*\n*ღ ${usedPrefix + command}* <palabra clave> (responde a contenido)\n"ღ ${usedPrefix + command} <texto> - <palabra clave>*\n*ღ ${usedPrefix + command} <comando>* (responde a sticker/imagen, ej: .help)`;
let content = {}, keyword, caption;
const q = m.quoted;
const splitText = text.split(/[-|,]/).map(s => s.trim());
const hasSeparator = splitText.length > 1;
const isCommandFormat = text.startsWith('.');

if (q) {
const isMedia = ['image', 'video', 'sticker', 'audio', 'application'].some(type => q.mimetype?.startsWith(type));
keyword = hasSeparator ? splitText[1] : text;
caption = hasSeparator ? splitText[0] : q.caption || q.fileName || '';

if (isMedia) {
const buffer = await q.download();
if (q.mimetype.startsWith('video') && buffer.length > 30 * 1024 * 1024) throw '⚠️ *El video excede el límite de 30 MB. No se puede guardar.*';

content = {type: (q.mtype === 'stickerMessage' || (q.mimetype === 'image/webp' && typeof q.isAnimated !== 'undefined')) ? 'sticker' :
q.mimetype.startsWith('image') ? 'image' :
q.mimetype === 'video/mp4' && q.gifPlayback ? 'gif' :
q.mimetype.startsWith('video') ? 'video' :
q.mimetype.startsWith('audio') ? 'audio' :
q.mimetype.startsWith('application') ? 'document' : 'sticker',
data: buffer.toString('base64'),
caption: caption,
isAnimated: q.mimetype === 'image/webp' ? q.isAnimated || false : false,
creator: m.sender,
mimetype: q.mimetype,
fileName: q.fileName || (q.mtype === 'documentMessage' ? keyword : 'documento')
};

if ((content.type === 'sticker' || content.type === 'image') && q.fileSha256 && !hasSeparator && isCommandFormat) {
const hash = q.fileSha256.toString('base64');
const commandData = { text: text,
mentionedJid: m.mentionedJid || [],
creator: m.sender,
at: +new Date,
locked: false,
data: content.data,
isAnimated: content.isAnimated,
chat: isOwner ? null : m.chat
};

global.db.data.sticker[hash] = commandData;
await m.reply(`${lenguajeGB['smsAvisoEG']()}𝙀𝙇 ${text} 𝘼𝙎𝙄𝙂𝙉𝘼𝘿𝙊 ${isOwner ? '𝙂𝙇𝙊𝘽𝘼𝙇𝙈𝙀𝙉𝙏𝙀' : '𝙀𝙉 𝙀𝙎𝙏𝙀 𝘾𝙃𝘼𝙏'} 𝘼𝙇 𝙎𝙏𝙄𝘾𝙆𝙀𝙍 𝙀 𝙄𝙈𝘼𝙂𝙀𝙉 𝙁𝙐𝙀 𝘼𝙂𝙍𝙀𝙂𝘼𝘿𝙊 𝘼 𝙇𝘼 𝘽𝘼𝙎𝙀 𝘿𝙀 𝘿𝘼𝙏𝙊𝙎 𝘾𝙊𝙍𝙍𝙀𝘾𝙏𝘼𝙈𝙀𝙉𝙏𝙀`);
await m.react("✅");
return;
}

if (!hasSeparator) {
if (isOwner) {
const globalContent = loadGlobalContent();
globalContent[keyword.toLowerCase()] = content;
saveGlobalContent(globalContent);
await m.reply(`${lenguajeGB['smsAvisoEG']()} *${keyword}*. 𝙁𝙐𝙀 𝘼𝙂𝙍𝙀𝙂𝘼𝘿𝙊 𝙂𝙇𝙊𝘽𝘼𝙇𝙈𝙀𝙉𝙏𝙀 𝘼 𝙇𝘼 𝘽𝘼𝙎𝙀 𝘿𝙀 𝘿𝘼𝙏𝙊𝙎 𝘾𝙊𝙍𝙍𝙀𝘾𝙏𝘼𝙈𝙀𝙉𝙏𝙀.`);
} else {
chat.savedContent[keyword.toLowerCase()] = content;
saveLocalContent(localContent);
await m.reply(`${lenguajeGB['smsAvisoEG']()} *${keyword}* 𝙁𝙐𝙀 𝙂𝙐𝘼𝙍𝘿𝘼𝘿𝙊 𝙀𝙉 𝙀𝙎𝙏𝙀 𝘾𝙃𝘼𝙏 𝘾𝙊𝙍𝙍𝙀𝘾𝙏𝘼𝙈𝙀𝙉𝙏𝙀.`);
}
await m.react("✅");
return;
}} else if (q.mtype === 'locationMessage') {
content = {type: 'location',
latitude: q.latitude,
longitude: q.longitude,
caption: caption || q.name || '',
creator: m.sender
};
keyword = hasSeparator ? splitText[1] : text;
} else if (q.mtype === 'contactMessage') {
if (!q.vcard) throw '⚠️ *El mensaje de contacto no tiene una vCard válida.*';
content = {type: 'contact',
vcard: q.vcard,
caption: caption || q.displayName || '',
creator: m.sender
};
keyword = hasSeparator ? splitText[1] : text;
} else if (q.mtype === 'buttonsMessage' || q.mtype === 'templateMessage') {
content = {type: 'buttons',
text: q.contentText || q.text || '',
buttons: q.buttons?.map(b => ({ buttonId: b.buttonId, buttonText: b.displayText })) || [],
caption: caption,
creator: m.sender
};
keyword = hasSeparator ? splitText[1] : text;
} else if (q.text) {
const urlRegex = /^(https?:\/\/[^\s]+)/;
const urlMatch = q.text.match(urlRegex);
if (urlMatch && !hasSeparator) {
content = {type: 'link',
url: urlMatch[0],
caption: caption || q.text.replace(urlMatch[0], '').trim(),
creator: m.sender
}} else {
content = {type: 'text',
value: hasSeparator ? splitText[0] : q.text,
mentions: q.mentionedJid || [],
creator: m.sender
}}
keyword = hasSeparator ? splitText[1] : text;
} else {
throw `${lenguajeGB['smsAvisoMG']()}  𝙏𝙄𝙋𝙊 𝘿𝙀 𝘾𝙊𝙉𝙏𝙀𝙉𝙄𝘿𝙊 𝙉𝙊 𝙎𝙊𝙋𝙊𝙍𝙏𝘼𝘿𝙊`
}} else {
if (!hasSeparator) {
if (isCommandFormat) throw `${lenguajeGB['smsAvisoMG']()}𝙍𝙀𝙎𝙋𝙊𝙉𝘿𝙀 𝘼𝙇 𝙎𝙏𝙄𝘾𝙆𝙀𝙍 𝙊 𝙄𝙈𝘼𝙂𝙀𝙉 𝘼𝙇 𝘾𝙐𝘼𝙇 𝙌𝙐𝙄𝙀𝙍𝙀 𝘼𝙂𝙍𝙀𝙂𝘼 𝙐𝙉 𝘾𝙊𝙈𝘼𝙉𝘿𝙊 𝙊 𝙏𝙀𝙓𝙏𝙊`;
throw `${lenguajeGB['smsAvisoMG']()}  𝙐𝙎𝘼 𝘿𝙀 𝙀𝙎𝙏𝘼 𝙈𝘼𝙉𝙀𝙍𝘼:*\n*ღ ${usedPrefix + command}* <palabra clave> (responde a contenido)\n"ღ ${usedPrefix + command} <texto> - <palabra clave>*\n*ღ ${usedPrefix + command} <comando>* (responde a sticker/imagen, ej: .help)`
}
content = {type: 'text',
value: splitText[0],
mentions: [],
creator: m.sender
};
keyword = splitText[1];
}

if (!content.type) throw `${lenguajeGB['smsAvisoMG']()}  𝙏𝙄𝙋𝙊 𝘿𝙀 𝘾𝙊𝙉𝙏𝙀𝙉𝙄𝘿𝙊 𝙉𝙊 𝙎𝙊𝙋𝙊𝙍𝙏𝘼𝘿𝙊`

if (isOwner) {
const globalContent = loadGlobalContent();
globalContent[keyword.toLowerCase()] = content;
saveGlobalContent(globalContent);
await m.reply(`${lenguajeGB['smsAvisoEG']()} *${keyword}*. 𝙁𝙐𝙀 𝘼𝙂𝙍𝙀𝙂𝘼𝘿𝙊 𝙂𝙇𝙊𝘽𝘼𝙇𝙈𝙀𝙉𝙏𝙀 𝘼 𝙇𝘼 𝘽𝘼𝙎𝙀 𝘿𝙀 𝘿𝘼𝙏𝙊𝙎 𝘾𝙊𝙍𝙍𝙀𝘾𝙏𝘼𝙈𝙀𝙉𝙏𝙀.`);
} else {
chat.savedContent[keyword.toLowerCase()] = content;
saveLocalContent(localContent);
await m.reply(`${lenguajeGB['smsAvisoEG']()} *${keyword}* 𝙁𝙐𝙀 𝙂𝙐𝘼𝙍𝘿𝘼𝘿𝙊 𝙀𝙉 𝙀𝙎𝙏𝙀 𝘾𝙃𝘼𝙏 𝘾𝙊𝙍𝙍𝙀𝘾𝙏𝘼𝙈𝙀𝙉𝙏𝙀.`);
}
await m.react("✅");
};
handler.help = ['addcmd'];
handler.tags = ['tools'];
handler.command = /^(guardar|save|setcmd|addcmd)$/i;
handler.register = true 
export default handler;