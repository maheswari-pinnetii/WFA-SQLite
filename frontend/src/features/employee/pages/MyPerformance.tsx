import React, { useState, useEffect } from 'react';
import { AnalyticsOverview } from '../../../components/dashboard/AnalyticsOverview';
import { Star, Award, Target } from 'lucide-react';
import { performanceApi } from '../../../api/endpoints/performance.api';
import { RoleGuard } from '../../../security/guards/RoleGuard';
import { Role } from '../../../security/roles/roles';

export const MyPerformance: React.FC = () => {
  const [cycles, setCycles] = useState<any[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCycles();
  }, []);

  useEffect(() => {
    if (selectedCycleId) {
      fetchReviews();
    } else {
      setReviews([]);
    }
  }, [selectedCycleId]);

  const fetchCycles = async () => {
    try {
      const res = await performanceApi.getCycles();
      if (res.success) {
        setCycles(res.data);
        if (res.data.length > 0) {
          setSelectedCycleId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await performanceApi.getReviews(selectedCycleId, 'me');
      if (res.success) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Extract average rating for UI display
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 'N/A';

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">My Performance Scorecard</h2>
            <p className="text-sm text-slate-400">Quarterly KPI achievements, feedback, and skill ratings</p>
          </div>
          <div>
            <select
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-md focus:ring-rose-500 focus:border-rose-500 block p-2"
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
            >
              {cycles.length === 0 && <option value="">No Cycles Available</option>}
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase">Overall Rating</span>
              <Star size={18} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black">{averageRating} / 5.0</div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Average score from reviewers</p>
          </div>

          <div className="glass-panel p-5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase">Reviews Received</span>
              <Target size={18} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black">{reviews.length}</div>
            <p className="text-xs text-slate-400 mt-1 font-medium">For selected cycle</p>
          </div>

          <div className="glass-panel p-5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase">Peer Recognition</span>
              <Award size={18} className="text-cyan-400" />
            </div>
            <div className="text-2xl font-black">4 Kudos</div>
            <p className="text-xs text-slate-400 mt-1 font-medium">Q2 Excellence Awards</p>
          </div>
        </div>

        {/* Detailed Reviews */}
        <div className="glass-panel p-6 mt-6">
          <h3 className="text-base font-bold mb-4">Detailed Feedback</h3>
          {loading ? (
            <div className="text-slate-400">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-slate-400 py-4 text-center">No reviews submitted yet for this cycle.</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r, index) => (
                <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-200">Rating: {r.rating} / 5</span>
                    <span className="text-xs text-slate-400">{new Date(r.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-300">{r.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <AnalyticsOverview title="My Live Performance Analytics" subtitle="Personal performance trend, productivity and workforce skills" compact />
      </div>
    </>
  );
};
