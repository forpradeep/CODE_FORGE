const { getLanguageById, summarizeJudgeResults } = require('../src/utils/problemUtility');

describe('Judge result grading', () => {
    test('maps supported languages', () => {
        expect(getLanguageById('javascript')).toBe(63);
        expect(getLanguageById('C++')).toBe(54);
        expect(getLanguageById('Java')).toBe(62);
    });

    test('rejects an unknown language', () => {
        expect(() => getLanguageById('python')).toThrow(/Unsupported language/);
    });

    test('accepts only when every case passes', () => {
        const summary = summarizeJudgeResults([
            { status_id: 3, time: '0.01', memory: 1000 },
            { status_id: 3, time: '0.02', memory: 1200 },
        ]);
        expect(summary.status).toBe('accepted');
        expect(summary.testCasesPassed).toBe(2);
        expect(summary.runtime).toBeCloseTo(0.03);
        expect(summary.memory).toBe(1200);
    });

    test('does not accept a mixed or empty result', () => {
        const mixed = summarizeJudgeResults([
            { status_id: 3, time: '0.01', memory: 100 },
            { status_id: 4, stderr: 'wrong' },
        ]);
        expect(mixed.status).toBe('wrong');
        expect(mixed.success).toBe(false);

        const empty = summarizeJudgeResults([]);
        expect(empty.status).toBe('error');
    });

    test('treats compile and runtime failures as errors', () => {
        const summary = summarizeJudgeResults([
            { status_id: 6, compile_output: 'missing semicolon' },
        ]);
        expect(summary.status).toBe('error');
        expect(summary.errorMessage).toContain('missing semicolon');
    });
});
