import { expect } from 'chai';
import {
    addMinutes,
    isTimeBetween,
    timeToMinutes,
    minutesToTime,
    generateTimeSlots,
    timeRangesOverlap,
    getDuration
} from '../../src/utils/time';

describe('Time Utilities', () => {
    describe('addMinutes', () => {
        it('should add minutes to time correctly', () => {
            expect(addMinutes('10:00', 30)).to.equal('10:30');
            expect(addMinutes('10:30', 45)).to.equal('11:15');
            expect(addMinutes('23:30', 45)).to.equal('00:15');
        });

        it('should handle hour overflow', () => {
            expect(addMinutes('10:00', 120)).to.equal('12:00');
            expect(addMinutes('22:00', 180)).to.equal('01:00');
        });
    });

    describe('isTimeBetween', () => {
        it('should correctly identify time within range', () => {
            expect(isTimeBetween('12:00', '11:00', '13:00')).to.be.true;
            expect(isTimeBetween('11:00', '11:00', '13:00')).to.be.true;
            expect(isTimeBetween('13:00', '11:00', '13:00')).to.be.false;
        });

        it('should handle edge cases', () => {
            expect(isTimeBetween('10:59', '11:00', '13:00')).to.be.false;
            expect(isTimeBetween('13:01', '11:00', '13:00')).to.be.false;
        });
    });

    describe('timeToMinutes', () => {
        it('should convert time to minutes correctly', () => {
            expect(timeToMinutes('00:00')).to.equal(0);
            expect(timeToMinutes('01:00')).to.equal(60);
            expect(timeToMinutes('12:30')).to.equal(750);
            expect(timeToMinutes('23:59')).to.equal(1439);
        });
    });

    describe('minutesToTime', () => {
        it('should convert minutes to time correctly', () => {
            expect(minutesToTime(0)).to.equal('00:00');
            expect(minutesToTime(60)).to.equal('01:00');
            expect(minutesToTime(750)).to.equal('12:30');
            expect(minutesToTime(1439)).to.equal('23:59');
        });
    });

    describe('generateTimeSlots', () => {
        it('should generate time slots correctly', () => {
            const slots = generateTimeSlots('09:00', '11:00', 30);
            expect(slots).to.deep.equal(['09:00', '09:30', '10:00', '10:30']);
        });

        it('should handle different intervals', () => {
            const slots = generateTimeSlots('10:00', '12:00', 60);
            expect(slots).to.deep.equal(['10:00', '11:00']);
        });
    });

    describe('timeRangesOverlap', () => {
        it('should detect overlapping ranges', () => {
            expect(timeRangesOverlap('10:00', '12:00', '11:00', '13:00')).to.be.true;
            expect(timeRangesOverlap('10:00', '12:00', '09:00', '11:00')).to.be.true;
        });

        it('should detect non-overlapping ranges', () => {
            expect(timeRangesOverlap('10:00', '12:00', '12:00', '14:00')).to.be.false;
            expect(timeRangesOverlap('10:00', '12:00', '08:00', '10:00')).to.be.false;
        });
    });

    describe('getDuration', () => {
        it('should calculate duration correctly', () => {
            expect(getDuration('10:00', '11:00')).to.equal(60);
            expect(getDuration('10:00', '12:30')).to.equal(150);
            expect(getDuration('09:00', '09:45')).to.equal(45);
        });
    });
});