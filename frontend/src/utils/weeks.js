import { getISOWeek, getISOWeekYear } from 'date-fns';

// Génère la liste des semaines incluses dans une plage de dates (session)
export function getWeeksOfSession(startDate, endDate) {
    const weeks = [];
    let current = new Date(startDate);
    endDate = new Date(endDate);

    // Force le départ au lundi
    current.setDate(current.getDate() - current.getDay() + 1);

    while (current <= endDate) {
        const weekNumber = getISOWeek(current);
        const year = getISOWeekYear(current);
        weeks.push({
            weekNumber,
            year,
            date: new Date(current),
        });
        current.setDate(current.getDate() + 7);
    }
    // Filtrage doublons : deux années scolaires peuvent inclure deux fois semaine 1, etc.
    return weeks.filter((w, i, arr) =>
        arr.findIndex(v => v.weekNumber === w.weekNumber && v.year === w.year) === i
    );
}