import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Clock, Star, Users, ArrowRight, Video } from 'lucide-react';
import { Course } from '../../types';

interface SearchCourseViewProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

export const SearchCourseView: React.FC<SearchCourseViewProps> = ({
  courses,
  onSelectCourse
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesText =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.level && course.level.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesText) return false;
      if (selectedTag === 'all') return true;
      if (selectedTag === 'online') return course.isOnlineCourse;
      if (selectedTag === 'intermediate') return course.level?.toLowerCase() === 'intermediate';
      if (selectedTag === 'advanced') return course.level?.toLowerCase() === 'advanced';
      return true;
    });
  }, [courses, searchTerm, selectedTag]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Search Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md">
        <h2 className="text-2xl font-bold text-slate-900 font-serif mb-1">
          Search Courses
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-4">
          Discover certified syllabus tracks, Google Meet live cohorts, and industry accreditations.
        </p>

        {/* Input field */}
        <div className="relative max-w-2xl">
          <input
            id="search-course-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type matching words (e.g. React, Cloud, DevOps, AI, Mastery)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 shadow-inner"
          />
          <Search className="w-5 h-5 text-emerald-600 absolute left-3.5 top-3.5" />
        </div>

        {/* Filter tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { id: 'all', label: 'All Courses' },
            { id: 'online', label: 'Google Meet Live' },
            { id: 'intermediate', label: 'Intermediate' },
            { id: 'advanced', label: 'Advanced' }
          ].map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedTag === tag.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white/70 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Showing {filteredCourses.length} Matching Course{filteredCourses.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => onSelectCourse(course)}
            className="rounded-2xl glass-card border border-white/90 overflow-hidden shadow-sm flex flex-col group cursor-pointer"
          >
            <div className="relative h-44 overflow-hidden bg-slate-100">
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {course.isOnlineCourse && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold flex items-center gap-1 border border-emerald-400/30">
                  <Video className="w-3 h-3 text-emerald-400" />
                  Google Meet Live
                </div>
              )}
              {course.level && (
                <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-white/90 text-slate-800 text-[11px] font-semibold backdrop-blur-sm shadow-sm">
                  {course.level}
                </div>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 font-serif text-base line-clamp-2 group-hover:text-emerald-700 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1 text-slate-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{course.duration}</span>
                </div>
                <span className="text-base font-extrabold text-emerald-800 font-serif">
                  ₹{course.price.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group-hover:bg-emerald-600 group-hover:text-white"
              >
                <span>View Full Course Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="rounded-2xl glass-panel p-12 text-center border border-white/80 max-w-md mx-auto space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-700 font-serif">No Matching Courses Found</h4>
          <p className="text-xs text-slate-500">
            Try adjusting your search keyword or clearing the filters above.
          </p>
        </div>
      )}
    </div>
  );
};
