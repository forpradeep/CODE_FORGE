import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams, useSearchParams, NavLink, useNavigate } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import { 
  Play, 
  Send, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  FileCode, 
  History, 
  Video, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ChevronLeft,
  Code2,
  Terminal,
  Layers,
  Cpu
} from 'lucide-react';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  const { problemId } = useParams();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const testId = searchParams.get('testId');
  const [testRemainingSeconds, setTestRemainingSeconds] = useState(null);
  const [testLocked, setTestLocked] = useState(false);

  // In test mode, poll the attempt for countdown & lock status
  useEffect(() => {
    if (!testId) return;

    const poll = async () => {
      try {
        const { data } = await axiosClient.get(`/test/${testId}/attempt`);
        setTestRemainingSeconds(data.remainingSeconds);
        setTestLocked(data.attempt.status !== 'in-progress');
      } catch {
        // Backend enforces deadline
      }
    };

    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [testId]);

  useEffect(() => {
    if (testRemainingSeconds === null || testLocked) return;
    if (testRemainingSeconds <= 0) return;
    const tick = setInterval(() => {
      setTestRemainingSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(tick);
  }, [testRemainingSeconds, testLocked]);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(response.data);
        const initialCode = response.data.startCode?.find(sc => sc.language === langMap[selectedLanguage])?.initialCode || '';
        setCode(initialCode);
      } catch (error) {
        setLoadError(error.response?.data?.message || 'This problem could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Update starter code when language changes
  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode?.find(sc => sc.language === langMap[selectedLanguage])?.initialCode || '';
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleResetCode = () => {
    if (problem) {
      const initialCode = problem.startCode?.find(sc => sc.language === langMap[selectedLanguage])?.initialCode || '';
      setCode(initialCode);
    }
  };

  const handleRun = async () => {
    if (testId && testLocked) {
      alert('Your test attempt has ended — you can no longer run code.');
      return;
    }
    setRunning(true);
    setRunResult(null);
    setActiveRightTab('testcase');
    
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage,
        ...(testId && { testId })
      });
      setRunResult(response.data);
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: error.response?.data?.message || 'Execution error'
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (testId && testLocked) {
      alert('Your test attempt has ended — you can no longer submit.');
      return;
    }
    setSubmitting(true);
    setSubmitResult(null);
    setActiveRightTab('result');
    
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code,
        language: selectedLanguage,
        ...(testId && { testId })
      });
      setSubmitResult(response.data);
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({
        accepted: false,
        error: error.response?.data?.message || 'Submission failed'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return <span className="badge badge-sm font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">Easy</span>;
      case 'medium':
        return <span className="badge badge-sm font-semibold bg-amber-500/15 text-amber-600 border border-amber-500/20">Medium</span>;
      case 'hard':
        return <span className="badge badge-sm font-semibold bg-rose-500/15 text-rose-600 border border-rose-500/20">Hard</span>;
      default:
        return <span className="badge badge-sm badge-neutral">{difficulty || 'Unknown'}</span>;
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-base-100 gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="text-xs text-base-content/60 font-semibold tracking-wider uppercase">Loading Workspace...</span>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-base-100 px-4 text-center">
        <p className="text-sm text-base-content/70">{loadError || 'This problem could not be loaded.'}</p>
        <button type="button" onClick={() => navigate('/')} className="btn btn-sm btn-primary">Back to problems</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-base-100 lg:overflow-hidden select-none">
      {/* Test Mode Banner if active */}
      {testId && (
        <div className={`flex items-center justify-between px-4 py-2 text-xs font-bold ${
          testLocked ? 'bg-error text-error-content' : 'bg-warning/20 text-warning-content border-b border-warning/30'
        }`}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>
              {testLocked
                ? 'Test attempt completed and locked.'
                : 'Timed Assessment in Progress'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {!testLocked && testRemainingSeconds !== null && (
              <span className="font-mono text-sm font-black px-2 py-0.5 rounded bg-warning text-warning-content">
                {formatTime(testRemainingSeconds)} Remaining
              </span>
            )}
            <NavLink to={`/tests/${testId}`} className="btn btn-xs btn-ghost border border-current">
              Test Overview
            </NavLink>
          </div>
        </div>
      )}

      {/* Top Workspace Header Bar */}
      <div className="h-14 border-b border-base-content/10 px-4 flex items-center justify-between bg-base-100/90 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(testId ? `/tests/${testId}` : '/')}
            className="btn btn-sm btn-ghost btn-square rounded-lg"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5 text-base-content/70" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <h1 className="font-extrabold text-sm sm:text-base text-base-content tracking-tight">
              {problem?.title || 'Problem Workspace'}
            </h1>
            {problem?.difficulty && getDifficultyBadge(problem.difficulty)}
            {problem?.tags && (
              <span className="badge badge-sm badge-ghost text-[11px] capitalize hidden sm:inline-flex">
                {problem.tags}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls & Language Picker */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center p-1 rounded-xl bg-base-200/80 border border-base-content/5">
            {['javascript', 'java', 'cpp'].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedLanguage === lang
                    ? 'bg-primary text-primary-content shadow-sm'
                    : 'text-base-content/60 hover:text-base-content'
                }`}
              >
                {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JS' : 'Java'}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetCode}
            className="btn btn-sm btn-ghost btn-square rounded-lg text-base-content/60 hover:text-base-content"
            title="Reset to starter code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRun}
            disabled={running || submitting}
            className="btn btn-sm btn-outline rounded-xl font-bold gap-1.5"
          >
            {running ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span className="hidden sm:inline">Run</span>
          </button>

          {/* Submit Solution Button */}
          <button
            onClick={handleSubmitCode}
            disabled={running || submitting}
            className="btn btn-sm btn-primary rounded-xl font-bold shadow-md shadow-primary/20 gap-1.5"
          >
            {submitting ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Main Split Panels */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left Panel: Description, Editorial, Solutions, Submissions, AI Chat */}
        <div className="w-full lg:w-1/2 min-h-[50vh] lg:min-h-0 flex flex-col border-b lg:border-b-0 lg:border-r border-base-content/10 bg-base-100">
          {/* Left Navigation Tabs */}
          <div className="flex items-center gap-1 px-3 pt-2 border-b border-base-content/10 bg-base-200/30 overflow-x-auto flex-shrink-0">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                activeLeftTab === 'description'
                  ? 'border-primary text-primary bg-base-100 shadow-sm'
                  : 'border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>

            {!testId && (
              <>
                <button
                  onClick={() => setActiveLeftTab('editorial')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                    activeLeftTab === 'editorial'
                      ? 'border-primary text-primary bg-base-100 shadow-sm'
                      : 'border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/50'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Editorial</span>
                </button>

                <button
                  onClick={() => setActiveLeftTab('solutions')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                    activeLeftTab === 'solutions'
                      ? 'border-primary text-primary bg-base-100 shadow-sm'
                      : 'border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/50'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Solutions</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveLeftTab('submissions')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                activeLeftTab === 'submissions'
                  ? 'border-primary text-primary bg-base-100 shadow-sm'
                  : 'border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions</span>
            </button>

            {!testId && (
              <button
                onClick={() => setActiveLeftTab('chatAI')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                  activeLeftTab === 'chatAI'
                    ? 'border-primary text-primary bg-base-100 shadow-sm'
                    : 'border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                <span>AI Assistant</span>
              </button>
            )}
          </div>

          {/* Left Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 select-text">
            {activeLeftTab === 'description' && problem && (
              <div className="space-y-6 max-w-none">
                <div className="flex items-center justify-between pb-4 border-b border-base-content/10">
                  <h2 className="text-xl font-bold text-base-content">{problem.title}</h2>
                  {getDifficultyBadge(problem.difficulty)}
                </div>

                <div className="text-sm leading-relaxed text-base-content/85 whitespace-pre-wrap font-sans">
                  {problem.description}
                </div>

                {/* Examples */}
                {problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                      Example Test Cases:
                    </h3>
                    <div className="space-y-3">
                      {problem.visibleTestCases.map((tc, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-base-200/60 border border-base-content/10 space-y-2 text-xs font-mono">
                          <span className="font-bold text-base-content font-sans block mb-1">Example {idx + 1}</span>
                          <div><span className="text-base-content/50 font-bold">Input:</span> <span className="text-base-content">{tc.input}</span></div>
                          <div><span className="text-base-content/50 font-bold">Output:</span> <span className="text-primary font-bold">{tc.output}</span></div>
                          {tc.explanation && (
                            <div className="pt-1 text-base-content/70 font-sans"><strong className="text-base-content">Explanation:</strong> {tc.explanation}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeLeftTab === 'editorial' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Video Editorial</h3>
                <Editorial 
                  secureUrl={problem?.secureUrl} 
                  thumbnailUrl={problem?.thumbnailUrl} 
                  duration={problem?.duration}
                />
              </div>
            )}

            {activeLeftTab === 'solutions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Reference Solutions</h3>
                {problem?.referenceSolution?.length > 0 ? (
                  <div className="space-y-4">
                    {problem.referenceSolution.map((sol, i) => (
                      <div key={i} className="rounded-xl border border-base-content/10 overflow-hidden">
                        <div className="bg-base-200/80 px-4 py-2 text-xs font-bold flex justify-between items-center">
                          <span>{sol.language} Solution</span>
                        </div>
                        <pre className="p-4 bg-base-300 text-xs font-mono overflow-x-auto">
                          <code>{sol.completeCode}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-base-content/50">Solutions will be available once you complete the challenge.</p>
                )}
              </div>
            )}

            {activeLeftTab === 'submissions' && (
              <SubmissionHistory problemId={problemId} />
            )}

            {activeLeftTab === 'chatAI' && (
              <ChatAi problem={problem} />
            )}
          </div>
        </div>

        {/* Right Panel: Monaco Code Editor + Output Console */}
        <div className="w-full lg:w-1/2 min-h-[50vh] lg:min-h-0 flex flex-col bg-base-100">
          {/* Right Navigation Tabs */}
          <div className="flex items-center justify-between px-3 pt-2 border-b border-base-content/10 bg-base-200/30 flex-shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveRightTab('code')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all ${
                  activeRightTab === 'code'
                    ? 'border-primary text-primary bg-base-100 shadow-sm'
                    : 'border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/50'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Editor</span>
              </button>

              <button
                onClick={() => setActiveRightTab('testcase')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all ${
                  activeRightTab === 'testcase'
                    ? 'border-primary text-primary bg-base-100 shadow-sm'
                    : 'border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/50'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Testcase Output</span>
                {runResult && (
                  <span className={`w-2 h-2 rounded-full ${runResult.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                )}
              </button>

              <button
                onClick={() => setActiveRightTab('result')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all ${
                  activeRightTab === 'result'
                    ? 'border-primary text-primary bg-base-100 shadow-sm'
                    : 'border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Submission Result</span>
                {submitResult && (
                  <span className={`w-2 h-2 rounded-full ${submitResult.accepted ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                )}
              </button>
            </div>
          </div>

          {/* Right Tab Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {activeRightTab === 'code' && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1">
                  <Editor
                    height="100%"
                    language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'java' ? 'java' : 'javascript'}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', monospace",
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      folding: true,
                      lineDecorationsWidth: 10,
                      renderLineHighlight: 'line',
                      cursorBlinking: 'smooth',
                      padding: { top: 12, bottom: 12 }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Test Case Execution Output */}
            {activeRightTab === 'testcase' && (
              <div className="flex-1 p-6 overflow-y-auto select-text space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-base-content/60">Execution Results</h3>
                  {runResult && (
                    <span className={`badge ${runResult.success ? 'badge-success' : 'badge-error'} font-semibold text-xs`}>
                      {runResult.success ? 'All Passed' : 'Test Failed'}
                    </span>
                  )}
                </div>

                {running ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <span className="loading loading-spinner loading-md text-primary"></span>
                    <span className="text-xs text-base-content/60">Executing test runner in container...</span>
                  </div>
                ) : runResult ? (
                  <div className="space-y-4">
                    {/* Performance metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-base-200/60 border border-base-content/10 flex items-center gap-3">
                        <Clock className="w-4 h-4 text-primary" />
                        <div>
                          <span className="text-[11px] text-base-content/50 block font-semibold">Runtime</span>
                          <span className="text-xs font-bold">{runResult.runtime || '0.00'} sec</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-base-200/60 border border-base-content/10 flex items-center gap-3">
                        <Cpu className="w-4 h-4 text-secondary" />
                        <div>
                          <span className="text-[11px] text-base-content/50 block font-semibold">Memory</span>
                          <span className="text-xs font-bold">{runResult.memory || '0'} KB</span>
                        </div>
                      </div>
                    </div>

                    {/* Test Cases Output list */}
                    {runResult.error && (
                      <p className="text-xs text-error font-medium">{runResult.error}</p>
                    )}

                    {runResult.testCases && (
                      <div className="space-y-3">
                        {runResult.testCases.map((tc, idx) => {
                          const passed = tc.status_id === 3;
                          return (
                            <div key={idx} className="p-4 rounded-xl bg-base-200/50 border border-base-content/10 space-y-2 text-xs font-mono">
                              <div className="flex items-center justify-between font-sans">
                                <span className="font-bold text-base-content">Testcase {idx + 1}</span>
                                <span className={`flex items-center gap-1 font-bold ${passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                  {passed ? 'Passed' : 'Failed'}
                                </span>
                              </div>
                              <div><span className="text-base-content/50 font-bold">Input:</span> <span className="text-base-content">{tc.stdin}</span></div>
                              <div><span className="text-base-content/50 font-bold">Expected:</span> <span className="text-base-content">{tc.expected_output}</span></div>
                              <div><span className="text-base-content/50 font-bold">Output:</span> <span className="text-primary font-bold">{tc.stdout}</span></div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 text-xs text-base-content/50 space-y-2">
                    <Play className="w-8 h-8 mx-auto text-base-content/30" />
                    <p>Click "Run" to execute your code against the example test cases.</p>
                  </div>
                )}
              </div>
            )}

            {/* Submission Result Output */}
            {activeRightTab === 'result' && (
              <div className="flex-1 p-6 overflow-y-auto select-text space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-base-content/60">Submission Summary</h3>

                {submitting ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <span className="loading loading-spinner loading-md text-primary"></span>
                    <span className="text-xs text-base-content/60">Evaluating full test suite...</span>
                  </div>
                ) : submitResult ? (
                  <div className={`p-6 rounded-2xl border ${
                    submitResult.accepted 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-600'
                  } space-y-4`}>
                    <div className="flex items-center gap-3">
                      {submitResult.accepted ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      ) : (
                        <XCircle className="w-8 h-8 text-rose-500" />
                      )}
                      <div>
                        <h4 className="text-xl font-extrabold">
                          {submitResult.accepted ? 'Accepted 🎉' : (submitResult.error || 'Wrong Answer')}
                        </h4>
                        <p className="text-xs text-base-content/70 mt-0.5">
                          Passed {submitResult.passedTestCases || 0} of {submitResult.totalTestCases || 0} test cases
                        </p>
                      </div>
                    </div>

                    {submitResult.accepted && (
                      <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-base-content font-mono">
                        <div className="p-3 rounded-xl bg-base-100/60 border border-base-content/10">
                          <span className="text-base-content/50 block font-sans">Runtime</span>
                          <span>{submitResult.runtime || '0.00'} sec</span>
                        </div>
                        <div className="p-3 rounded-xl bg-base-100/60 border border-base-content/10">
                          <span className="text-base-content/50 block font-sans">Memory</span>
                          <span>{submitResult.memory || '0'} KB</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 text-xs text-base-content/50 space-y-2">
                    <Send className="w-8 h-8 mx-auto text-base-content/30" />
                    <p>Click "Submit" to grade your code against all hidden test cases.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;