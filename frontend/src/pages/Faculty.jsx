import React from 'react';
import { Users, ClipboardList, BookOpen, ArrowRight, ShieldCheck, Award } from 'lucide-react';
import { NavLink } from 'react-router';
import Navbar from '../components/Navbar';

function Faculty() {
  const facultyOptions = [
    {
      id: 'sections',
      title: 'Class Sections & Rosters',
      description: 'Create student cohorts, manage enrolled student rosters, and assign tests by section.',
      icon: Users,
      color: 'btn-primary',
      accentColor: 'from-primary/20 to-primary/5',
      iconBg: 'bg-primary/10 text-primary',
      route: '/faculty/sections'
    },
    {
      id: 'tests',
      title: 'Timed Assessments & Exams',
      description: 'Schedule coding assessments, pick problems from the library, set time windows, and evaluate submissions.',
      icon: ClipboardList,
      color: 'btn-warning',
      accentColor: 'from-warning/20 to-warning/5',
      iconBg: 'bg-warning/10 text-warning',
      route: '/faculty/tests'
    }
  ];

  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-10 flex-1 max-w-5xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 border border-warning/20 text-warning text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Faculty Management Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-base-content">
            Academic Assessment Hub
          </h1>
          <p className="text-sm text-base-content/60">
            Orchestrate coding assignments, organize student sections, and review performance analytics.
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-4">
          {facultyOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.id}
                className="group relative rounded-3xl bg-base-100 border border-base-content/10 p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${option.accentColor} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform`} />

                <div className="space-y-4 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl ${option.iconBg} flex items-center justify-center shadow-inner`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-base-content group-hover:text-primary transition-colors">
                      {option.title}
                    </h2>
                    <p className="text-xs text-base-content/70 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 relative z-10">
                  <NavLink
                    to={option.route}
                    className={`btn ${option.color} w-full rounded-xl font-bold shadow-md gap-2`}
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

export default Faculty;
