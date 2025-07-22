exports.getMondayFromWeek = (weekNumber, startMonth = 8) => {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, startMonth, 1); // ex: 1er septembre
    const dayOfWeek = startDate.getDay();
    const firstMonday = new Date(startDate);

    if (dayOfWeek !== 1) {
        firstMonday.setDate(startDate.getDate() + ((8 - dayOfWeek) % 7));
    }

    const serviceDate = new Date(firstMonday);
    serviceDate.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);

    return serviceDate;
};