export function getMonthStart(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}
export function getMonthEnd(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}
export function getNextMonthSameDay(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const targetMonth = month + 1;
    const targetYear = year + Math.floor(targetMonth / 12);
    const targetMonthIndex = targetMonth % 12;
    const lastDayOfTargetMonth = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
    return new Date(targetYear, targetMonthIndex, Math.min(day, lastDayOfTargetMonth), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
}
export function getCurrentMonthWindow(date) {
    return {
        startsAt: getMonthStart(date),
        endsAt: getMonthEnd(date),
    };
}
export function getNextBillingWindow(date) {
    const currentMonthStart = getMonthStart(date);
    const nextMonthStart = addCalendarMonths(currentMonthStart, 1);
    return {
        startsAt: nextMonthStart,
        endsAt: getMonthEnd(nextMonthStart),
    };
}
export function getDaysRemaining(now, endDate) {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    return Math.max(0, Math.floor((endOfDay.getTime() - startOfToday.getTime()) / 86400000));
}
export function addCalendarMonths(date, months) {
    const targetMonth = date.getMonth() + months;
    const year = date.getFullYear() + Math.floor(targetMonth / 12);
    const monthIndex = ((targetMonth % 12) + 12) % 12;
    return new Date(year, monthIndex, 1);
}
