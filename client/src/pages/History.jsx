import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { generateMeetingCode } from '../utils/common';
import api from '../axios/axios';
import { log } from '../utils/log';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/format';
import Logo from '../components/common/Logo';
import useDebounce from '../hooks/useDebounce';

import {
  ArrowBack,
  CalendarToday,
  AccessTime,
  ContentCopy,
  Check,
  Delete,
  Refresh,
  Search,
  VideoCameraFront,
  Add,
  ArrowForward,
  History as HistoryIcon
} from '@mui/icons-material';

function History() {
  const { user, clearUserData } = useContext(AuthContext);
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!user) {
      navigate('/Auth');
    }
  }, [user, navigate]);

  const fetchHistory = async (searchValue = search) => {
    setLoading(true);
    try {
      const userId = user?.userId;
      const res = await api.get('/user-history', {
        params: {
          userId,
          search: searchValue?.trim() || ''
        }
      });

      if (res.status === 200) {
        setMeetings(res.data?.meetings || []);
      }
    } catch (error) {
      log('Fetch meeting history error:', error);
      toast.error('Failed to load meeting history');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce((searchValue) => {
    fetchHistory(searchValue);
  }, 500);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const logout = () => {
    clearUserData();
    navigate('/Auth');
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Meeting code copied!');
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const copyLink = (code) => {
    const link = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Meeting link copied!');
  };

  const joinMeeting = (code) => {
    if (code) {
      navigate(`/${encodeURIComponent(code.trim())}`);
    }
  };

  const startNewMeeting = async () => {
    const newMeetingCode = generateMeetingCode();
    try {
      const res = await api.post('/new-meeting', {
        userId: user?.userId || user?._id,
        meetingCode: newMeetingCode
      });
      if (res.status === 200) {
        navigate(`/${newMeetingCode}`);
      }
    } catch (error) {
      log('Create new meeting error:', error);
      toast.error('Could not create meeting');
    }
  };

  const handleDelete = async (meetingId) => {
    try {
      setLoading(true);
      const res = await api.delete(`/delete-meeting/${meetingId}`);
      if (res.status === 200) {
        setMeetings((prev) => prev.filter((m) => m._id !== meetingId));
        toast.success('Meeting removed from history');
      }
    } catch (error) {
      log('Delete meeting error:', error);
      toast.error('Failed to delete meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f8fbfa] font-sans text-secondary-foreground">
      {/* Background ambient gradient glow blobs matching Home */}
      <div className="pointer-events-none absolute -left-32 top-20 h-100 w-100 rounded-full bg-[#d5f4ef]/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-112 w-md rounded-full bg-[#bdece7]/55 blur-3xl" />

      {/* Header */}
      <header className="relative mx-auto flex h-20 max-w-350 items-center justify-between px-5 sm:px-8 lg:px-12" aria-label="Application header">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Account navigation">
          <Link
            to="/home"
            className="flex h-10 items-center gap-1.5 rounded-xl border border-[#e2e9e9] bg-white px-3.5 text-sm font-semibold text-[#505a70] shadow-sm transition hover:border-[#aee8e1] hover:text-primary-link"
            aria-label="Back to Home"
          >
            <ArrowBack className="text-[18px]!" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="h-10 rounded-xl border border-[#e2e9e9] bg-white px-3.5 text-sm font-semibold text-[#505a70] shadow-sm transition hover:border-[#aee8e1] hover:text-primary-link"
          >
            Log out
          </button>
        </nav>
      </header>

      {/* Content Container */}
      <div className="relative mx-auto max-w-350 px-5 pb-20 pt-6 sm:px-8 lg:px-12">
        {/* Title & Actions Bar */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#bce9e4] bg-[#effbf9] px-3 py-1.5 text-xs font-bold tracking-wide text-[#39706f]">
              <HistoryIcon className="text-[16px]! text-[#22c8b8]" />
              ACTIVITY LOG
            </p>
            <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-secondary-foreground sm:text-4xl">
              Meeting History
            </h1>
            <p className="mt-1 text-sm text-[#69738a] sm:text-base">
              Review your previous meetings, copy invite codes, or rejoin active sessions.
            </p>
          </div>

          {/* New Meeting & Refresh Action */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchHistory()}
              disabled={loading}
              title="Refresh history"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dce8e6] bg-white text-[#505a70] shadow-sm transition hover:border-[#aee8e1] hover:text-primary-link active:scale-95 disabled:opacity-50"
            >
              <Refresh className={`text-[20px]! ${loading ? 'animate-spin text-primary-link' : ''}`} />
            </button>
            <button
              type="button"
              onClick={startNewMeeting}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4.5 text-sm font-bold text-white shadow-[0_8px_20px_#20c7bb38] transition hover:bg-primary-hover active:scale-98"
            >
              <Add className="text-[20px]!" />
              <span>New Meeting</span>
            </button>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px]! text-[#98a4b3]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                const val = e.target.value;
                setSearch(val);
                debouncedSearch(val);
              }}
              placeholder="Search by meeting code or date..."
              className="h-11 w-full rounded-xl border border-[#dce8e6] bg-white pl-10 pr-4 text-sm font-medium text-secondary-foreground placeholder-[#98a4b3] shadow-xs outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  fetchHistory('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#8b95a5] hover:text-secondary-foreground"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-[#7e8b9f]">
            Total Meetings:{' '}
            <span className="rounded-lg bg-[#effbf9] px-2 py-1 font-bold text-[#20c9bd]">
              {meetings.length}
            </span>
          </div>
        </div>

        {/* Meeting Cards Section */}
        <div className="mt-6">
          {loading ? (
            /* Skeleton Loading State */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="animate-pulse rounded-2xl border border-[#e5eeec] bg-white p-5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 rounded-md bg-[#eaf1f0]" />
                    <div className="h-4 w-16 rounded-md bg-[#eaf1f0]" />
                  </div>
                  <div className="my-4 h-9 rounded-xl bg-[#f0f6f5]" />
                  <div className="flex gap-2">
                    <div className="h-9 flex-1 rounded-xl bg-[#eaf1f0]" />
                    <div className="h-9 w-10 rounded-xl bg-[#eaf1f0]" />
                  </div>
                </div>
              ))}
            </div>
          ) : meetings.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#cfe2df] bg-white/80 px-6 py-16 text-center shadow-xs backdrop-blur-sm">
              <div className="grid size-16 place-items-center rounded-2xl bg-[#effbf9] text-primary">
                <HistoryIcon className="text-[32px]!" />
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-secondary-foreground">
                {search ? 'No matching meetings found' : 'No meeting history yet'}
              </h3>
              <p className="mt-1.5 max-w-md text-sm text-[#69738a]">
                {search
                  ? `No meetings match "${search}". Try searching with a different code or date.`
                  : 'You have not hosted or created any meetings yet. Start a session now and invite your team!'}
              </p>
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="mt-5 rounded-xl border border-[#dce8e6] bg-white px-4 py-2 text-sm font-semibold text-[#505a70] shadow-xs transition hover:border-primary hover:text-primary"
                >
                  Clear search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startNewMeeting}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_#20c7bb33] transition hover:bg-[#17b8ae]"
                >
                  <Add className="text-[18px]!" />
                  Start a Meeting
                </button>
              )}
            </div>
          ) : (
            /* Meetings Grid */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {meetings.map((meeting) => {
                const dateInfo = formatDate(meeting.date);
                const isCopied = copiedCode === meeting.meetingCode;

                return (
                  <div
                    key={meeting._id || meeting.meetingCode}
                    className="group relative flex flex-col justify-between rounded-2xl border border-[#e5eeec] bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#aee8e1] hover:shadow-md"
                  >
                    <div>
                      {/* Top row: Date/Time and Delete */}
                      <div className="flex items-center justify-between text-xs text-[#7e8b9f]">
                        <div className="flex items-center gap-1.5">
                          <CalendarToday className="text-[14px]! text-[#98a4b3]" />
                          <span className="font-semibold text-[#485368]">{dateInfo.date}</span>
                          {dateInfo.time && (
                            <>
                              <span className="text-[#cbd5e1]">•</span>
                              <AccessTime className="text-[14px]! text-[#98a4b3]" />
                              <span>{dateInfo.time}</span>
                            </>
                          )}
                        </div>

                        {meeting._id && (
                          <button
                            type="button"
                            onClick={() => handleDelete(meeting._id)}
                            title="Delete from history"
                            className="rounded-lg p-1 text-[#a0abbb]  transition hover:bg-[#fee2e2] hover:text-[#ef4444] group-hover:opacity-100 disabled:opacity-50"
                          >
                            <Delete className="text-[17px]!" />
                          </button>
                        )}
                      </div>

                      {/* Middle: Meeting Code Pill */}
                      <div className="mt-4 rounded-xl border border-[#e4eeec] bg-[#f9fcfa] p-3 transition group-hover:border-[#bdece7] group-hover:bg-[#f2faf8]">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="grid size-7 place-items-center rounded-lg bg-white text-primary shadow-xs">
                              <VideoCameraFront className="text-[16px]!" />
                            </span>
                            <span className="font-mono text-base font-bold tracking-wide text-secondary-foreground">
                              {meeting.meetingCode}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyCode(meeting.meetingCode)}
                            title="Copy meeting code"
                            className="grid size-8 place-items-center rounded-lg border border-[#dbe7e5] bg-white text-[#505a70] shadow-xs transition hover:border-primary hover:text-primary active:scale-95"
                          >
                            {isCopied ? (
                              <Check className="text-[16px]! text-emerald-500" />
                            ) : (
                              <ContentCopy className="text-[15px]!" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => joinMeeting(meeting.meetingCode)}
                        className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-xs font-bold text-white shadow-xs transition hover:bg-[#17b8ae] active:scale-98"
                      >
                        <span>Rejoin</span>
                        <ArrowForward className="text-[15px]!" />
                      </button>

                      <button
                        type="button"
                        onClick={() => copyLink(meeting.meetingCode)}
                        title="Copy meeting link"
                        className="flex h-10 items-center justify-center rounded-xl border border-[#dce8e6] bg-white px-3 text-xs font-semibold text-[#505a70] shadow-xs transition hover:border-[#aee8e1] hover:text-[#1bbdb4] active:scale-95"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default History;
