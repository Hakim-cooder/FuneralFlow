import test from 'node:test';
import assert from 'node:assert/strict';
import { addCalendarMonths, getCurrentMonthWindow, getDaysRemaining, getMonthEnd, getMonthStart, getNextBillingWindow, getNextMonthSameDay } from '../src/utils/subscriptionDates.js';
test('advances to the first day of the next calendar month', () => {
    const jan31 = new Date(2024, 0, 31);
    const feb1 = addCalendarMonths(jan31, 1);
    assert.equal(feb1.getFullYear(), 2024);
    assert.equal(feb1.getMonth(), 1);
    assert.equal(feb1.getDate(), 1);
});
test('returns the first day of the current month', () => {
    const date = new Date(2023, 1, 15);
    const start = getMonthStart(date);
    assert.equal(start.getFullYear(), 2023);
    assert.equal(start.getMonth(), 1);
    assert.equal(start.getDate(), 1);
});
test('returns the last day of the current month including leap years', () => {
    const leapDate = new Date(2024, 1, 15);
    const end = getMonthEnd(leapDate);
    assert.equal(end.getFullYear(), 2024);
    assert.equal(end.getMonth(), 1);
    assert.equal(end.getDate(), 29);
});
test('returns the full calendar month window for the current billing period', () => {
    const date = new Date(2024, 6, 17);
    const window = getCurrentMonthWindow(date);
    assert.equal(window.startsAt.getFullYear(), 2024);
    assert.equal(window.startsAt.getMonth(), 6);
    assert.equal(window.startsAt.getDate(), 1);
    assert.equal(window.endsAt.getMonth(), 6);
    assert.equal(window.endsAt.getDate(), 31);
});
test('returns the next full billing window after an existing active subscription date', () => {
    const currentEndsAt = new Date(2024, 6, 31);
    const window = getNextBillingWindow(currentEndsAt);
    assert.equal(window.startsAt.getFullYear(), 2024);
    assert.equal(window.startsAt.getMonth(), 7);
    assert.equal(window.startsAt.getDate(), 1);
    assert.equal(window.endsAt.getFullYear(), 2024);
    assert.equal(window.endsAt.getMonth(), 7);
    assert.equal(window.endsAt.getDate(), 31);
});
test('returns the next month with same day when extending an active subscription', () => {
    const currentEndsAt = new Date(2026, 6, 31, 12, 0, 0);
    const nextSameDay = getNextMonthSameDay(currentEndsAt);
    assert.equal(nextSameDay.getFullYear(), 2026);
    assert.equal(nextSameDay.getMonth(), 7);
    assert.equal(nextSameDay.getDate(), 31);
    assert.equal(nextSameDay.getHours(), 12);
});
test('counts remaining calendar days without overcounting the time-of-day', () => {
    const now = new Date(2024, 6, 17, 14, 30);
    const endDate = new Date(2024, 6, 31, 23, 59, 59, 999);
    assert.equal(getDaysRemaining(now, endDate), 14);
});
