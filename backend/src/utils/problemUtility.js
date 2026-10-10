const axios = require('axios');

const LANGUAGE_IDS = {
    'c++': 54,
    java: 62,
    javascript: 63,
};

const JUDGE_LIMITS = {
    cpu_time_limit: 2,
    wall_time_limit: 5,
    memory_limit: 128000,
    max_processes_and_or_threads: 60,
    enable_network: false,
};

const MAX_POLL_ATTEMPTS = 20;
const CHUNK_SIZE = 10;

const encode = (value) => Buffer.from(String(value ?? ''), 'utf8').toString('base64');

const decode = (value) => {
    if (value == null || value === '') return '';
    return Buffer.from(String(value), 'base64').toString('utf8');
};

const getLanguageById = (lang) => {
    const id = LANGUAGE_IDS[String(lang || '').toLowerCase()];
    if (!id) {
        const err = new Error(`Unsupported language: ${lang || 'missing'}`);
        err.status = 400;
        throw err;
    }
    return id;
};

const judgeHeaders = () => {
    if (!process.env.JUDGE0_KEY) {
        const err = new Error('Code execution is not configured');
        err.status = 503;
        throw err;
    }
    return {
        'x-rapidapi-key': process.env.JUDGE0_KEY,
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'Content-Type': 'application/json',
    };
};

const submitBatch = async (submissions) => {
    if (!Array.isArray(submissions) || submissions.length === 0) {
        const err = new Error('No test cases to run');
        err.status = 400;
        throw err;
    }
    if (submissions.length > CHUNK_SIZE) {
        const err = new Error('Too many test cases in one batch');
        err.status = 400;
        throw err;
    }

    const encoded = submissions.map((submission) => ({
        ...JUDGE_LIMITS,
        language_id: submission.language_id,
        source_code: encode(submission.source_code),
        stdin: encode(submission.stdin),
        expected_output: encode(submission.expected_output),
    }));

    try {
        const response = await axios.post(
            'https://judge0-ce.p.rapidapi.com/submissions/batch',
            { submissions: encoded },
            {
                params: { base64_encoded: 'true' },
                headers: judgeHeaders(),
                timeout: 20000,
            }
        );

        if (!Array.isArray(response.data)) {
            const err = new Error('Code runner returned an unexpected response');
            err.status = 502;
            throw err;
        }
        return response.data;
    } catch (error) {
        if (error.status) throw error;
        console.error('Judge0 batch error:', error.message);
        const err = new Error('Code runner is unavailable. Try again shortly.');
        err.status = 502;
        throw err;
    }
};

const waiting = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

const fetchTokens = async (tokens) => {
    try {
        const response = await axios.get(
            'https://judge0-ce.p.rapidapi.com/submissions/batch',
            {
                params: {
                    tokens: tokens.join(','),
                    base64_encoded: 'true',
                    fields: 'token,status_id,stdout,stderr,compile_output,time,memory,stdin,expected_output,message',
                },
                headers: judgeHeaders(),
                timeout: 20000,
            }
        );
        return response.data;
    } catch (error) {
        console.error('Judge0 poll error:', error.message);
        const err = new Error('Code runner is unavailable. Try again shortly.');
        err.status = 502;
        throw err;
    }
};

const decodeResult = (result) => ({
    token: result.token,
    status_id: result.status_id,
    time: result.time,
    memory: result.memory,
    stdin: decode(result.stdin),
    expected_output: decode(result.expected_output),
    stdout: decode(result.stdout),
    stderr: decode(result.stderr),
    compile_output: decode(result.compile_output),
    message: decode(result.message),
});

const submitToken = async (resultToken) => {
    if (!Array.isArray(resultToken) || resultToken.length === 0) {
        const err = new Error('Code runner did not return submission tokens');
        err.status = 502;
        throw err;
    }

    let latest = [];
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        const result = await fetchTokens(resultToken);
        latest = Array.isArray(result?.submissions) ? result.submissions : [];

        if (latest.length === resultToken.length && latest.every((item) => item.status_id > 2)) {
            return latest.map(decodeResult);
        }
        await waiting(1000);
    }

    const err = new Error('Code runner timed out before every test finished');
    err.status = 504;
    err.partial = latest.map(decodeResult);
    throw err;
};

const executeTests = async (submissions) => {
    const results = [];
    for (let i = 0; i < submissions.length; i += CHUNK_SIZE) {
        const chunk = submissions.slice(i, i + CHUNK_SIZE);
        const created = await submitBatch(chunk);
        const tokens = created.map((item) => item?.token);
        if (tokens.some((token) => !token)) {
            const err = new Error('Code runner rejected one or more test cases');
            err.status = 502;
            throw err;
        }
        results.push(...await submitToken(tokens));
    }
    return results;
};

// Judge0: 3 accepted, 4 wrong answer, <=2 still running, everything else is an error.
const summarizeJudgeResults = (testResult) => {
    if (!Array.isArray(testResult) || testResult.length === 0) {
        return {
            status: 'error',
            success: false,
            testCasesPassed: 0,
            runtime: 0,
            memory: 0,
            errorMessage: 'No results from the code runner',
        };
    }

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let sawWrong = false;
    let sawError = false;
    let errorMessage = null;

    for (const test of testResult) {
        const statusId = Number(test.status_id);
        if (statusId === 3) {
            testCasesPassed += 1;
            const time = parseFloat(test.time);
            if (!Number.isNaN(time)) runtime += time;
            memory = Math.max(memory, Number(test.memory) || 0);
            continue;
        }

        const detail = test.stderr || test.compile_output || test.message || null;
        if (statusId === 4) {
            sawWrong = true;
            errorMessage = errorMessage || detail || 'Wrong answer';
        } else {
            sawError = true;
            errorMessage = detail || (statusId <= 2 ? 'Timed out waiting for a result' : 'Execution error');
        }
    }

    let status = 'accepted';
    if (sawError) status = 'error';
    else if (sawWrong || testCasesPassed !== testResult.length) status = 'wrong';

    return {
        status,
        success: status === 'accepted',
        testCasesPassed,
        runtime,
        memory,
        errorMessage: errorMessage ? String(errorMessage).slice(0, 2000) : null,
    };
};

const publicRunCase = (test) => ({
    status_id: test.status_id,
    stdin: test.stdin,
    expected_output: test.expected_output,
    stdout: test.stdout,
    stderr: test.stderr || null,
    compile_output: test.compile_output || null,
    time: test.time,
    memory: test.memory,
});

module.exports = {
    getLanguageById,
    submitBatch,
    submitToken,
    executeTests,
    summarizeJudgeResults,
    publicRunCase,
};
