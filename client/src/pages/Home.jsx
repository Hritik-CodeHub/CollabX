import { useContext, useState } from 'react';
import { Add, ArrowForward, History as HistoryIcon, LockOutlined, VideoCameraFront } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { generateMeetingCode } from '../utils/common';
import api from '../axios/axios';
import { log } from '../utils/log';
import Logo from '../components/common/Logo';

function Home() {
  const [meetingCode, setMeetingCode] = useState('');
  const navigate = useNavigate();
  const { user, clearUserData } = useContext(AuthContext);
  const firstName = user?.name?.trim().split(' ')[0];

  const joinMeeting = (event) => {
    event.preventDefault();
    const code = meetingCode.trim();
    if (code) navigate(`/${encodeURIComponent(code)}`);
  };

  const startMeeting = async () => {
    const newMeetingCode = generateMeetingCode();

    try {
      const res = await api.post('/new-meeting', {
        userId: user?.userId,
        meetingCode: newMeetingCode,
      }
      )
      if (res.status == 200) {
        navigate(`/${newMeetingCode}`);
      }
    } catch (error) {
      log("Create new meeting error", error);
    }
  }

  const logout = () => {
    clearUserData();
    navigate('/Auth');
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fbfa] font-sans text-secondary-foreground">
      <div className="pointer-events-none absolute -left-32 top-20 h-100 w-100 rounded-full bg-[#d5f4ef]/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-112 w-md rounded-full bg-[#bdece7]/55 blur-3xl" />

      <header className="relative mx-auto flex h-20 max-w-350 items-center justify-between px-5 sm:px-8 lg:px-12" aria-label="Application header">
        <Logo/>
        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Account navigation">
          <Link to="/history" className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#5f6880] transition hover:bg-white hover:text-primary-link" aria-label="Meeting history">
            <HistoryIcon className="text-[19px]!" />
            <span className="hidden sm:inline">History</span>
          </Link>
          <button type="button" onClick={logout} className="h-10 rounded-xl border border-[#e2e9e9] bg-white px-3.5 text-sm font-semibold text-[#505a70] shadow-sm transition hover:border-[#aee8e1] hover:text-[#1bbdb4]">Log out</button>
        </nav>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-350 items-center gap-13 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1fr_.9fr] lg:gap-20 lg:px-12 lg:pt-0" aria-labelledby="home-heading">
        <div className="max-w-155">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bce9e4] bg-[#effbf9] px-3.5 py-2 text-xs font-bold tracking-wide text-[#39706f]">
            <span className="size-2 rounded-full bg-[#22c8b8]" /> SIMPLE. SECURE. CONNECTED.</p>
          <h1 id="home-heading" className="text-[42px] font-extrabold leading-[1.03] tracking-[-0.065em] text-secondary-foreground sm:text-[58px]">
            Your next great<br />conversation starts
            <span className="text-[#1fc6ba]"> here.</span>
          </h1>
          <p className="mt-5 max-w-120 text-base leading-relaxed text-[#69738a] sm:text-lg">{firstName ? `Welcome back, ${firstName}. ` : ''}Meet, learn and collaborate with anyone, from anywhere — in just one click.</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startMeeting}
              className="inline-flex h-13 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-[0_12px_24px_#20c7bb42] transition hover:-translate-y-0.5 hover:bg-[#17b8ae] focus:outline-none focus:ring-4 focus:ring-[#29c8bd]/25">
              <Add className="text-xl!" />
              Start a new meeting
            </button>
          </div>
        </div>

        <aside id="join" className="relative rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-[0_24px_60px_#3343661c] backdrop-blur sm:p-8" aria-labelledby="join-heading">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-[#20bdb3]">
            <VideoCameraFront className="text-[25px]!" />
          </div>
          <h2 id="join-heading" className="mt-6 text-2xl font-extrabold tracking-[-0.045em] text-secondary-foreground">
            Join a meeting
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#788196]">Enter the meeting code shared with you to get connected.</p>
          <form className="mt-6" onSubmit={joinMeeting}>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[.12em] text-[#69738a]" htmlFor="meeting-code">Meeting code</label>
            <input
              id="meeting-code"
              value={meetingCode}
              onChange={(event) => setMeetingCode(event.target.value)}
              placeholder="e.g. ABC-1234-XYZ"
              className="h-13 w-full rounded-xl border border-[#dfe8e7] bg-[#fbfdfd] px-4 text-sm font-medium text-[#28334b] outline-none transition placeholder:font-normal placeholder:text-[#a9afbd] focus:border-primary focus:bg-white focus:ring-4 focus:ring-[#29c8bd]/10"
            />
            <button
              type="submit" disabled={!meetingCode.trim()}
              className="mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white shadow-[0_11px_22px_#20c7bb38] transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-[#afe2dd] disabled:shadow-none">
              Join meeting
              <ArrowForward
                className="text-lg!" />
            </button>
          </form>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[#8a92a3]"><LockOutlined className="text-[14px]!" /> Your meetings are private and secure</p>
        </aside>
      </section>
    </main>
  );
}

export default Home;
