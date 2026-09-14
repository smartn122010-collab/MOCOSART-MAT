import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Check, 
  X, 
  UserCheck, 
  Linkedin, 
  Twitter 
} from 'lucide-react';
import { Founder } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { compressImageFile } from '../../utils/imageCompressor';

interface AdminFoundersProps {
  founders: Founder[];
  onRefresh: () => void;
}

export const AdminFounders: React.FC<AdminFoundersProps> = ({
  founders,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingFounder, setEditingFounder] = useState<Founder | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingFounder(null);
    setName('');
    setRole('Co-Founder & Academic Director');
    setDescription('');
    setPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80');
    setShowModal(true);
  };

  const openEditModal = (f: Founder) => {
    setEditingFounder(f);
    setName(f.name);
    setRole(f.role || '');
    setDescription(f.description);
    setPhotoUrl(f.photoUrl);
    setShowModal(true);
  };

  // "photo upload only my files"
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 600, 0.75);
        setPhotoUrl(compressed);
      } catch (err) {
        console.warn("Image compression fallback:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSaveAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter the founder's full name.");
      return;
    }
    setSaving(true);

    try {
      const founderData = {
        name: name.trim(),
        role: role.trim() || 'Co-Founder & Academic Director',
        description: description.trim() || 'Founding leader and distinguished educational director at Mocosart.',
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        order: editingFounder?.order || founders.length + 1
      };

      if (editingFounder) {
        await updateDoc(doc(db, 'founders', editingFounder.id), founderData);
      } else {
        await addDoc(collection(db, 'founders'), founderData);
      }

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      console.error("Failed to save founder:", err);
      alert(`Failed to save founder information: ${err?.message || 'Please check your connection.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFounder = async (id: string, founderName: string) => {
    try {
      await deleteDoc(doc(db, 'founders', id));
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
            Founders Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage company leadership profiles displayed on the Home Screen and certificate accreditations.
          </p>
        </div>

        <button
          id="admin-add-founder-btn"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Founder Profile</span>
        </button>
      </div>

      {/* Founders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {founders.map((founder) => (
          <div
            key={founder.id}
            className="rounded-2xl glass-card border border-white/90 p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={founder.photoUrl}
                  alt={founder.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-md"
                />
                <div>
                  <h3 className="font-bold text-slate-900 font-serif text-lg leading-tight">
                    {founder.name}
                  </h3>
                  <p className="text-xs text-emerald-800 font-medium mt-0.5">
                    {founder.role}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {founder.description}
              </p>
            </div>

            {/* Actions: Edit and Delete */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => openEditModal(founder)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
              <button
                type="button"
                onClick={() => handleDeleteFounder(founder.id, founder.name)}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                title="Delete Founder"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Founder Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel p-5 sm:p-7 border border-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                {editingFounder ? 'Edit Founder Information' : 'Add Founder Details'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAndPublish} className="my-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Founder Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Arvind Mocosart"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Executive Title / Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Co-Founder & Chief Academic Director"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Biography & Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Background, degrees, institutional vision..."
                  className="w-full p-2.5 rounded-xl glass-input text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>

              {/* Photo upload only my files */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700">
                  Photo Upload (Only My Files)
                </label>
                <div className="flex items-center gap-4">
                  {photoUrl && (
                    <img src={photoUrl} alt="Preview" className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                  )}
                  <label className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Choose Photo from My Files</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Save & Publish */}
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="admin-save-founder-btn"
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Publishing...' : 'Save & Publish Founder'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
