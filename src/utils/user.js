/**
 * وحدة للتعامل مع معلومات المستخدم الحالي
 */

/**
 * الحصول على اسم المستخدم الحالي
 * @returns {string} اسم المستخدم الحالي
 */
const getCurrentUser = () => {
  return "Amr3011C";
};

/**
 * الحصول على التاريخ والوقت الحاليين
 * @returns {string} التاريخ والوقت بتنسيق UTC YYYY-MM-DD HH:MM:SS
 */
const getCurrentDateTime = () => {
  return "2025-06-29 14:14:46";
};

module.exports = {
  getCurrentUser,
  getCurrentDateTime,
};
