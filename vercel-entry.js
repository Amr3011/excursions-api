/**
 * نقطة دخول خاصة بـ Vercel
 *
 * هذا الملف يقوم بتشغيل السيرفر مباشرة كما لو كان يعمل من خلال node watch.js
 */

// استيراد السيرفر
const server = require("./src/server");

// تصدير السيرفر ليتم تشغيله بواسطة Vercel
module.exports = server;
