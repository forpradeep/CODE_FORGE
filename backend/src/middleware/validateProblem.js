const validateProblem = (req, res, next) => {
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '')
        return res.status(400).json({ message: 'Invalid or missing field: title' });

    if (!description || typeof description !== 'string')
        return res.status(400).json({ message: 'Invalid or missing field: description' });

    if (!['easy', 'medium', 'hard'].includes(difficulty))
        return res.status(400).json({ message: 'Invalid or missing field: difficulty (must be easy, medium, or hard)' });

    if (!['array', 'linkedList', 'graph', 'dp'].includes(tags))
        return res.status(400).json({ message: 'Invalid or missing field: tags (must be array, linkedList, graph, or dp)' });

    if (!Array.isArray(visibleTestCases) || visibleTestCases.length === 0)
        return res.status(400).json({ message: 'visibleTestCases must be a non-empty array' });

    if (!Array.isArray(hiddenTestCases) || hiddenTestCases.length === 0)
        return res.status(400).json({ message: 'hiddenTestCases must be a non-empty array' });

    if (visibleTestCases.length + hiddenTestCases.length > 20)
        return res.status(400).json({ message: 'A problem can have at most 20 test cases' });

    if (!Array.isArray(startCode) || startCode.length === 0)
        return res.status(400).json({ message: 'startCode must be a non-empty array' });

    if (!Array.isArray(referenceSolution) || referenceSolution.length === 0)
        return res.status(400).json({ message: 'referenceSolution must be a non-empty array' });

    next();
};

module.exports = { validateProblem };
