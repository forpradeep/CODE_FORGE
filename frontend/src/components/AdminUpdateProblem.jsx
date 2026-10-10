import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate, useParams, NavLink } from 'react-router';
import Navbar from './Navbar';
import { ChevronLeft, Plus, Trash2, Code2, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminUpdateProblem() {
  const navigate = useNavigate();
  const { problemId } = useParams();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema)
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get(`/problem/adminProblemById/${problemId}`);
        reset(data);
        setLoadError(null);
      } catch (err) {
        setLoadError(err.response?.data?.message || 'Failed to load problem');
      } finally {
        setLoading(false);
      }
    };
    if (problemId) fetchProblem();
  }, [problemId, reset]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      await axiosClient.put(`/problem/update/${problemId}`, data);
      navigate('/admin/update');
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-base-content/10">
          <NavLink to="/admin/update" className="btn btn-sm btn-ghost btn-square rounded-lg">
            <ChevronLeft className="w-5 h-5 text-base-content/70" />
          </NavLink>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
              Edit Problem
            </h1>
            <p className="text-xs text-base-content/60">
              Update test cases, descriptions, and starter code templates.
            </p>
          </div>
        </div>

        {loadError && (
          <div className="alert alert-error text-sm rounded-2xl">
            <AlertCircle className="w-5 h-5" />
            <span>{loadError}</span>
          </div>
        )}

        {submitError && (
          <div className="alert alert-error text-sm rounded-2xl">
            <AlertCircle className="w-5 h-5" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Basic Details */}
          <div className="p-6 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-base-content flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> Problem Metadata
            </h2>

            <div className="form-control">
              <label className="label py-1"><span className="label-text text-xs font-semibold">Title</span></label>
              <input
                {...register('title')}
                className={`input input-bordered h-10 text-sm bg-base-200/50 rounded-xl ${errors.title ? 'input-error' : ''}`}
              />
              {errors.title && <span className="text-error text-xs mt-1">{errors.title.message}</span>}
            </div>

            <div className="form-control">
              <label className="label py-1"><span className="label-text text-xs font-semibold">Description</span></label>
              <textarea
                {...register('description')}
                rows={5}
                className={`textarea textarea-bordered text-xs bg-base-200/50 rounded-xl leading-relaxed ${errors.description ? 'textarea-error' : ''}`}
              />
              {errors.description && <span className="text-error text-xs mt-1">{errors.description.message}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-1"><span className="label-text text-xs font-semibold">Difficulty</span></label>
                <select
                  {...register('difficulty')}
                  className="select select-bordered h-10 min-h-0 text-sm bg-base-200/50 rounded-xl"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1"><span className="label-text text-xs font-semibold">Topic Tag</span></label>
                <select
                  {...register('tags')}
                  className="select select-bordered h-10 min-h-0 text-sm bg-base-200/50 rounded-xl"
                >
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">Dynamic Programming</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Visible Test Cases */}
          <div className="p-6 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-base-content">Visible Test Cases (Examples)</h2>
              <button
                type="button"
                onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                className="btn btn-xs btn-primary rounded-lg font-semibold gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Example</span>
              </button>
            </div>

            <div className="space-y-3">
              {visibleFields.map((field, index) => (
                <div key={field.id} className="p-4 rounded-xl bg-base-200/50 border border-base-content/10 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Example {index + 1}</span>
                    {visibleFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVisible(index)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      {...register(`visibleTestCases.${index}.input`)}
                      placeholder="Input"
                      className="input input-bordered input-sm rounded-lg text-xs font-mono bg-base-100"
                    />
                    <input
                      {...register(`visibleTestCases.${index}.output`)}
                      placeholder="Expected Output"
                      className="input input-bordered input-sm rounded-lg text-xs font-mono bg-base-100"
                    />
                  </div>
                  <input
                    {...register(`visibleTestCases.${index}.explanation`)}
                    placeholder="Explanation"
                    className="input input-bordered input-sm rounded-lg text-xs bg-base-100 w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Hidden Test Cases */}
          <div className="p-6 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-base-content">Hidden Evaluation Test Cases</h2>
              <button
                type="button"
                onClick={() => appendHidden({ input: '', output: '' })}
                className="btn btn-xs btn-primary rounded-lg font-semibold gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Test Case</span>
              </button>
            </div>

            <div className="space-y-3">
              {hiddenFields.map((field, index) => (
                <div key={field.id} className="p-4 rounded-xl bg-base-200/50 border border-base-content/10 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Hidden Case {index + 1}</span>
                    {hiddenFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHidden(index)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      {...register(`hiddenTestCases.${index}.input`)}
                      placeholder="Raw stdin input"
                      className="input input-bordered input-sm rounded-lg text-xs font-mono bg-base-100"
                    />
                    <input
                      {...register(`hiddenTestCases.${index}.output`)}
                      placeholder="Expected stdout output"
                      className="input input-bordered input-sm rounded-lg text-xs font-mono bg-base-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Starter Code & Solutions */}
          <div className="p-6 rounded-2xl bg-base-100 border border-base-content/10 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-base-content flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" /> Starter Code & Solutions
            </h2>

            {['C++', 'Java', 'JavaScript'].map((lang, idx) => (
              <div key={lang} className="p-4 rounded-xl bg-base-200/40 border border-base-content/10 space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-primary">{lang}</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label py-0.5"><span className="label-text text-[11px] font-semibold">Starter Template</span></label>
                    <textarea
                      {...register(`startCode.${idx}.initialCode`)}
                      rows={4}
                      className="textarea textarea-bordered text-xs font-mono bg-base-100 rounded-xl"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-0.5"><span className="label-text text-[11px] font-semibold">Complete Reference Solution</span></label>
                    <textarea
                      {...register(`referenceSolution.${idx}.completeCode`)}
                      rows={4}
                      className="textarea textarea-bordered text-xs font-mono bg-base-100 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <NavLink to="/admin/update" className="btn btn-sm btn-ghost rounded-xl">
              Cancel
            </NavLink>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-sm btn-primary rounded-xl font-bold shadow-md shadow-primary/20"
            >
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AdminUpdateProblem;
