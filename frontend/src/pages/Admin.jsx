import React from 'react';
import { Plus, Edit, Trash2, Video, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router';
import Navbar from '../components/Navbar';

function Admin() {
  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new algorithmic coding problem, starter code, and test cases.',
      icon: Plus,
      color: 'btn-success',
      iconBg: 'bg-emerald-500/10 text-emerald-500',
      accentColor: 'from-emerald-500/20 to-emerald-500/5',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Modify existing descriptions, reference solutions, or test case suites.',
      icon: Edit,
      color: 'btn-warning',
      iconBg: 'bg-amber-500/10 text-amber-500',
      accentColor: 'from-amber-500/20 to-amber-500/5',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Safely remove deprecated problems and test cases from the library.',
      icon: Trash2,
      color: 'btn-error',
      iconBg: 'bg-rose-500/10 text-rose-500',
      accentColor: 'from-rose-500/20 to-rose-500/5',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Editorials',
      description: 'Upload video explanations and thumbnail assets for problems.',
      icon: Video,
      color: 'btn-primary',
      iconBg: 'bg-primary/10 text-primary',
      accentColor: 'from-primary/20 to-primary/5',
      route: '/admin/video'
    }
  ];

  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-10 flex-1 max-w-6xl space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 border border-error/20 text-error text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Administration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-base-content">
            Problem Authoring Studio
          </h1>
          <p className="text-sm text-base-content/60">
            Publish challenges, manage test suites, and upload solution walkthroughs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {adminOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.id}
                className="group relative rounded-3xl bg-base-100 border border-base-content/10 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${option.accentColor} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform`} />

                <div className="space-y-4 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl ${option.iconBg} flex items-center justify-center shadow-inner`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-lg font-bold text-base-content group-hover:text-primary transition-colors">
                      {option.title}
                    </h2>
                    <p className="text-xs text-base-content/65 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 relative z-10">
                  <NavLink
                    to={option.route}
                    className={`btn ${option.color} w-full rounded-xl font-bold shadow-sm gap-2 btn-sm`}
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </NavLink>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Admin;