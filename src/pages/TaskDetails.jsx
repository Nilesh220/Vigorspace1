import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Star, CheckCircle, Clock, XCircle } from 'lucide-react';
import Footer from '../components/layout/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const STATUS_ICONS = {
  pending:  { icon: Clock, color: '#F5C842', label: 'Pending Review' },
  approved: { icon: CheckCircle, color: '#4CAF50', label: 'Approved' },
  rejected: { icon: XCircle, color: '#E8576D', label: 'Rejected' },
};

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [task, setTask] = useState(null);
  const [submission, setSubmission] = useState(null); // existing submission if any
  const [loading, setLoading] = useState(true);
  const [proofLink, setProofLink] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      // Load task
      const { data: taskData, error: taskErr } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (taskErr || !taskData) {
        navigate('/earn');
        return;
      }
      setTask(taskData);

      // Load existing submission for this user + task
      if (user) {
        const { data: sub } = await supabase
          .from('task_submissions')
          .select('*')
          .eq('user_id', user.id)
          .eq('task_id', id)
          .maybeSingle();
        setSubmission(sub);
      }

      setLoading(false);
    }
    load();
  }, [id, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    let proofUrl = null;

    // Upload proof file if provided
    if (file) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('task-proofs')
        .upload(path, file, { upsert: false });

      if (uploadErr) {
        setSubmitError('File upload failed: ' + uploadErr.message);
        setSubmitting(false);
        return;
      }
      proofUrl = path;
    }

    // Insert submission
    const { error: subErr } = await supabase.from('task_submissions').insert({
      user_id: user.id,
      task_id: id,
      proof_url: proofUrl,
      proof_link: proofLink || null,
    });

    if (subErr) {
      setSubmitError(subErr.message);
    } else {
      setSubmitSuccess(true);
      // Re-fetch submission
      const { data: newSub } = await supabase
        .from('task_submissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_id', id)
        .single();
      setSubmission(newSub);
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const steps = Array.isArray(task.steps) ? task.steps : [];
  const statusInfo = submission ? STATUS_ICONS[submission.status] : null;

  return (
    <div className="task-detail-page">
      <div style={{ padding: '30px 60px' }}>
        {/* Task Image */}
        <div className="task-detail-image">
          {task.image_url ? (
            <img src={task.image_url} alt={task.title} />
          ) : (
            <div style={{
              height: 300,
              background: 'linear-gradient(135deg, #E8576D, #D14A5E)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
            }}>
              <span style={{ fontSize: '5rem' }}>🎯</span>
            </div>
          )}
          {task.badge_label && (
            <div
              className="task-exclusive-badge"
              style={{ background: task.badge_color || '#E8576D' }}
            >
              <Star size={12} fill="currentColor" /> {task.badge_label}
            </div>
          )}
        </div>

        {/* Task Content */}
        <div className="task-detail-content">
          <h1 className="task-detail-title font-bungee">{task.title}</h1>
          <div className="task-detail-points">Points: {task.points}</div>

          {task.description && (
            <div className="task-detail-section">
              <h4>TASK DESCRIPTION:</h4>
              <p>{task.description}</p>
            </div>
          )}

          {steps.length > 0 && (
            <div className="task-detail-section">
              <h4>STEPS TO COMPLETE THE TASK:</h4>
              <ol>
                {steps.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </div>
          )}

          {/* Submission / Status Section */}
          {submission ? (
            <div className="task-detail-section">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 20px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${statusInfo.color}`,
              }}>
                <statusInfo.icon size={22} color={statusInfo.color} />
                <div>
                  <div style={{ fontWeight: 700, color: statusInfo.color }}>{statusInfo.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                    Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="task-detail-section">
                <h4>PROOF OF COMPLETION:</h4>
                <p style={{ marginBottom: 8, fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
                  Screenshot of your completed task:
                </p>
                <div
                  className="upload-area"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  <Upload size={16} />
                  <span>{file ? file.name : 'Upload'}</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => setFile(e.target.files[0] || null)}
                />

                <p style={{ margin: '16px 0 8px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
                  Link to your proof (optional):
                </p>
                <input
                  className="task-link-input"
                  placeholder="Enter link here..."
                  value={proofLink}
                  onChange={e => setProofLink(e.target.value)}
                />
              </div>

              {submitError && (
                <div style={{ color: '#E8576D', fontSize: '0.85rem', marginBottom: 16 }}>
                  {submitError}
                </div>
              )}

              <div className="task-apply-section">
                <p>Ready to submit for review?</p>
                <div className="hint">
                  Click 'Submit' once you've added your proof. Our team will review and award your points.
                </div>
                <button
                  type="submit"
                  className="btn-apply"
                  disabled={submitting}
                >
                  {submitting ? <span className="spinner-sm" /> : 'SUBMIT'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
