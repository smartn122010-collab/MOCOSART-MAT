import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Video, 
  Clock, 
  Image as ImageIcon, 
  Check, 
  X, 
  ExternalLink,
  Upload
} from 'lucide-react';
import { Course } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { compressImageFile } from '../../utils/imageCompressor';

interface AdminCourseExploreProps {
  courses: Course[];
  onRefresh: () => void;
}

export const AdminCourseExplore: React.FC<AdminCourseExploreProps> = ({
  courses,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState<number>(4999);
  const [isOnlineCourse, setIsOnlineCourse] = useState(true);
  const [meetLink, setMeetLink] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingCourse(null);
    setTitle('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80');
    setDuration('8 Weeks (32 Hours)');
    setPrice(4999);
    setIsOnlineCourse(true);
    setMeetLink('https://meet.google.com/moc-new-class');
    setLevel('Intermediate');
    setShowModal(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description);
    setImageUrl(course.imageUrl);
    setDuration(course.duration);
    setPrice(course.price);
    setIsOnlineCourse(course.isOnlineCourse);
    setMeetLink(course.meetLink || '');
    setLevel(course.level || 'Intermediate');
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 800, 0.75);
        setImageUrl(compressed);
      } catch (err) {
        console.warn("Image compression fallback:", err);
        const reader = new FileReader();
        reader.onloadend = () => setImageUrl(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSaveAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a course title.");
      return;
    }
    setSaving(true);
    try {
      const courseData = {
        title: title.trim(),
        description: description.trim() || 'Comprehensive industry curriculum with live sessions and mentor support.',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        duration: duration.trim() || '8 Weeks (32 Hours)',
        price: Math.max(0, Number(price) || 0),
        isOnlineCourse: Boolean(isOnlineCourse),
        meetLink: isOnlineCourse ? (meetLink.trim() || 'https://meet.google.com/moc-class') : '',
        level: level || 'Intermediate',
        published: true,
        createdAt: editingCourse?.createdAt || new Date().toISOString()
      };

      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), courseData);
      } else {
        await addDoc(collection(db, 'courses'), courseData);
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      console.error("Failed to save course:", err);
      alert(`Failed to save course: ${err?.message || 'Please check your connection.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, 'courses', id));
    } catch (err) {
      console.warn("Firestore delete notice (id may be fallback):", err);
    }
    onRefresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="rounded-2xl glass-panel p-6 border border-white/80 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Course Explore & Curriculum Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Publish courses, configure live Google Meet links, and manage student offerings.
          </p>
        </div>

        <button
          id="admin-add-course-btn"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Courses List Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="rounded-2xl glass-card border border-white/90 overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {course.isOnlineCourse && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                    <Video className="w-3 h-3 text-emerald-400" />
                    Google Meet
                  </div>
                )}
                <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-white/90 text-slate-800 text-[11px] font-bold">
                  ₹{course.price.toLocaleString()}
                </div>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-bold text-slate-900 font-serif text-base leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    {course.duration}
                  </span>
                  <span className="font-medium text-emerald-800">{course.level}</span>
                </div>

                {course.isOnlineCourse && course.meetLink && (
                  <div className="text-[11px] text-slate-500 truncate pt-1">
                    Meet: <a href={course.meetLink} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">{course.meetLink}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons: Edit & Delete */}
            <div className="p-5 pt-0 flex gap-2">
              <button
                type="button"
                onClick={() => openEditModal(course)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Course</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCourse(course.id, course.title)}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                title="Delete Course"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl glass-panel p-6 md:p-8 border border-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                {editingCourse ? 'Edit Course Details' : 'Add New Learning Course'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAndPublish} className="overflow-y-auto pr-1 my-3 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Advanced Cloud DevOps & AI Architectures"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Course Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive curriculum breakdown..."
                  className="w-full p-3 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              {/* Course Image Upload / URL */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700">Course Image (Upload File or Enter URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                {imageUrl && (
                  <img src={imageUrl} alt="Preview" className="w-full h-28 object-cover rounded-xl border border-slate-200" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Course Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 10 Weeks (40 Hours)"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Online Course Enable Button & Google Meet Link */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 cursor-pointer">
                    <Video className="w-4 h-4 text-emerald-600" />
                    <span>Enable Online Live Course via Google Meet</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={isOnlineCourse}
                    onChange={(e) => setIsOnlineCourse(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {isOnlineCourse && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Paste Google Meet Live Link
                    </label>
                    <input
                      type="url"
                      value={meetLink}
                      onChange={(e) => setMeetLink(e.target.value)}
                      placeholder="https://meet.google.com/xxx-yyyy-zzz"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-800"
                      required={isOnlineCourse}
                    />
                  </div>
                )}
              </div>

              {/* Save and Publish Button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="admin-save-course-btn"
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Publishing...' : 'Save & Publish Course'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
