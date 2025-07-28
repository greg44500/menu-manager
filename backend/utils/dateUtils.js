/**
 * Calcule la date du lundi de la semaine ISO pour une année civile donnée
 * @param {Number} weekNumber - Numéro ISO de la semaine (1-based)
 * @param {Number} year - Année civile
 * @returns {Date} Date du lundi de la semaine spécifiée
 */
function getMondayFromISOWeek(weekNumber, year) {
  const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  const dow = simple.getDay();
  let monday = simple;
  if (dow <= 4) {
    monday.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    monday.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return monday;
}

module.exports.getMondayFromISOWeek = getMondayFromISOWeek;
